# tds.skill

TalexDreamSoul 的全局 Agent Skill，用于约束内容表达、页面交付、Cloudflare 发布和 macOS 安全运维。原则是少用技术、少说废话、完整验证。

## 内容

`SKILL.md` 覆盖沟通语气、KISS 与 YAGNI 工程取舍、部署类默认判断、`*.tagzxia.com` 命名、内容表达、回复长度、风险导向的测试策略、视觉克制规则，以及部署与运维两套完成标准。

三份参考按需读取：

- [`references/cloudflare-deploy.md`](references/cloudflare-deploy.md)：Workers Static Assets 配置模板、部署顺序与操作边界。
- [`references/macos-performance.md`](references/macos-performance.md)：只读诊断基线、僵尸与子进程泄漏的安全回收顺序、NetBird 日志风暴与稳定版更新校验。
- [`references/executive-critique.md`](references/executive-critique.md)：锐评视角名册、每个视角的理论映射与质问句、主题维度和好坏样例。

其中锐评是常驻要求：每次回复末尾追加一段独立评述，轮换使用一位真实高管或企业家的判断方式，只针对本次会话里的真实材料，必须落到方向层面并给出可推翻的条件。

## Touch Pie

`@talex-touch/touch-pie` 已内置该 Skill，安装或更新 Pie 后无需再单独克隆：

```bash
npm install -g @talex-touch/touch-pie@latest
touch-pie
```

## 独立安装

未使用 Touch Pie 时，可以单独安装：

```bash
git clone https://github.com/TalexDreamSoul/tds.skill ~/.pi/agent/skills/tds.skill
```

Pi 会自动读取 `SKILL.md`，也可以通过 `/skill:tds-skill` 使用。

## 在其他 Agent 中复用

Claude Code 和 Codex 使用同一套 `SKILL.md` 约定，用符号链接指向同一份克隆即可，避免出现会各自漂移的副本：

```bash
ln -s ~/.pi/agent/skills/tds.skill ~/.claude/skills/tds-skill
ln -s ~/.pi/agent/skills/tds.skill ~/.codex/skills/tds-skill
```

本仓库是唯一真源。Touch Pie 内置副本由发版时同步，不要单独修改。

## 独立更新

```bash
cd ~/.pi/agent/skills/tds.skill
git pull --ff-only
```

License: MIT
