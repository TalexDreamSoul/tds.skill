# tds.skill

TalexDreamSoul 的全局 Agent Skill，用于约束内容表达、目标导向交付、雇主项目推进、长任务分批提交、管理系统默认形态、上游开源贡献、Cloudflare 发布和 macOS 安全运维。原则是先跑通真实主流程、风险进入待办、里程碑形成可回滚提交、少用技术、少说废话、完整验证。

## 内容

`SKILL.md` 覆盖沟通语气、KISS 与 YAGNI 工程取舍、雇主/客户项目的目标与主流程优先级、风险待办、长任务分批提交和向上汇报、管理系统默认形态、部署类默认判断、`*.tagzxia.com` 命名、内容表达、回复长度、风险导向的测试策略、上游开源贡献门禁、视觉克制规则，以及部署与运维两套完成标准。

五份参考按需读取：

- [`references/cloudflare-deploy.md`](references/cloudflare-deploy.md)：Workers Static Assets 配置模板、部署顺序与操作边界。
- [`references/macos-performance.md`](references/macos-performance.md)：只读诊断基线、僵尸与子进程泄漏的安全回收顺序、NetBird 日志风暴与稳定版更新校验。
- [`references/executive-critique.md`](references/executive-critique.md)：锐评视角名册、每个视角的理论映射与质问句、主题维度和好坏样例。
- [`references/open-source-contribution.md`](references/open-source-contribution.md)：贡献协议与 AI 条款醒目门禁、Issue 去重调查、最小 PR 范围、三轮独立审查、Review Bot 评论处理、诚实验证、公开 PR 核验与完成通知边界。
- [`references/employer-project-delivery.md`](references/employer-project-delivery.md)：雇主与商业项目的目标定义、最小真实闭环、风险待办、提醒时机和可直接转发的向上汇报话术。

锐评是低频里程碑要求：只在一条主线完成、方向被证实或推翻、或会话明显收尾时追加；轮换使用真实高管或企业家的判断方式，只针对本次会话材料，必须落到方向层面并给出可推翻条件。

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
