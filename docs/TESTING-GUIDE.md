# 端到端测试指南

## 测试环境检查

### 1. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

---

## 测试用例

### ✅ Test 1: 首页加载和导航

**步骤**：

1. 访问 http://localhost:3000
2. 检查页面显示是否正常
3. 查看是否显示项目标题、介绍、测试说明
4. 查看是否显示 8 个示例人格卡片
5. 点击"开始测试"按钮

**预期结果**：

- 页面正常显示，无控制台错误
- 渐变背景和样式正确
- 点击后跳转到 `/quiz` 页面
- sessionStorage 中的旧结果被清除

---

### ✅ Test 2: 答题流程 - 全选第一个选项

**步骤**：

1. 在答题页面，依次选择每道题的第一个选项（A 选项）
2. 观察进度条从 0/24 到 24/24
3. 点击"查看结果"按钮

**预期结果**：

- 进度条实时更新
- 所有已选题目显示紫色边框高亮
- 提交按钮从灰色变为可点击的渐变色
- 提交成功后跳转到 `/result` 页面
- 显示特定的人格组合（记录结果以验证一致性）

**测试数据（复制到浏览器控制台）**：

```javascript
// 快速选择所有第一个选项
const questions = document.querySelectorAll('[class*="space-y-6"] > div');
questions.forEach((q, i) => {
  const firstOption = q.querySelector('button');
  if (firstOption) firstOption.click();
});
```

---

### ✅ Test 3: 答题流程 - 全选第二个选项

**步骤**：

1. 返回首页，点击"开始测试"
2. 依次选择每道题的第二个选项（B 选项）
3. 提交查看结果

**预期结果**：

- 结果与 Test 2 不同（验证计分逻辑）
- 人格组合应该不同

**测试数据**：

```javascript
// 快速选择所有第二个选项
const questions = document.querySelectorAll('[class*="space-y-6"] > div');
questions.forEach((q, i) => {
  const buttons = q.querySelectorAll('button');
  if (buttons[1]) buttons[1].click();
});
```

---

### ✅ Test 4: 随机组合测试

**步骤**：

1. 随机选择答案（每道题随机选择一个选项）
2. 提交查看结果
3. 重复 3-5 次

**预期结果**：

- 能够出现不同的人格组合
- W1-W4 × I1-I4 的 16 种组合中至少出现 5 种以上

**测试数据**：

```javascript
// 随机选择选项
const questions = document.querySelectorAll('[class*="space-y-6"] > div');
questions.forEach((q) => {
  const buttons = q.querySelectorAll('button');
  const randomIndex = Math.floor(Math.random() * buttons.length);
  buttons[randomIndex].click();
});
```

---

### ✅ Test 5: 结果页面功能

**步骤**：

1. 在结果页面，检查显示内容：
   - 结果标题格式：`你是「XXX × YYY」的孩子`
   - 结果摘要
   - Wendy 人格卡片（左侧，粉色）
   - Irene 人格卡片（右侧，紫色）
   - 人格特质标签
   - 详细描述
   - 小剧场文本（包含换行）
2. 点击"重新测试"按钮
3. 返回结果页，点击"分享结果"按钮
4. 点击"返回首页"链接

**预期结果**：

- 所有内容正确显示
- "重新测试"跳转到 `/quiz` 并清除答案
- "分享结果"显示占位提示（Phase 3 功能）
- "返回首页"跳转到 `/`

---

### ✅ Test 6: 小剧场随机性验证

**步骤**：

1. 完成测试，记录人格组合（如：W1 × I2）
2. 记录展示的小剧场文本
3. 返回首页重新测试
4. 选择相同答案（相同人格组合）
5. 对比小剧场文本

**预期结果**：

- 相同人格组合下，小剧场文本应该有所不同
- 句子来自不同的句子池组合

**验证方法**：

- 多次测试同一组合（3-5 次）
- 观察 opening、wendyAction、ireneAction、childReaction、ending 是否有变化

---

### ✅ Test 7: 边界条件测试

**步骤**：

1. **未完成测试提交**：
   - 只回答 10 道题
   - 点击提交按钮
   - 预期：按钮灰色不可点击，显示"请完成全部题目"

2. **直接访问结果页**：
   - 清除 sessionStorage：`sessionStorage.clear()`
   - 访问 http://localhost:3000/result
   - 预期：自动重定向到首页

3. **中断答题后继续**：
   - 回答 15 道题
   - 刷新页面
   - 预期：答案被清除，重新开始

---

### ✅ Test 8: 平局处理验证

**目标**：验证分数相同时按序号优先（W1>W2>W3>W4, I1>I2>I3>I4）

**说明**：由于计分规则复杂，需要分析题目选项来构造平局场景。可以通过查看 `questions.json` 找到能让特定人格得分相同的选项组合。

**简化验证**：

- 多次随机测试，观察是否有重复组合
- 如果出现 W1 和 W2 分数接近的情况，记录选项并重复测试验证一致性

---

## 性能和体验测试

### ✅ Test 9: 响应式设计

**步骤**：

1. 在桌面浏览器（>1024px）测试
2. 调整窗口到平板尺寸（768px）
3. 调整到移动端尺寸（375px）

**预期结果**：

- 布局自适应，无横向滚动
- 移动端人格卡片垂直堆叠
- 按钮和文本大小合适

---

### ✅ Test 10: 浏览器兼容性

**测试浏览器**：

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)

**预期结果**：

- 所有浏览器功能正常
- 样式一致

---

## API 测试

### ✅ Test 11: API 错误处理

**使用浏览器控制台测试**：

**1. 不完整答案（预期 400）**：

```javascript
fetch('/api/quiz/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    optionIds: ['q1_a', 'q2_b', 'q3_c'], // 只有 3 个
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**2. 无效选项 ID（预期 400）**：

```javascript
fetch('/api/quiz/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    optionIds: Array(24).fill('invalid_id'),
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**3. 格式错误的请求（预期 400）**：

```javascript
fetch('/api/quiz/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wrong_field: 'test' }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 验收标准

### ✅ 必须通过的测试

- [ ] Test 1: 首页加载正常
- [ ] Test 2: 全选第一个选项，能获得结果
- [ ] Test 3: 全选第二个选项，结果与 Test 2 不同
- [ ] Test 4: 随机组合能出现多种结果（≥5 种）
- [ ] Test 5: 结果页所有功能正常
- [ ] Test 6: 小剧场具有随机性
- [ ] Test 7: 边界条件处理正确
- [ ] Test 9: 响应式设计良好
- [ ] Test 11: API 错误处理正确

### ⚠️ 可选测试

- [ ] Test 8: 平局处理（需要深入分析题目）
- [ ] Test 10: 浏览器兼容性

---

## 已知问题和限制（Phase 1 MVP）

### 预期限制（非 bug）

1. ✅ 无用户登录功能
2. ✅ 结果不保存到数据库
3. ✅ 刷新答题页会丢失答案
4. ✅ 分享功能仅占位
5. ✅ 小剧场为句子池组合，非 AI 生成

### 需要修复的问题

- 记录测试过程中发现的任何 bug
- 性能问题
- UI 问题
- 逻辑错误

---

## 测试完成检查清单

完成测试后，确认以下内容：

- [ ] 无控制台错误或警告
- [ ] TypeScript 编译无错误（`npm run build` 或 `npx tsc --noEmit`）
- [ ] 所有必须测试用例通过
- [ ] 记录了至少 5 种不同的人格组合结果
- [ ] 验证了小剧场随机性
- [ ] 移动端和桌面端都能正常使用
- [ ] API 错误处理符合预期

---

## 下一步行动

测试通过后：

1. ✅ 标记 Step 8 为完成
2. ✅ 提交代码
3. ✅ 更新 README.md
4. 🚀 准备部署或演示

测试未通过：

1. 记录 bug 和问题
2. 修复问题
3. 重新测试
4. 重复直到所有测试通过
