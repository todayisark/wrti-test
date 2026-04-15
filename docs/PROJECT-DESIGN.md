# CP人格测试项目设计书（V1）

---

## 一、项目概述

本项目是一个 CP 向人格测试网页。

用户完成一套固定测试题后，将被判定为：

> 「某种孙承完人格 × 某种裴柱现人格 的孩子」

测试结果包含：

- 结果标题
- 用户性格文案（后端生成）
- 一家三口小剧场（后端生成）

---

## 二、当前开发阶段（Phase 1）

### 功能范围

已包含：

- 固定题目测试
- 单选题答题
- 后端计算人格结果
- 后端生成文案与小剧场
- 前端展示结果

暂不包含：

- 用户登录
- 数据库存储
- AI接口（先用模板）
- 图片与复杂UI
- 多测试平台

---

## 三、系统架构

```text
前端页面
   ↓
POST /api/quiz/submit
   ↓
后端逻辑（Next.js API）
   ↓
返回结果数据
```

原则：

- 前端不做人格计算
- 所有结果逻辑在后端完成

---

## 四、核心数据模型

---

### 4.1 人格分类体系

本测试采用“双角色人格分类模型”。

#### 孙承完人格（Wendy）

- W1：小太阳 / DJ
- W2：感性人格 / 音乐人
- W3：温柔学霸 / 牙医
- W4：理性工作狂 / 娱乐公司老板

#### 裴柱现人格（Irene）

- I1：花店老板
- I2：职场精英
- I3：画家
- I4：幼儿园老师

---

### 4.2 人设卡片（ParentCharacterCard）

```ts
type CharacterCode = 'W1' | 'W2' | 'W3' | 'W4' | 'I1' | 'I2' | 'I3' | 'I4';

type ParentCharacterCard = {
  code: CharacterCode;
  group: 'wendy' | 'irene';
  name: string;
  title: string;
  job: string;
  personalitySummary: string;
  personalityTraits: string[];
  detailedDescription: string;
  relationshipStyle?: string;
  hiddenSoftSpot?: string;
};
```

---

### 4.3 题目模型（QuizQuestion）

```ts
type QuizOption = {
  id: string;
  text: string;
  scoreRules: {
    code: CharacterCode;
    score: number;
  }[];
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};
```

---

### 4.4 用户答案（QuizAnswer）

```ts
type QuizAnswer = {
  questionId: string;
  optionId: string;
};
```

---

### 4.5 分数结构（ScoreMap）

```ts
type WendyCode = 'W1' | 'W2' | 'W3' | 'W4';
type IreneCode = 'I1' | 'I2' | 'I3' | 'I4';

type ScoreMap = {
  wendy: Record<WendyCode, number>;
  irene: Record<IreneCode, number>;
};
```

---

### 4.6 测试结果（QuizResult）

```ts
type QuizResult = {
  wendyType: ParentCharacterCard;
  ireneType: ParentCharacterCard;
  resultTitle: string;
  resultSummary: string;
  story: string;
};
```

---

## 五、计分模型设计

---

### 5.1 核心规则

每道题包含 4 个选项。

每个选项都定义一组计分规则：

- 承完人格：
  - 主人格 +2
  - 次人格 +1

- 柱现人格：
  - 主人格 +2
  - 次人格 +1

其余人格不加分。

---

### 5.2 选项结构示例

```ts
{
  id: 'q1_a',
  text: '会主动活跃气氛，也很在意每个人的感受',
  scoreRules: [
    { code: 'W1', score: 2 },
    { code: 'W2', score: 1 },
    { code: 'I2', score: 2 },
    { code: 'I1', score: 1 }
  ]
}
```

---

### 5.3 计分逻辑

函数：`scoreQuizAnswers`

处理流程：

1. 初始化所有人格分数为 0
2. 遍历用户答案
3. 找到选中的 option
4. 遍历 option.scoreRules
5. 累加对应人格分数

输出：

```ts
ScoreMap;
```

---

### 5.4 人格判定

函数：`buildQuizResult`

逻辑：

- 承完：选 W1~W4 中分数最高
- 柱现：选 I1~I4 中分数最高

---

### 5.5 最终结果生成

```text
你是「{Wendy类型} × {Irene类型} 的孩子」
```

---

## 六、结果生成逻辑

---

### 6.1 结果标题

```ts
resultTitle = `你是「${wendy.title} × ${irene.title} 的孩子」`;
```

---

### 6.2 结果摘要

简单拼接：

- 承完 summary
- 柱现 summary

---

### 6.3 小剧场生成

函数：`buildStory`

当前使用：

👉 模板 + 句子池

结构：

```text
opening
+ wendy action
+ irene action
+ child reaction
+ ending
```

---

## 七、API设计

---

### 7.1 提交测试

#### POST `/api/quiz/submit`

请求：

```json
{
  "answers": [
    {
      "questionId": "q1",
      "optionId": "a1"
    }
  ]
}
```

---

### 校验（Zod）

```ts
z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string(),
    }),
  ),
});
```

---

### 响应

```json
{
  "success": true,
  "data": {
    "wendyType": {},
    "ireneType": {},
    "resultTitle": "",
    "resultSummary": "",
    "story": ""
  }
}
```

---

## 八、模块划分

---

### 8.1 quiz 模块

负责：

- 人设卡片
- 题目定义
- 分数计算
- 结果生成
- 小剧场生成

---

### 8.2 API 层

负责：

- 输入校验
- 调用业务逻辑
- 返回结果

---

### 8.3 页面层

负责：

- 展示题目
- 收集答案
- 调用 API
- 渲染结果

---

## 九、数据流

```text
用户答题
   ↓
提交 answers
   ↓
API 校验
   ↓
计分
   ↓
判定人格
   ↓
生成结果
   ↓
返回前端
   ↓
展示
```

---

## 十、扩展性设计

---

### 10.1 数据库存储

未来可增加：

- 保存 quiz_results

---

### 10.2 AI生成文案

替换：

```ts
buildStory();
```

为：

```ts
AI API
```

---

### 10.3 多测试支持

从：

```ts
QUESTIONS;
```

扩展为：

```ts
QUIZ_MAP[quizId];
```

---

## 十一、题目设计原则

---

### 每道题必须：

- 同时影响承完与柱现
- 包含主人格与次人格
- 避免只给单一人格加分

---

### 推荐结构

每个选项：

- 承完：2个类型（+2 / +1）
- 柱现：2个类型（+2 / +1）

---

## 十二、设计原则

---

### 1. 单一数据源

题目与人格定义统一在 constants

---

### 2. 后端主导逻辑

前端不做人格计算

---

### 3. 易扩展

支持未来接：

- 登录
- 数据库
- AI
- 多测试

---

## 十三、总结

本项目核心在于：

- 人设设计
- 文案质量
- 测试体验

技术目标：

👉 用最简单架构支撑最强内容表达
