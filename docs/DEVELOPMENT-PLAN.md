# CP人格测试项目 - MVP 开发计划

## 项目概述

从零开始实现一个 CP 向人格测试应用（Wendy × Irene）。用户完成 24 道题后判定为"某种孙承完人格 × 某种裴柱现人格的孩子"，并生成性格文案和一家三口小剧场。

**当前状态**: 目录结构已建好，技术栈已配置（Next.js 16 + Supabase + Zod），但业务代码为 0 行。

**开发范围**: 本计划仅实施 **Phase 1（MVP）**，实现核心测试功能，无登录、无数据库存储，使用句子池生成小剧场。

**数据管理策略**: 所有文案（人格定义、题目、小剧场句子池）统一放在 JSON 文件中，便于管理和后续国际化。

---

## Phase 1: 核心测试功能（MVP）

### 步骤 1: 数据基础设施

**前置**: 无依赖

#### 1.1 定义类型系统

- **文件**: `src/features/quiz/types.ts`
- **内容**: 定义核心类型
  - `CharacterCode`: `'W1' | 'W2' | 'W3' | 'W4' | 'I1' | 'I2' | 'I3' | 'I4'`
  - `ParentCharacterCard`: 人格卡片接口
  - `QuizQuestion`: 题目接口
  - `QuizOption`: 选项接口
  - `QuizAnswer`: 用户答案接口
  - `ScoreMap`: 分数映射接口
  - `QuizResult`: 测试结果接口
  - `StoryTemplate`: 小剧场模板接口
- **参考**: docs/PROJECT-DESIGN.md 第四节数据模型
- **验证**: TypeScript 编译无错误

#### 1.2 创建 JSON 数据文件

**文件**: `src/features/quiz/data/characters.json`

- **内容**: 16 种人格卡片（W1-W4 × I1-I4）
- **数据源**: docs/USER-TYPE.md
- **结构示例**:
  ```json
  {
    "W1": {
      "code": "W1",
      "group": "wendy",
      "name": "小太阳",
      "title": "小太阳DJ",
      "job": "DJ/主持人",
      "personalitySummary": "...",
      "personalityTraits": ["活力", "热情", "感染力"],
      "detailedDescription": "..."
    },
    ...
  }
  ```

**文件**: `src/features/quiz/data/questions.json`

- **内容**: 24 道题目和选项
- **数据源**: docs/QUESTIONS.md
- **结构示例**:
  ```json
  [
    {
      "id": "q1",
      "prompt": "参加朋友聚会时，你通常会？",
      "options": [
        {
          "id": "q1_a",
          "text": "会主动活跃气氛，也很在意每个人的感受",
          "scoreRules": [
            { "code": "W1", "score": 2 },
            { "code": "W2", "score": 1 },
            { "code": "I2", "score": 2 },
            { "code": "I1", "score": 1 }
          ]
        },
        ...
      ]
    },
    ...
  ]
  ```

**文件**: `src/features/quiz/data/story-templates.json`

- **内容**: 小剧场句子池（按人格组合分类）
- **数据源**: docs/WENDYxIRENE.md，需扩展为句子池
- **结构示例**:
  ```json
  {
    "opening": [
      "周末的午后，阳光透过落地窗洒在客厅里。",
      "晚饭后，一家三口坐在沙发上。",
      "某个平凡的工作日早晨，",
      ...
    ],
    "wendyActions": {
      "W1": [
        "承完放下手机，笑着说：'要不我们出去玩吧！'",
        "承完突然站起来，兴奋地提议：'我们来做个游戏怎么样？'",
        ...
      ],
      "W2": [
        "承完轻轻弹起吉他，哼起了一首新歌。",
        "承完翻开乐谱，沉浸在音符的世界里。",
        ...
      ],
      ...
    },
    "ireneActions": {
      "I1": [
        "柱现温柔地整理着桌上的鲜花，微笑着回应。",
        "柱现从花瓶里取出一朵玫瑰，轻声问：'这个颜色好看吗？'",
        ...
      ],
      ...
    },
    "childReactions": [
      "你看着他们，忍不住笑了。",
      "你在一旁认真观察，若有所思。",
      "你跑过去加入他们，气氛更加热闹了。",
      ...
    ],
    "endings": [
      "这就是你的家，温暖而独特。",
      "在他们的影响下，你也渐渐找到了自己的节奏。",
      "你知道，无论发生什么，他们都会在你身边。",
      ...
    ]
  }
  ```
- **说明**: 每个类别包含 5-10 个句子变体，生成时随机组合

#### 1.3 创建数据加载器

- **文件**: `src/features/quiz/constants/index.ts`
- **内容**:

  ```typescript
  import charactersData from '../data/characters.json';
  import questionsData from '../data/questions.json';
  import storyTemplatesData from '../data/story-templates.json';

  export const CHARACTER_CARDS = charactersData;
  export const QUESTIONS = questionsData;
  export const STORY_TEMPLATES = storyTemplatesData;
  ```

- **注意**: 确保 `tsconfig.json` 已启用 `resolveJsonModule: true`
- **验证**: 导入成功，类型推断正确

---

### 步骤 2: 业务逻辑层

**依赖**: 步骤 1

#### 2.1 实现计分逻辑

- **文件**: `src/features/quiz/server/scoring.ts`
- **函数**: `scoreQuizAnswers(answers: QuizAnswer[]): ScoreMap`
- **逻辑**:
  1. 初始化 wendy 和 irene 各 4 个人格分数为 0
  2. 遍历用户答案，匹配 QUESTIONS 中的选项
  3. 根据 scoreRules 累加分数
  4. 返回 ScoreMap
- **参考**: 设计书第五节计分模型
- **验证**: 单元测试固定答案组合，检查分数计算正确性

#### 2.2 实现人格判定

- **文件**: `src/features/quiz/server/result.ts`
- **函数**: `buildQuizResult(scoreMap: ScoreMap): QuizResult`
- **逻辑**:
  1. 从 scoreMap.wendy 中选分数最高的人格（W1-W4）
  2. 从 scoreMap.irene 中选分数最高的人格（I1-I4）
  3. **平局处理**: 如果多个人格分数相同，按序号优先级选择（W1>W2>W3>W4, I1>I2>I3>I4）
  4. 从 CHARACTER_CARDS 获取对应人格卡片
  5. 生成 resultTitle: `你是「${wendy.title} × ${irene.title} 的孩子」`
  6. 生成 resultSummary: 拼接 wendy 和 irene 的 personalitySummary
  7. 调用 buildStory() 生成小剧场
  8. 返回 QuizResult
- **验证**: 测试不同 scoreMap 输入，包括平局场景

#### 2.3 实现小剧场生成（句子池版）

- **文件**: `src/features/quiz/server/story.ts`
- **函数**: `buildStory(wendy: ParentCharacterCard, irene: ParentCharacterCard): string`
- **逻辑**:
  1. 从 STORY_TEMPLATES 加载句子池
  2. 随机选择一个 opening
  3. 根据 wendy.code 随机选择一个 wendyAction
  4. 根据 irene.code 随机选择一个 ireneAction
  5. 随机选择一个 childReaction（可结合父母人格特征）
  6. 随机选择一个 ending
  7. 组合成完整小剧场文本（段落间用换行分隔）
  8. 可选：根据人格组合添加特殊互动逻辑
- **参考**: 设计书第六.三节，docs/WENDYxIRENE.md
- **复杂度**: 每个类别准备 5-10 个句子变体，支持随机组合
- **验证**: 生成多个组合的小剧场，检查文案连贯性和合理性

#### 2.4 创建统一导出

- **文件**: `src/features/quiz/server/index.ts`
- **内容**: 导出 `scoreQuizAnswers`, `buildQuizResult`, `buildStory`

---

### 步骤 3: 数据校验层

**依赖**: 步骤 1

#### 3.1 创建 Zod Schema

- **文件**: `src/features/quiz/schemas/submit.ts`
- **内容**: 定义 `QuizSubmitSchema`

  ```typescript
  import { z } from 'zod';

  export const QuizSubmitSchema = z.object({
    answers: z
      .array(
        z.object({
          questionId: z.string(),
          optionId: z.string(),
        }),
      )
      .length(24), // 必须回答全部 24 题
  });

  export type QuizSubmitRequest = z.infer<typeof QuizSubmitSchema>;
  ```

- **验证**: 导入成功，TypeScript 类型正确

---

### 步骤 4: API 实现

**依赖**: 步骤 2, 步骤 3

#### 4.1 实现提交测试 API

- **文件**: `src/app/api/quiz/submit/route.ts`
- **方法**: POST
- **流程**:
  1. 使用 QuizSubmitSchema 校验请求体
  2. 调用 scoreQuizAnswers(answers)
  3. 调用 buildQuizResult(scoreMap)
  4. 返回 QuizResult
- **错误处理**:
  - 校验失败返回 400
  - 服务器错误返回 500
- **参考**: 设计书第七.一节 API 设计
- **验证**: 使用 curl 或 Postman 测试 API，检查返回结果

**实现示例**:

```typescript
import { NextResponse } from 'next/server';
import { QuizSubmitSchema } from '@/features/quiz/schemas/submit';
import { scoreQuizAnswers, buildQuizResult } from '@/features/quiz/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = QuizSubmitSchema.parse(body);

    const scoreMap = scoreQuizAnswers(validated.answers);
    const result = buildQuizResult(scoreMap);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: '请回答全部 24 题' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
```

---

### 步骤 5: 前端 - 答题页面

**依赖**: 步骤 4

#### 5.1 创建答题页面组件

- **文件**: `src/app/(public)/quiz/page.tsx`
- **功能**:
  1. 展示题目列表（可选：分页或单题模式）
  2. 单选按钮选择答案
  3. 记录用户选择到状态（useState）
  4. 提交按钮（全部作答后可用）
  5. 调用 POST /api/quiz/submit
  6. 成功后跳转到结果页（临时方案：将结果存到 sessionStorage）
- **UI 要求**: 简洁清晰，Tailwind CSS 样式
- **验证**: 可完整答题并提交

**关键功能点**:

- 使用 `useState` 管理答案状态
- 检查是否全部 24 题都已作答
- 提交后使用 `sessionStorage.setItem('quizResult', JSON.stringify(result))`
- 使用 `router.push('/result')` 跳转

---

### 步骤 6: 前端 - 结果展示页

**依赖**: 步骤 5

#### 6.1 创建结果展示页面

- **文件**: `src/app/(public)/result/page.tsx` （简化版，不需要 resultId）
- **功能**:
  1. 从 sessionStorage 读取测试结果
  2. 展示 resultTitle
  3. 展示 wendyType 和 ireneType 的详细信息（卡片形式）
  4. 展示 resultSummary
  5. 展示 story（小剧场，保留格式）
  6. "重新测试" 按钮
- **UI 要求**: 展示友好，可分享的视觉效果
- **验证**: 完成测试后能正确展示结果

**关键功能点**:

- 使用 `useEffect` 从 sessionStorage 读取结果
- 如果无结果则重定向到首页或测试页
- 小剧场文本保留换行格式（使用 `white-space: pre-line` 或分段渲染）

---

### 步骤 7: 首页引导

**依赖**: 步骤 5

#### 7.1 更新公共首页

- **文件**: `src/app/(public)/page.tsx`
- **内容**:
  - 项目标题和简介
  - 测试说明（24 道题，约 5 分钟）
  - "开始测试" 按钮链接到 `/quiz`
  - 可选：示例人格展示
- **UI 要求**: 吸引人，清晰传达测试价值
- **验证**: 点击按钮正确跳转

---

### 步骤 8: 端到端测试

**依赖**: 步骤 1-7

#### 8.1 完整流程验证

**测试步骤**:

1. 访问首页 → 点击"开始测试"
2. 完成全部 24 题
3. 提交答案
4. 查看结果页面
5. 验证结果文案合理性
6. 测试多种答案组合，确认不同人格都能正确判定

**验证标准**:

- 无运行时错误
- 计分准确（可用固定答案组合验证）
- 文案显示完整
- 小剧场随机变化（刷新页面观察）

**具体测试用例**:

1. 全选第一个选项 → 检查判定结果
2. 全选第二个选项 → 检查判定结果
3. 随机组合 5+ 种 → 确认 W1-W4 × I1-I4 各类型都能出现
4. 构造平局场景 → 验证序号优先规则（W1>W2, I1>I2）
5. 多次刷新结果页 → 确认小剧场文案有随机变化

---

## 后续阶段（暂不实施）

### Phase 2: 用户系统与数据持久化

- 添加用户注册/登录功能（Supabase Auth）
- 创建数据库表 `quiz_results`
- 将测试结果保存到数据库
- 实现个人中心，查看历史测试结果
- 修改结果页支持通过 URL 分享（读取数据库）

### Phase 3: UI 优化与高级功能

- UI 美化和视觉设计（配色、动画、插图）
- 为每个人格添加配图
- 集成 AI API 生成更丰富、个性化的小剧场文案
- 添加结果分享功能（生成卡片图片）
- 响应式优化

**说明**: 这些功能在 Phase 1 完成并验收后再规划实施。

---

## 关键文件清单

### Phase 1 MVP 文件列表

**数据层（JSON + TypeScript）**

- `src/features/quiz/data/characters.json` - 16 种人格卡片定义（约 500 行）
- `src/features/quiz/data/questions.json` - 24 道题目和选项（约 800 行）
- `src/features/quiz/data/story-templates.json` - 小剧场句子池（约 300 行）
- `src/features/quiz/types.ts` - 类型定义（150 行）
- `src/features/quiz/constants/index.ts` - 加载 JSON 数据（10 行）

**业务逻辑层**

- `src/features/quiz/server/scoring.ts` - 计分逻辑（60 行）
- `src/features/quiz/server/result.ts` - 人格判定逻辑（60 行，包含平局处理）
- `src/features/quiz/server/story.ts` - 小剧场生成（句子池随机组合，120 行）
- `src/features/quiz/server/index.ts` - 统一导出（10 行）

**数据校验层**

- `src/features/quiz/schemas/submit.ts` - Zod Schema（20 行）

**API 层**

- `src/app/api/quiz/submit/route.ts` - POST 提交测试（60 行）

**页面层**

- `src/app/(public)/page.tsx` - 首页引导（80 行）
- `src/app/(public)/quiz/page.tsx` - 答题页面（350 行）
- `src/app/(public)/result/page.tsx` - 结果展示页（250 行）

**总计约**: 2620 行代码（不含 JSON 数据约 1600 行）

---

## 验证标准

### Phase 1 完成标准

1. ✅ 运行 `npm run dev` 无编译错误
2. ✅ 访问首页可点击"开始测试"跳转到 `/quiz`
3. ✅ 答题页显示 24 道题，必须全部作答才能提交
4. ✅ 提交后 API 返回正确的人格判定结果
5. ✅ 结果页显示：
   - 结果标题（"你是「X × Y 的孩子」"）
   - 两个父母人格的详细描述
   - 性格摘要
   - 小剧场文案（句子池随机组合）
6. ✅ 测试以下答案组合，验证计分准确性：
   - 全选第一个选项 → 判定为特定人格组合
   - 全选第二个选项 → 判定为另一人格组合
   - 随机组合 5+ 种 → 确认 W1-W4 × I1-I4 各类型都能出现
7. ✅ 验证平局处理：构造分数相同的答案，确认选择序号小的人格（W1>W2, I1>I2）
8. ✅ 多次刷新结果页，确认小剧场随机生成（同一人格组合的不同文案）

---

## 技术决策

### 已确定

- **框架**: Next.js 16（App Router）
- **数据管理**: JSON 文件（便于管理和后续国际化）
- **校验**: Zod
- **样式**: Tailwind CSS 4
- **类型**: TypeScript 5
- **状态管理**: Phase 1 使用 React useState（无需全局状态）
- **结果存储**: sessionStorage（临时方案，Phase 2 改为数据库）

### 不使用（Phase 1）

- ❌ Supabase 数据库（Phase 2 再启用）
- ❌ 用户认证系统
- ❌ React Hook Form（使用原生表单）
- ❌ 任何第三方 UI 组件库

---

## 风险与注意事项

### 数据质量风险

1. **数据转换准确性**: docs/QUESTIONS.md 和 USER-TYPE.md 需手动转为 JSON，注意以下事项：
   - scoreRules 格式必须严格遵守
   - 每个选项必须同时包含 wendy 和 irene 的计分规则
   - JSON 语法正确性（逗号、引号）

2. **计分准确性**:
   - 每个选项必须同时影响 wendy 和 irene 各 2 个人格（主+次）
   - 建议创建测试用例验证计分逻辑
   - 检查是否有选项遗漏计分规则

3. **平局处理**:
   - 已明确按序号优先（W1>W2>W3>W4, I1>I2>I3>I4）
   - 需在代码中明确实现，避免随机选择导致结果不稳定

### 文案质量风险

4. **小剧场质量**:
   - 需准备 5-10 个句子变体每类别
   - 确保随机组合后文案连贯、合理
   - 可在句子池中针对特殊人格组合添加专属句子
   - 建议先准备基础句子池，后续根据测试反馈优化

### 技术配置风险

5. **JSON 配置**:
   - 确认 `tsconfig.json` 中 `resolveJsonModule: true` 已启用
   - 确认 `compilerOptions.esModuleInterop: true` 已启用（导入 JSON）

6. **Next.js 版本**:
   - 根据 AGENTS.md 提示，编码前检查 `node_modules/next/dist/docs/` 确认 API 变化
   - 特别注意 App Router 的路由和数据获取方式

7. **TypeScript 严格模式**:
   - JSON 导入的类型推断可能不完整
   - 建议在 types.ts 中明确定义接口，并在 constants/index.ts 中显式类型标注

---

## 时间估算

### 单人开发时间分配

| 任务                                             | 预估时间   | 备注                   |
| ------------------------------------------------ | ---------- | ---------------------- |
| **步骤 1**: 数据基础（types + JSON）             | 1 天       | 数据转换是重点，需细心 |
| **步骤 2**: 业务逻辑（scoring + result + story） | 1.5 天     | 句子池生成逻辑稍复杂   |
| **步骤 3**: 数据校验（Zod schema）               | 0.5 小时   | 相对简单               |
| **步骤 4**: API 实现                             | 0.5 天     | 主要是错误处理         |
| **步骤 5**: 答题页面                             | 1.5 天     | UI 交互较多            |
| **步骤 6**: 结果页面                             | 1 天       | 展示逻辑和样式         |
| **步骤 7**: 首页引导                             | 0.5 天     | 相对简单               |
| **步骤 8**: 端到端测试和调试                     | 1 天       | 测试多种组合，修复 bug |
| **总计**                                         | **7-8 天** | 不含文案创作时间       |

**注意**:

- 以上时间不包括文案创作（人格描述、小剧场句子池）
- 如果文案需要同步创作，建议额外预留 2-3 天

---

## 决策确认

### 已确认的设计决策

✅ **1. 开发范围**

- 只实施 Phase 1（MVP），无登录、无数据库
- 结果临时保存在 sessionStorage
- Phase 2/3 待 MVP 验收后再规划

✅ **2. 数据管理方案**

- 所有文案统一放在 JSON 文件中
- 便于管理、修改和后续国际化
- 避免硬编码在 TypeScript 代码中

✅ **3. 小剧场生成方式**

- 使用句子池随机生成（稍复杂）
- 非简单模板拼接
- 每个类别准备 5-10 个变体

✅ **4. 平局处理规则**

- 分数相同时按序号优先
- W1>W2>W3>W4, I1>I2>I3>I4
- 确保结果确定性

---

## 开发准备清单

### 开始开发前确认

- [ ] `tsconfig.json` 中 `resolveJsonModule: true` 已启用
- [ ] 已阅读 docs/PROJECT-DESIGN.md、USER-TYPE.md、QUESTIONS.md、WENDYxIRENE.md
- [ ] 已理解 8 种人格特征和 24 道题的计分规则
- [ ] 准备好文案素材（人格描述、小剧场句子池）
- [ ] 开发环境正常（`npm run dev` 能运行）

### 开发过程中

- [ ] 每完成一个步骤进行验证
- [ ] 提交代码前检查 TypeScript 编译错误
- [ ] 遇到问题时参考 AGENTS.md 提示的 Next.js 文档

---

## 下一步行动

1. ✅ 确认开发计划无遗漏
2. 开始实施 **步骤 1**: 创建 types.ts 和 3 个 JSON 数据文件
3. 依次完成步骤 2-8
4. 每个步骤完成后进行验证测试

**建议**: 先完成步骤 1.1（类型定义），再并行处理步骤 1.2（JSON 数据文件），最后完成步骤 1.3（数据加载器），确保基础扎实。
