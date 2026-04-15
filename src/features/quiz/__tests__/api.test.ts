/**
 * API 测试脚本
 * 用于验证 /api/quiz/submit 接口
 */

/**
 * 测试数据：全选第一个选项
 */
export const testAnswers_AllFirst = {
  optionIds: [
    'q1_a',
    'q2_a',
    'q3_a',
    'q4_a',
    'q5_a',
    'q6_a',
    'q7_a',
    'q8_a',
    'q9_a',
    'q10_a',
    'q11_a',
    'q12_a',
    'q13_a',
    'q14_a',
    'q15_a',
    'q16_a',
    'q17_a',
    'q18_a',
    'q19_a',
    'q20_a',
    'q21_a',
    'q22_a',
    'q23_a',
    'q24_a',
  ],
};

/**
 * 测试数据：全选第二个选项
 */
export const testAnswers_AllSecond = {
  optionIds: [
    'q1_b',
    'q2_b',
    'q3_b',
    'q4_b',
    'q5_b',
    'q6_b',
    'q7_b',
    'q8_b',
    'q9_b',
    'q10_b',
    'q11_b',
    'q12_b',
    'q13_b',
    'q14_b',
    'q15_b',
    'q16_b',
    'q17_b',
    'q18_b',
    'q19_b',
    'q20_b',
    'q21_b',
    'q22_b',
    'q23_b',
    'q24_b',
  ],
};

/**
 * 测试：提交不完整的答案（应该返回 400）
 */
export const testAnswers_Incomplete = {
  optionIds: ['q1_a', 'q2_a', 'q3_a'], // 只有 3 个答案
};

/**
 * 测试：提交无效的选项 ID（应该返回 400）
 */
export const testAnswers_Invalid = {
  optionIds: [
    'invalid_1',
    'invalid_2',
    'invalid_3',
    'invalid_4',
    'invalid_5',
    'invalid_6',
    'invalid_7',
    'invalid_8',
    'invalid_9',
    'invalid_10',
    'invalid_11',
    'invalid_12',
    'invalid_13',
    'invalid_14',
    'invalid_15',
    'invalid_16',
    'invalid_17',
    'invalid_18',
    'invalid_19',
    'invalid_20',
    'invalid_21',
    'invalid_22',
    'invalid_23',
    'invalid_24',
  ],
};

/**
 * 发送测试请求
 */
export const testApi = async (data: { optionIds: string[] }) => {
  const response = await fetch('http://localhost:3000/api/quiz/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(result, null, 2));
  return result;
};

/**
 * 运行所有测试
 */
export const runAllTests = async () => {
  console.log('=== 测试 1: 全选第一个选项 ===');
  await testApi(testAnswers_AllFirst);

  console.log('\n=== 测试 2: 全选第二个选项 ===');
  await testApi(testAnswers_AllSecond);

  console.log('\n=== 测试 3: 不完整的答案（预期 400 错误） ===');
  await testApi(testAnswers_Incomplete);

  console.log('\n=== 测试 4: 无效的选项 ID（预期 400 错误） ===');
  await testApi(testAnswers_Invalid);
};

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error);
}
