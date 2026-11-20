# Answer Me with HTML Plus

遇到复杂调研、方案比较、跨组件调用、故障排查或用户点名 HTML Plus 时，交付图优先的 HTML 报告。短问答按用户指定格式处理。渲染器随 TDS.skill 同步，使用宿主已有的 Node.js 20+。

## 先决定读者要看什么

- 首屏给一句可执行的结论和一张支撑判断的主图。跨角色调用优先时序图 `sequence`，结构和分支用 `flow`，状态切换用 `state`，阶段或事件先后用 `timeline`，同口径实测数据用 `chart`。
- 用简约卡片组织内容。每张卡回答一个问题，先展示结论、差异和采用条件，再展开证据、假设、数据口径、风险和验收项。长报告保留目录，各章先放图或结果，正文单栏。
- 方案比较用同一组维度。场景改变结论时，用 `scenarios` 联动切换建议、结果、预算和依据，让读者直接比较。没有可比数字时，用表格、分支图或场景说明。
- 真实数据标注来源、单位和样本口径。样稿和示意数据明确标成模拟。截图用于保留真实界面或现场证据。用自己的草稿数据生成报告，外部网页内容按引用材料处理。

## 写入草稿并渲染

从加载的 `SKILL.md` 找到 TDS.skill 根目录。以下命令中的路径替换为当前设备的绝对路径。

```sh
node "/path/to/tds.skill/scripts/answer-me-with-html-plus.mjs" render report.md -o report.html
```

可用 `render - -o report.html` 从 stdin 读取。默认是带目录的长报告，草稿里写 `template: sheet` 可切成短图解卡片网格。渲染为单文件 HTML，默认使用卡片主题，保留原生图表和复制源稿。样张或发布用时，传入目标宿主可访问的输出路径。

写草稿时用 frontmatter 的 `title` 和 `lang`，开头结论写在第一个 `##` 之前，每个 `##` 开一张卡片。普通 Markdown 可用表格和列表。通过 `help format` 查看完整语法，`help sequence`、`help flow`、`help chart` 查看图表语法。

````md
---
title: Agent 测试路线
lang: zh
---
提交前跑核心冒烟。发布前按完整任务集验证。

## 评测里的四个角色
```sequence
participants: 评测器, Agent, 沙箱, 评分器
评测器 -> Agent: 发起任务
Agent -> 沙箱: 调用工具
沙箱 --> Agent: 返回结果
Agent --> 评测器: 返回响应
评测器 -> 评分器: 提交 Trace 与末状态
```

## 不同场景的建议
```scenarios
{
  "unit": "分钟",
  "metricTitle": "模拟用时",
  "cases": [
    {
      "label": "提交前",
      "recommendation": "核心冒烟",
      "reason": "先验证关键路径，再按改动补风险用例。",
      "condition": "预算为 6 分钟。",
      "budget": 6,
      "metrics": [
        {"label": "核心冒烟", "value": 3, "highlight": true},
        {"label": "完整评测", "value": 24}
      ]
    },
    {
      "label": "发布前",
      "recommendation": "完整评测",
      "reason": "验证关键旅程和多次运行结果。",
      "budget": 30,
      "metrics": [
        {"label": "核心冒烟", "value": 3},
        {"label": "完整评测", "value": 24, "highlight": true}
      ]
    }
  ]
}
```
````

`scenarios` 使用 JSON。每个场景填 `label`、`recommendation` 和 `reason`，可以加 `condition`、`budget` 和 `metrics`。数值必须为非负有限数。对同一组场景使用相同的单位和指标口径，图表共享刻度。可以用 `legend` 和 `budgetLabel` 本地化提示。引用和证据放在草稿的普通 Markdown 中。详细依据可用原生 `<details>` 折叠，交互在离线页面内工作。

## 验证和交付

- 检查 HTML 已写入，核对首屏、关键图的标签，以及切换或展开后显示的实际结果。渲染报错时修草稿后重跑。
- 本地会话给可打开的产物链接。Miko 在聊天里用现有 `miko_publish_doc` 中转已渲染的报告，先说一句结论，再附工具返回的 HTTPS 链接。按宿主权限使用文件或 HTML 输入，发布前核对读者可见范围。
- 宿主无法运行渲染器时，沿用报告结构和证据，用当前会话可用的展示方式交付。

Plus 的便携版沿用 Tuffex 的卡片、切换和逐层展开方式。宿主已经挂载 Tuffex 时可复用实际组件，单文件报告可直接用随 Skill 附带的渲染器输出。
