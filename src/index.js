// Cloudflare Worker with GraphQL for OpenAI Chat API

import { graphql, buildSchema } from 'graphql';
import OpenAI from 'openai';

// GraphQL Schema 定义
const schema = buildSchema(`
  type Message {
    role: String!
    content: String!
  }

  input MessageInput {
    role: String!
    content: String!
  }

  type ChatResponse {
    id: String!
    object: String!
    created: Int!
    model: String!
    message: Message!
    usage: Usage
  }

  type Usage {
    prompt_tokens: Int!
    completion_tokens: Int!
    total_tokens: Int!
  }

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
`);

// GraphQL Resolvers
const resolvers = {
  health: () => 'GraphQL OpenAI Service is running!',
  
  chat: async ({ 
    messages, 
    model, 
    temperature, 
    max_tokens, 
    top_p, 
    frequency_penalty, 
    presence_penalty 
  }, context) => {
    const { env } = context;
    
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      // 初始化 OpenAI 客户端
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      // 构建请求参数
      const requestParams = {
        model,
        messages,
        temperature,
        max_tokens,
      };

      // 添加可选参数
      if (top_p !== undefined && top_p !== 1.0) {
        requestParams.top_p = top_p;
      }
      if (frequency_penalty !== undefined && frequency_penalty !== 0.0) {
        requestParams.frequency_penalty = frequency_penalty;
      }
      if (presence_penalty !== undefined && presence_penalty !== 0.0) {
        requestParams.presence_penalty = presence_penalty;
      }

      // 调用 OpenAI Chat Completions API
      const completion = await openai.chat.completions.create(requestParams);

      const choice = completion.choices[0];
      
      return {
        id: completion.id,
        object: completion.object,
        created: completion.created,
        model: completion.model,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : null,
      };
    } catch (error) {
      // 处理 OpenAI API 错误
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error(`Failed to call OpenAI API: ${error.message}`);
    }
  },
};

// CORS 处理函数
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// 主要的 fetch 处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return setCorsHeaders(new Response(null, { status: 200 }));
    }

    // GraphQL endpoint
    if (url.pathname === '/graphql') {
      if (request.method === 'GET') {
        // 返回 GraphQL Playground
        return setCorsHeaders(new Response(getGraphQLPlayground(), {
          headers: { 'Content-Type': 'text/html' },
        }));
      }

      if (request.method === 'POST') {
        try {
          const { query, variables, operationName } = await request.json();
          
          const result = await graphql({
            schema,
            source: query,
            variableValues: variables,
            operationName,
            rootValue: resolvers,
            contextValue: { env },
          });

          return setCorsHeaders(new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
          }));
        } catch (error) {
          return setCorsHeaders(new Response(JSON.stringify({
            errors: [{ message: error.message }],
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }));
        }
      }
    }

    // 健康检查端点
    if (url.pathname === '/health') {
      return setCorsHeaders(new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }), {
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    // 默认响应
    return setCorsHeaders(new Response(JSON.stringify({
      message: 'GraphQL OpenAI Service',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    }));
  },
};

// GraphQL Playground HTML
function getGraphQLPlayground() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GraphQL Playground</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.26/build/static/css/index.css" />
  <link rel="shortcut icon" href="https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.26/build/favicon.png" />
  <script src="https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.26/build/static/js/middleware.js"></script>
</head>
<body>
  <div id="root">
    <style>
      body { margin: 0; font-family: "Open Sans", sans-serif; overflow: hidden; }
      #root { height: 100vh; }
    </style>
  </div>
  <script>
    window.addEventListener('load', function (event) {
      GraphQLPlayground.init(document.getElementById('root'), {
        endpoint: '/graphql',
        settings: {
          'editor.theme': 'dark',
          'editor.reuseHeaders': true,
          'tracing.hideTracingResponse': true,
          'editor.fontSize': 14,
        },
        tabs: [{
          endpoint: '/graphql',
          query: \`# 欢迎使用 GraphQL OpenAI 服务！
# 下面是一些示例查询：

# 健康检查
query HealthCheck {
  health
}

# 基础聊天对话示例
mutation BasicChat {
  chat(
    messages: [
      { role: "system", content: "你是一个有帮助的AI助手。" }
      { role: "user", content: "你好！请介绍一下自己。" }
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

# 高级参数聊天示例
mutation AdvancedChat {
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
\`,
        }]
      })
    })
  </script>
</body>
</html>`;
}