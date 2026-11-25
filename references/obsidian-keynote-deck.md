# 黑曜石演示稿与暗黑发光线稿

面向管理层汇报稿与客户销售演示稿的 PPT / Slidev 设计规范与制作流程。核心原则：**限定使用 Slidev**、纯黑 `#000000` 底板、金属钛白主标题、单一强调色克制点题、少字多画面与动效、所有页面导出前必须实拍核验。

## 工具栈与适用限定

- **限定使用 Slidev**：做 PPT、管理层汇报稿、客户销售演示稿时，**技术栈统一限定为 Slidev**（结合本规范内置的 `style.css`、Vue 组件模板、暗黑发光 SVG 线稿和 Playwright 16:9 PDF 导出脚本）。不另起 Marp、Reveal.js、`python-pptx` 或手搓零散 HTML 幻灯片，除非老板或客户明确强制要求 `.pptx` 可编辑源文件等其他交付载体。
- **默认风格与边界**：全屏演示稿（Slidev Keynote / 汇报稿 / 销售页）和暗黑线稿配图默认沿用本规范（除非明确指定浅色或客户品牌模板）；常规文档站与业务后台仍遵守 `SKILL.md` 的「视觉」通用底线。

## 先选对视觉媒介

不同受众用不同视觉载体，不要一套抽象图标打全场：

| 场景 | 推荐媒介 | 原因 |
|---|---|---|
| 15–25 页完整汇报、原理拆解、架构流向 | **暗黑发光线稿 SVG** | 抽象干净，突出机制因果，不抢标题焦点 |
| 3–4 页客户销售版痛点与对比页 | **暗场 35mm 实景图 + 磨砂 HUD 标注** | 老板 0.5 秒看懂现场问题，比火柴人线稿直观得多 |
| 产品全链路演示（3–6 步） | **真机边框 + 全程统一浅白底真实 UI** | 黑底配白屏高反差，自动轮播不出现黑白闪烁 |
| 线上系统收尾页 | **macOS 浏览器实景截屏 + 真实可扫二维码 + 可点击按钮** | 证明「线上已跑通」，线下投屏可扫码、PDF 可点击 |

## 视觉底线与文案纪律

- **底色与文字**：画布固定纯黑 `#000000`（`canvasWidth: 980`、`aspectRatio: 16/9`），不铺灰渐变底，不加页码和装饰页眉。主标题用钛白竖向金属渐变（`.metal`），品牌强调色只用一个（默认 `--mi: #ff6900`，按品牌替换变量），严禁同一句话里拆成多种花哨颜色。
- **真机内屏统一浅白底**：放入手机硬件边框里的所有交互页面，统一使用 `#F5F6F8` 画布 + `#FFFFFF` 卡片 + 原生状态栏与导航栏，严禁在自动轮播里混用深浅屏导致视觉频闪。
- **老板视角去术语**：页面文案禁止出现 `CH1/CH2`、`Trace`、`Span`、`ReID`、`API` 等研发黑话（除非听众明确是技术团队）；改用业务直白说法（如「音箱伴奏 / 话筒干声」「链路报告」「多摄像头接力认人」）。
- **示例数据自洽**：真实 UI 示意里的歌曲名、时间线、人数、结论必须前后一致，禁止自相矛盾；每张卡片优先一句话讲清，删掉冗余遥测框和角标堆砌。
- **无封面首屏合并引题**：3–4 页极简销售版没有单独封面时，把「场景主体 + 核心后果」合并成一句顶部引题（`.s-topline`），放在第 1 页主标题正上方，首屏直接点题并清空底部冗余句。

## 暗黑发光线稿规范（Obsidian Luminous Line-Art）

可复用样例见 `assets/obsidian-keynote-deck/examples/`（信号滤波、跨镜接力、链路时间轴）。

### 画布与四级明度阶梯

- 固定 `viewBox="0 0 640 240"`（竖向设备用 `640 260`），根节点写 `fill="none"`。主体收在 `x: 70..570`、`y: 26..218` 内，防止发光滤镜边缘被裁切。
- 仅用四级锌灰到纯白明度加一个品牌荧光色，建立前后景纵深：

| 层级 | 用途 | 色值 | 线宽 |
|---|---|---|---|
| L0 基准线 | 地面、天花板导轨、虚线分隔墙、时间网格 | `#27272a`（实线）、`#3f3f46`（`stroke-dasharray="2 5"`） | `1px` |
| L1 硬件与次级体 | 门框、立柱机身、背景波形、次级人物 | 描边 `#52525b`–`#a1a1aa`；机身填充 `#18181c`→`#0b0b0e` | `1.2–1.5px` |
| L2 视觉主体 | 核心人物、主设备、主信号线、核心节点 | 描边 `#e4e4e7`–`#ffffff`；亮点中心 `#ffffff` | `1.4–1.6px` |
| L3 荧光强调 | 光束、滤波闸门、跨镜接力弧、告警脉冲 | `#ff6900`（高亮芯 `#ffb067`，光晕透明度 `0.16–0.42`） | `1.5–3px` + 发光滤镜 |

### 标准滤镜、光锥与动效

- **发光滤镜**：每个 SVG 内给 `<filter>` / `<linearGradient>` 加文件前缀防 `id` 冲突，标准参数 `feGaussianBlur stdDeviation="5"` 叠加 `SourceGraphic`。
- **光学锥形**：监控视场或灯光锥用竖向 `linearGradient`，起点 `stop-opacity="0.18–0.24"`，终点 `0`。
- **自包含 CSS 动效**：把 `<style>` 写在 SVG 内部，这样通过 `<img :src>` 引入也能动。凡是用 `scale()`/`rotate()` 的图形必须声明 `transform-box: fill-box; transform-origin: center;`；节奏控制在 `1.4s–3.2s ease-in-out infinite`。常用四种动作：
  - `stroke-dasharray` / `stroke-dashoffset`：表现净化后的声波、数据流或接力弧线。
  - `pingOut`（缩放 `0.6→2.1` + 淡出）：表现检出点与声源脉冲。
  - `sweep`（水平扫过虚线网格）：表现链路瀑布流扫描游标。
  - `noiseJit`（微幅纵缩 + 透明度波动）：表现过滤前的杂音干扰。
- **硬避坑 — 严禁在 Slidev 的 SVG 里写 `<text>`**：UnoCSS 与 Slidev 全局排版样式会覆盖 SVG 内小字号 `<text>` 导致字号失控。SVG 内文字占位一律改用圆角细条（`<rect rx="3.5" fill="#52525b"/>`），需要真实文字时用外部 HTML/CSS 叠加。

## 两套标准版式与内置资产

从 `SKILL.md` 找到 `tds.skill` 根目录，复用以下模板（均位于 `assets/obsidian-keynote-deck/`）：

- `style.css`：纯黑底板、`.metal` 钛白标题、`.mi` 强调色、`.kicker`、`.s-topline`、`.mega-num`（188px 单指标）、`.pair-row`（无框双项对照）、`.gates`（四道关流程）、`.age-bar`（分段互补条）、`.sales-s3-tight`（真机双栏紧凑内边距）。
- `SpotlightCarousel.vue`：3 卡（`16:10`）或 4 卡（`4:3`）自动聚光轮播。同时支持暗场实景图 + 磨砂 HUD 标注（含顶部进度条、缓推镜头、可选失焦选框）与发光线稿 SVG；悬停或点击任意卡片定格。
- `PhoneShowcaseShell.vue` + `iphone-frame.png`：左真机钛金属边框（`246×509px`，内部全浅白底 `#F5F6F8`）+ 右侧 2×3 交互步骤块与领域联动胶囊。自定义页面时注意卡片内竖向容器用 `justify-content: center` 配连接线，别用 `justify-content: space-between` 拉出大块空洞白底。
- `LiveDemoSlide.vue`：左 macOS 浏览器实景窗口 + 右侧标题、真实可扫矢量二维码与橙色主按钮。二维码必须用 `qrcode` 生成真实 SVG（`errorCorrectionLevel: 'M'`、`margin: 1`），不要手画假方块。

## Slidev 避坑与实拍验收

- **子路径动态图片**：Vite 不会重写 Vue 里动态 `:src` 的路径。组件内一律通过 `const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')` 拼接，确保 `/` 与 `--base /sales/` 下都不断图。
- **链接默认虚线**：Slidev 默认给 `<a>` 加底部虚线边框；卡片链接与主按钮必须写 `text-decoration: none !important; border-bottom: none !important;`。
- **Playwright 实拍自检（交付前必做）**：
  - 打开 Slidev 服务后，用本机 Chrome + Playwright 以 `1280×720`（`deviceScaleFactor: 1.5`）逐页、逐交互态截图。
  - 加载用 `waitUntil: 'domcontentloaded'` + `waitForSelector('.slidev-page-<N> ...')`，禁用 `networkidle`（外网字体容易卡死）。
  - 所有 DOM 检查必须限定在 `.slidev-page-<N>` 内（Slidev 会缓存相邻页）。
  - 逐页断言：`scrollHeight === clientHeight`、`scrollWidth === clientWidth`、全部 `img.complete && img.naturalWidth > 0`、控制台 `0` 报错，再打开每张 PNG 肉眼检查折行、留白、压字与虚线。

## 16:9 PDF 导出与内外隔离部署

### 导出脚本

- **常规多页汇报稿**：

```sh
NODE_PATH=/path/to/playwright/node_modules node "/path/to/tds.skill/scripts/obsidian-keynote-export.cjs" http://localhost:3030 23 export
```

- **交互销售版（自动展开静态全亮 + 嵌入可点击超链接）**：

```sh
NODE_PATH=/path/to/playwright/node_modules node "/path/to/tds.skill/scripts/obsidian-keynote-export-interactive.cjs" http://localhost:3041 export-sales
```

交互版导出脚本会做三件事：导出前两页时临时注入打印样式解除未聚焦卡片的压暗并隐藏进度条；在第 3 页依次点击每个步骤块把真机多屏展开为连续页面；在末页读取 `.ld-pdf-link` 的坐标，在 PNG 上叠加透明 `<a>` 层，使导出的 PDF 在微信、预览和浏览器里可直接点击跳转。

### 部署与对外隔离

- **对外客户链接（Nginx / 独立子域名）**：
  - 只构建对外销售稿（`slidev build sales.md --base / --out site-public`）+ 纯 ASCII 文件名的对外 PDF（如 `product-deck.pdf`，避免微信里中文 URL 乱码）+ `robots.txt`（`Disallow: /`）。
  - **严禁**把内部会议纪要、红队审查、成本测算、老板汇报稿或源码 `.md` 一起传到对外目录。
  - Nginx 独立 `server` 块配 `X-Robots-Tag "noindex, nofollow" always;`，`/assets/`、`/images/`、`/anim/` 走 `try_files $uri =404;`，`/` 走 `try_files $uri $uri/ /index.html;`；签独立 TLS 证书并 `nginx -t && systemctl reload nginx`。
- **内部多稿资料站（Cloudflare Pages）**：
  - 结合 `references/cloudflare-deploy.md`。删除 Slidev 在子目录生成的 `_redirects` 与 `404.html`，只在根 `site/_redirects` 写**单段规则**（`/deck/:n /deck/ 200`、`/sales/:n /sales/ 200`），严禁写 `/sales/* /sales/ 200`（会劫持 `.js` 为 `text/html`）。
- **上线后实测**：直连核验首页与 PDF 返回 `HTTP 200`（PDF 为 `application/pdf`），再用 Playwright 跑一遍线上全页，确认 `0` 报错、`0` 断图。
