# WRTI 人格测试 · Personality Quiz

> 你是「哪种孙承完 × 哪种裴柱现 的孩子」？
> 
> *Discover which Wendy × Irene personality combination you’d be their child of.*

-----

## 项目简介 · About

这是一个 CP 向人格测试网站。用户完成一套单选题后，系统根据答案计算出最匹配的孙承完（Wendy）人格和裴柱现（Irene）人格，并生成专属的「一家三口小剧场」结果页。

A fan-made personality quiz web app. After completing a set of multiple-choice questions, users receive their matched Wendy type × Irene type, along with a short personalized “family skit” result.

-----

## 技术栈 · Tech Stack

- **框架 Framework** — Next.js 16 (App Router) + React 19
- **样式 Styling** — Tailwind CSS v4 + MUI v9
- **后端 Backend** — Next.js API Routes + Zod 校验
- **数据库 Database** — Supabase
- **部署 Deploy** — Vercel

-----

## 本地运行 · Getting Started

```bash
# 安装依赖 Install dependencies
npm install

# 启动开发服务器 Start dev server
npm run dev
```

访问 · Open <http://localhost:3000>

-----

## 项目结构 · Project Structure

```
src/
├── app/
│   ├── (public)/          # 首页、答题页、结果页
│   ├── [lang]/(public)/   # 多语言路由
│   └── api/quiz/submit/   # 计分与结果 API
├── features/quiz/
│   ├── data/              # 人格卡片 & 题目数据
│   └── constants/         # 计分规则
└── components/            # 通用组件
```

-----

## 核心逻辑 · Core Logic

1. 用户完成答题 → 提交至 `POST /api/quiz/submit`
1. 后端对每个选项的 `scoreRules` 累计 Wendy / Irene 各维度分数
1. 各取最高分判定人格类型
1. 返回结果标题 + 摘要 + 小剧场文案

All scoring and personality matching happens server-side; the frontend only renders results.

-----

## License

MIT
