# tds.skill

TalexDreamSoul 的全局 Agent Skill 与路由中枢。TDS 先判断任务目标、平台、动作和风险，再把任务路由到一个最小的领域 Skill；原则是先跑通真实主流程、风险进入待办、里程碑形成可回滚提交、完整整合并验证主线、少用技术、少说废话。

`SKILL.md` 只留通用约束：沟通语气、工程与验证底线、Skill 路由表和触发条件、雇主/客户项目交付、长任务分批提交与图解、仓库级收敛与安全清理、管理系统默认形态、内容与视觉底线，以及部署和运维入口。详细的 UI、Logo、macOS 和发布流程由对应专项 Skill 负责，TDS 只做发现、路由和通用不变量，避免规则重复漂移。

## 参考

按需读取：

- [`references/employer-project-delivery.md`](references/employer-project-delivery.md)：雇主与商业项目的目标定义、最小真实闭环、风险待办、提醒时机和可直接转发的向上汇报话术。
- [`references/chinese-tech-writing.md`](references/chinese-tech-writing.md)：中文技术文档的句子、语气、结构、排版与数字规则，产品手册目录和文件名约定，14 条 AI 腔清单，以及 `autocorrect` 自检流程。整理自 [leter/zh-tech-writing](https://github.com/leter/zh-tech-writing)（MIT）。
- [`references/open-source-contribution.md`](references/open-source-contribution.md)：贡献协议与 AI 条款门禁、Issue 去重调查、最小 PR 范围、三轮独立审查、Review Bot 评论处理、诚实验证、公开 PR 核验与完成通知边界。
- [`references/cloudflare-deploy.md`](references/cloudflare-deploy.md)：Workers Static Assets 配置模板、部署顺序与完成标准、命名约定和操作边界。
- [`references/macos-performance.md`](references/macos-performance.md)：只读诊断基线、僵尸与子进程泄漏的安全回收顺序、NetBird 日志风暴与稳定版更新校验。
- [`references/executive-critique.md`](references/executive-critique.md)：锐评视角名册、每个视角的理论映射与质问句、主题维度和好坏样例。

## 锐评

低频里程碑要求：只在一条主线完成、方向被证实或推翻、或会话明显收尾时追加；轮换使用真实高管或企业家的判断方式，只针对本次会话材料，必须落到方向层面并给出可推翻条件。

## Touch Pie

`@talex-touch/touch-pie` 已内置该 Skill，安装或更新 Pie 后无需再单独克隆：

```bash
npm install -g @talex-touch/touch-pie@latest
touch-pie
```

内置副本由发版时同步，不要单独修改。

## 安装与复用

未使用 Touch Pie 时，克隆到 Pi 的 Skill 目录：

```bash
git clone https://github.com/TalexDreamSoul/tds.skill ~/.pi/agent/skills/tds.skill
```

本仓库是唯一真源。Claude Code、Codex 和 OMP 用符号链接指向同一份克隆，避免出现会各自漂移的副本：

```bash
ln -s ~/.pi/agent/skills/tds.skill ~/.claude/skills/tds-skill
ln -s ~/.pi/agent/skills/tds.skill ~/.codex/skills/tds-skill
ln -s ~/.claude/skills/tds-skill ~/.omp/agent/skills/tds-skill
```

## 更新

```bash
cd ~/.pi/agent/skills/tds.skill
git pull --ff-only
```

License: MIT
