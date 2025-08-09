# AI Feidom GraphQL Worker

一个基于 Cloudflare Worker 的 GraphQL API 服务，用于对接 OpenAI 聊天 API。

## 功能特性

- 🚀 基于 Cloudflare Workers 的无服务器架构
- 📊 GraphQL API 接口
- 🤖 使用官方 OpenAI npm 包集成 OpenAI Chat API
- 🌐 内置 GraphQL Playground
- 🔒 CORS 支持
- ⚡ 边缘计算，全球低延迟
- 🎛️ 支持完整的 OpenAI 参数配置

## 项目结构

```
ai-feidom-graphl-worker/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   └── index.js
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── wrangler.toml
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/feidom-up/ai-feidom-graphl-worker.git
cd ai-feidom-graphl-worker
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

设置 OpenAI API Key：

```bash
wrangler secret put OPENAI_API_KEY
```

然后输入你的 OpenAI API Key。

### 4. 本地开发

```bash
npm run dev
```

访问 `http://localhost:8787/graphql` 来使用 GraphQL Playground。

### 5. 部署到 Cloudflare

```bash
npm run deploy
```

## API 使用

### GraphQL Schema

```graphql
type Query {
  health: String!
}

type Mutation {
  chat(
    messages: [MessageInput!]!
    model: String = "gpt-3.5-turbo"
    temperature: Float = 0.7
    max_tokens: Int = 1000
    top_p: Float = 1.0
    frequency_penalty: Float = 0.0
    presence_penalty: Float = 0.0
  ): ChatResponse!
}
```

### 示例查询

#### 健康检查

```graphql
query {
  health
}
```

#### 聊天对话

```graphql
# 基础聊天
mutation {
  chat(
    messages: [
      { role: "system", content: "你是一个有帮助的AI助手。" }
      { role: "user", content: "请介绍一下 GraphQL 的优势。" }
    ]
    model: "gpt-3.5-turbo"
    temperature: 0.7
    max_tokens: 500
  ) {
    id
    model
    message {
      role
      content
    }
    usage {
      prompt_tokens
      completion_tokens
      total_tokens
    }
  }
}

# 高级参数配置
mutation {
  chat(
    messages: [
      { role: "user", content: "写一首关于春天的诗" }
    ]
    model: "gpt-4"
    temperature: 0.8
    max_tokens: 300
    top_p: 0.9
    frequency_penalty: 0.1
    presence_penalty: 0.1
  ) {
    message {
      content
    }
  }
}
```

### cURL 示例

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { chat(messages: [{role: \"user\", content: \"Hello!\"}]) { message { content } } }"
  }'
```

## 技术栈

- **Cloudflare Workers**: 无服务器边缘计算平台
- **GraphQL**: 灵活的 API 查询语言
- **OpenAI Official SDK**: 官方 OpenAI npm 包
- **JavaScript ES6+**: 现代 JavaScript 语法

## API 参数说明

### Chat Mutation 参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `messages` | `[MessageInput!]!` | 必需 | 对话消息列表 |
| `model` | `String` | `"gpt-3.5-turbo"` | 使用的模型 |
| `temperature` | `Float` | `0.7` | 随机性控制 (0-2) |
| `max_tokens` | `Int` | `1000` | 最大生成 token 数 |
| `top_p` | `Float` | `1.0` | 核心采样 (0-1) |
| `frequency_penalty` | `Float` | `0.0` | 频率惩罚 (-2 到 2) |
| `presence_penalty` | `Float` | `0.0` | 存在惩罚 (-2 到 2) |

## 配置说明

### wrangler.toml

主要配置项：

- `name`: Worker 名称
- `main`: 入口文件路径
- `compatibility_date`: 兼容性日期
- `compatibility_flags`: Node.js 兼容性

### 环境变量

- `OPENAI_API_KEY`: OpenAI API 密钥（通过 `wrangler secret` 设置）

## 开发

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 查看日志
npm run tail
```

### 测试

```bash
npm test
```

### 部署

```bash
# 部署到开发环境
wrangler deploy

# 部署到生产环境
npm run deploy:production
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/graphql` | GET | GraphQL Playground 界面 |
| `/graphql` | POST | GraphQL API 入口 |
| `/health` | GET | 健康检查 |

## 错误处理

API 会返回标准的 GraphQL 错误格式：

```json
{
  "errors": [
    {
      "message": "错误描述",
      "locations": [...],
      "path": [...]
    }
  ]
}
```

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果你觉得这个项目有用，请给它一个 ⭐️！

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GraphQL 官方文档](https://graphql.org/)
- [OpenAI API 文档](https://platform.openai.com/docs/)
