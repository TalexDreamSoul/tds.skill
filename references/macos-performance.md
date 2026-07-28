# macOS 性能诊断与安全维护参考

## 目标

定位 macOS 卡顿时，先证明瓶颈属于 CPU、图形合成、内存换页、磁盘 I/O、进程泄漏还是后台服务，再执行最小修复。不要把高 Swap、僵尸进程或磁盘接近满载单独当成根因。

## 操作边界

- 默认先做只读诊断，不结束进程、不删除文件、不清缓存、不修改系统服务。
- `kill`、日志截断、软件覆盖安装、`sudo`、LaunchDaemon 变更都需要用户明确授权。
- 用户明确授权某个编号处置项后，只执行该项及其必要的安全收尾，不扩大范围。
- 不使用 `kill -9` 起步；先发 `SIGTERM`，等待并验证，只有普通终止失败且用户授权停止该进程时才考虑升级信号。
- 不广泛执行 `pkill node`、`pkill workerd` 或清空整个 `/private/var/folders`。必须按父进程、命令路径和归属精确筛选。
- 不在输出中暴露 VPN peer、公网地址、令牌、配置文件密钥或完整私有日志。

## 第一阶段：建立只读基线

### 系统和容量

```bash
sw_vers
uname -a
uptime
sysctl -n hw.memsize hw.ncpu hw.physicalcpu hw.logicalcpu machdep.cpu.brand_string
df -h / /System/Volumes/Data
diskutil info / | rg 'Device Identifier|Solid State|Container Free Space|File System Personality'
diskutil info disk0 | rg 'Device / Media Name|Protocol|Solid State|SMART Status|Disk Size'
```

判断原则：

- SMART 正常只说明没有明显硬件故障，不代表磁盘 I/O 没有成为瓶颈。
- APFS 数据卷最好保留约 15% 至 20% 空间，开发机还要考虑构建缓存和 Swap。
- `load average` 高于核心数说明可运行或不可中断任务堆积，但需要结合 CPU idle、进程状态和 I/O 判断来源。

### CPU、进程与图形合成

```bash
top -l 3 -n 25 -o cpu -stats pid,command,cpu,mem,threads,state,time -s 2
ps -axo user,pid,ppid,state,%cpu,%mem,rss,etime,command | sort -k5 -nr | head -n 40
system_profiler SPDisplaysDataType 2>/dev/null | rg 'Resolution|Main Display|Mirror|Online|Connection Type'
pmset -g therm
```

重点关联：

- `WindowServer`、浏览器 GPU、Electron Renderer 同时高占用，通常属于图形合成链路，而不是三个独立问题。
- 高分辨率外接屏、AirPlay/Sidecar、频繁动画和大量浏览器渲染进程会放大 WindowServer 压力。
- `kernel_task` 高占用可能来自系统调用、I/O、驱动或热管理；先检查热状态，不直接处理它。
- 构建、测试、多个 Agent 会话和开发服务器并发时，要按工作负载组汇总，不只盯单个 PID。

### 内存与换页

```bash
memory_pressure
vm_stat
sysctl vm.swapusage
vm_stat -c 6 2
```

判断原则：

- Swap 已用量是历史累积指标；只有持续 swap-in/page-in、压缩和解压活动才能证明当前仍在换页抖动。
- 大量压缩内存、接近耗尽的 Swap、低空闲页和活跃 swap-in 同时出现时，UI 卡顿通常是内存压力的直接结果。
- 查找近期 Jetsam 记录作为旁证：

```bash
find /Library/Logs/DiagnosticReports -name 'JetsamEvent-*.ips' -mtime -2 -print
```

只提取 `largestProcess`、`memoryStatus` 等摘要，不复制完整报告。

### 磁盘 I/O 与空间

```bash
iostat -w 2 -c 5
du -x -d 1 -h "$HOME" 2>/dev/null
```

扫描较大目录时逐层缩小范围，例如 `Workspace`、`Library/Application Support`、`Library/Containers`、`Library/Group Containers`、`.cache`、包管理器缓存和 `/private/var`。

注意：

- `du`、`find`、Spotlight 查询本身会制造磁盘读取和 CPU 负载。
- 并行容量扫描完成后，确认没有遗留 `du`/`find` 进程，再重新进行 8 至 10 秒干净采样。
- iCloud 占位文件的逻辑大小不等于本地实际占用，不要把 `mdfind` 的文件大小直接当成可释放空间。

## 僵尸与子进程泄漏

### 定位

```bash
ps -axo state,pid,ppid,%cpu,%mem,rss,etime,command | awk 'NR==1 || $1 ~ /^Z/'
ps -axo state=,ppid= | awk '$1 ~ /^Z/ {c[$2]++} END {for (p in c) print c[p],p}' | sort -nr
```

僵尸进程通常是结果而不是性能根因：它不占 RSS，也不消耗 CPU；真正的问题是父进程没有调用 `wait` 回收退出状态。持续增长的僵尸和同类休眠子进程可以证明父进程存在生命周期泄漏。

### 安全回收顺序

1. 记录目标父进程的完整命令、工作目录、父 PID、子进程数和僵尸数。
2. 确认它是孤儿、重复实例或用户明确允许停止的服务。
3. 对父进程发送 `SIGTERM`，最多等待约 15 秒。
4. 验证父进程已退出、僵尸已被 `launchd` 回收。
5. 检查子进程是否变成 `PPID=1` 的孤儿；仅按已确认的可执行路径和旧父进程归属筛选，再发送 `SIGTERM`。
6. 保留当前有效实例，并重新统计总进程、僵尸、目标子进程和当前工作目录。

示意模板：

```bash
kill -TERM "$parent_pid"
for _ in $(seq 1 15); do
  kill -0 "$parent_pid" 2>/dev/null || break
  sleep 1
done
```

不要依赖 PID 长期不变。执行前必须重新读取命令行和父子关系。

## NetBird 日志风暴与稳定版更新

### 诊断

```bash
ps -axo user,pid,ppid,state,%cpu,%mem,etime,command | rg -i '[N]et[Bb]ird'
netbird version
pkgutil --pkg-info io.netbird.client
plutil -p /Library/LaunchDaemons/netbird.plist
stat -f '%Sp %Su:%Sg %z %Sm %N' /var/log/netbird*.log /var/log/netbird/client.log 2>/dev/null
lsof /var/log/netbird.out.log 2>/dev/null
```

NetBird 守护进程已经通过 `--log-file /var/log/netbird/client.log` 写主日志时，`StandardOutPath=/var/log/netbird.out.log` 的数 GB 内容通常是历史 stdout 日志风暴。先检查修改时间、是否仍被打开、末尾是否重复同一类错误，再决定处理。

普通用户执行 `netbird service status` 可能因为无法查询系统 LaunchDaemon 而误报 `Stopped`。最终状态以以下命令和 root 进程为准：

```bash
launchctl print system/netbird
ps -axo user,pid,ppid,state,%cpu,%mem,etime,command | rg '[N]et[Bb]ird'
```

### 更新前验证

1. 从 NetBird 官方 GitHub Release API 获取最新稳定版本和适配当前架构的 `.pkg`。
2. 比较安装时间、包收据版本和 `netbird version`。版本号相同但二进制带 `rc` 后缀时，仍可能是稳定版发布前安装的候选构建。
3. 下载后同时验证 GitHub Release asset 的 SHA-256 digest 与 Apple 签名、公证状态：

```bash
shasum -a 256 /tmp/netbird.pkg
pkgutil --check-signature /tmp/netbird.pkg
```

4. 必要时先用 `pkgutil --expand-full` 解包，在临时目录直接运行新二进制的 `version`，确认不是候选构建。
5. 只有摘要、Developer ID Installer 和 Apple Notarization 都通过后才安装。

不要硬编码版本号或下载地址；每次从官方 Release API 动态发现。不要使用第三方镜像包。

### 安装和日志处理

用户明确授权后，使用系统安装器覆盖安装。官方安装脚本会停止旧服务、安装二进制、重新注册并启动服务。管理员授权应通过可见的 macOS 授权框完成，不索要或记录密码。

旧 stdout/stderr 日志无进程持有且问题已修复时，优先原位截断，保留 inode、属主、权限和 LaunchDaemon 路径：

```bash
/usr/bin/tee /var/log/netbird.out.log </dev/null >/dev/null
/usr/bin/tee /var/log/netbird.err.log </dev/null >/dev/null
```

这些命令需要管理员权限。不要直接删除整个 `/var/log/netbird`，`client.log` 是服务诊断依据。

### 完成验证

- `netbird version` 与官方稳定版一致，不含 `rc`。
- `launchctl print system/netbird` 显示 `state = running` 且存在 PID。
- 只汇总 peer 总数和连接数，不输出 peer 名称、IP、公钥或中继地址。
- 对 stdout、stderr、client 日志记录初始字节数，等待约 8 秒后比较增长。
- 检查 client 日志末尾 1000 行 warning/error 数量。
- 检查被清理日志释放的实际磁盘空间。
- 删除本次创建的 `/tmp` 安装包、校验文件和解包目录。

## 最终报告

按影响排序报告：

1. 直接根因及证据。
2. 次要放大因素。
3. 哪些现象只是结果，例如僵尸、Spotlight 或高 Swap 历史值。
4. 已执行操作及前后数量变化。
5. 未执行的高风险操作。
6. 仍然存在的风险，例如 Swap 尚未回收、当前开发服务继续增长子进程或磁盘空间仍低于目标。

系统已长期重度换页时，即使结束进程，Swap 也不会立即全部下降。完成保存后重启是恢复压缩内存和换页状态最快的手段，但不得替用户自动重启。
