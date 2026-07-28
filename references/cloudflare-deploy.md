# Cloudflare 部署参考

## 默认路径

新建静态文档站使用 Cloudflare Workers Static Assets：

```jsonc
{
  "name": "project-name",
  "compatibility_date": "YYYY-MM-DD",
  "assets": {
    "directory": "./public",
    "not_found_handling": "404-page"
  },
  "routes": [
    {
      "pattern": "project-name.tagzxia.com",
      "custom_domain": true
    }
  ]
}
```

已有项目已经使用 Pages、Workers 或框架适配器时，沿用项目配置，不强制迁移。

## 顺序

1. 运行 `npx wrangler whoami`，确认账号和部署权限。
2. 检查 Worker 名称、静态目录、自定义域名和 compatibility date。
3. 运行项目测试和静态文件检查。
4. 运行 `npx wrangler deploy`。
5. 使用 `curl -fsSI https://<domain>` 检查状态码。
6. 使用 `curl -fsS https://<domain>` 检查关键标题。
7. 检查 CSS、JavaScript 等核心资源返回 `2xx`。

## 边界

- 用户明确要求部署即视为本次部署授权，不重复询问。
- 未经明确授权，不删除 Worker、域名、DNS 记录或旧项目。
- 不打印 OAuth Token、API Token、Account ID 等凭据。
- 域名冲突、权限不足或生产配置可能覆盖现有服务时，停止并说明冲突。
- 文档站默认不收集分析数据、不使用 Cookie、不加载第三方追踪脚本。
