# tds.skill

TalexDreamSoul 的全局 Agent Skill，记录默认的内容、设计和 Cloudflare 部署约定。

## 安装

```bash
git clone https://github.com/TalexDreamSoul/tds.skill ~/.pi/agent/skills/tds.skill
```

Pi 会自动发现 `SKILL.md`。命令名为：

```text
/skill:tds-skill
```

## 更新

```bash
cd ~/.pi/agent/skills/tds.skill
git pull --ff-only
```

仓库更新后，新会话会自动读取最新规则。

## 适用场景

- 部署到 Cloudflare 或 Wrangler
- 发布 `*.tagzxia.com` 文档站
- 将研究、报告或指南整理成克制精简的网站

## 原则

最少的技术，最少的话，完整地交付。

## License

MIT
