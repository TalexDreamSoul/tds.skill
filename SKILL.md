---
name: tds-skill
description: TalexDreamSoul 的默认交付与部署约定。用户提到部署、上线、发布、Cloudflare、CF、Wrangler、文档站、静态站、tagzxia.com 或要求克制精简时使用。负责选择最小技术栈、按 tagzxia.com 规则命名、直接部署文档类产物，并完成线上验证。
license: MIT
compatibility: Requires Node.js and Wrangler for Cloudflare deployments.
metadata:
  author: TalexDreamSoul
  repository: https://github.com/TalexDreamSoul/tds.skill
---

# TDS Skill

这是老板的默认交付规则。先理解任务，再使用最少的代码完成它。

## 默认判断

- 用户明确说“部署”“上线”“发布到 CF/Cloudflare”时，完成实现、验证和部署，不停在教程或计划。
- 文档、报告、指南、研究总结适合做成静态文档站时，默认直接部署。
- 用户给出域名时，严格使用该域名；未给出时才询问，不能自行公开到随机域名。
- 已有项目优先沿用其技术栈。新建简单文档站优先原生 HTML、CSS、JavaScript。
- 不为了单页文档引入 React、Next.js、数据库或服务端运行时。

## 命名规则

- 自定义域名通常使用 `<项目短名>.tagzxia.com`。
- Cloudflare Worker 名称与域名前缀一致，使用小写 kebab-case。
- 页面标题使用清楚的人类语言，不堆叠 AI、智能、未来等营销词。

## 内容规则

- 结论先说，一屏只讲一个重点。
- 使用最少的话，让第一次接触主题的人也能看懂。
- 一个句子只表达一件事；术语第一次出现时立刻解释。
- 首页只保留：一句结论、一个视觉路线、一个开始入口。
- 文档按认知顺序一步一步展开，不在首页堆完整报告。
- 删除空话、重复结论、夸张形容词和无来源数字。

## 视觉规则

- 克制、安静、清晰。中性色为主，只使用一个强调色。
- 不使用渐变字、玻璃拟态、装饰光球、营销式大卡片阵列。
- 卡片只用于真正独立的内容；章节主要靠留白、细线和排版分组。
- 正文行宽控制在 65 至 75 个字符，移动端保持单栏。
- 支持键盘、减少动态效果偏好和深浅色系统偏好。
- 路线、流程或关系应优先做成真正有信息的图，而不是装饰图片。

## Cloudflare 部署

部署前读取 [Cloudflare 参考](references/cloudflare-deploy.md)，按其中的检查、配置和验证顺序执行。

## 完成标准

- 本地最小验证通过。
- Wrangler 部署成功。
- 自定义域名可访问并返回 `2xx`。
- 页面关键标题和静态资源在线可见。
- 最终只报告网址、实现摘要和验证结果。
