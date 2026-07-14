# 🏛️ 知心 (ZhiXin) — 设置指南

## 你需要完成的 3 步配置

### Step 1: 注册 Supabase（5分钟）

1. 打开 https://supabase.com/dashboard
2. 点击 "New project"
3. 填写项目名称（如 `zhixin`），设置数据库密码（记住它！）
4. Region 选择离中国近的（如 Singapore 或 Tokyo）
5. 点击 "Create new project"（等待 1-2 分钟）
6. 进入 Settings → API，复制：
   - **Project URL** → 就是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → 就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: 执行数据库迁移

1. 在 Supabase 项目面板，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 打开项目中的 `supabase/migrations/001_initial_schema.sql`
4. 复制全部 SQL 内容到 Supabase SQL Editor
5. 点击 "Run" 执行

### Step 3: 配置环境变量

编辑项目根目录的 `.env.local`，填入真实值：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Step 4: 启动开发服务器

```bash
cd zhixin
npm run dev
```

打开 http://localhost:3000

## 项目目录说明

```
zhixin/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 落地页
│   ├── (auth)/             # 登录/注册页面
│   ├── (app)/              # 应用页面（聊天/看板）
│   └── api/                # API 路由
├── components/             # 组件
│   ├── chat/               # 聊天相关组件
│   ├── dashboard/          # 看板组件
│   ├── landing/            # 落地页组件
│   ├── layout/             # 导航布局组件
│   └── ui/                 # 基础UI组件
├── lib/
│   ├── ai/                 # AI层
│   │   ├── client.ts       # DeepSeek API 封装
│   │   ├── prompts.ts      # ★ System Prompt（智者人格）
│   │   ├── emotion-analyzer.ts  # 情绪分析
│   │   └── memory-extractor.ts  # 记忆提取
│   ├── db/                 # 数据库操作
│   ├── supabase/           # Supabase 客户端
│   └── types/              # TypeScript 类型
├── store/                  # Zustand 状态管理
├── hooks/                  # 自定义 Hooks
└── supabase/migrations/    # 数据库迁移
```

## API Key 获取方式

- **DeepSeek API**: https://platform.deepseek.com/api_keys
- **Claude API** (备选): https://console.anthropic.com/
