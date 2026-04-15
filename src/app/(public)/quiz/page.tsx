'use client';

/**
 * 答题页面
 * 展示 24 道题目，记录用户选择，提交后跳转到结果页
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/features/quiz/constants';
import type { QuizSubmitResponse } from '@/features/quiz/types';

const QuizPage = () => {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查是否全部作答
  const isComplete = Object.keys(answers).length === 24;

  // 处理选项选择
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // 提交答案
  const handleSubmit = async () => {
    if (!isComplete) {
      setError('请回答全部 24 道题');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 构造 optionIds 数组
      const optionIds = QUESTIONS.map((q) => answers[q.id]);

      // 调用 API
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIds }),
      });

      const result: QuizSubmitResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.success ? '' : result.error || '提交失败');
      }

      // 将结果存到 sessionStorage
      sessionStorage.setItem('quizResult', JSON.stringify(result.data));

      // 跳转到结果页
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CP 人格测试</h1>
          <p className="text-gray-600">共 24 道题 · 已完成 {Object.keys(answers).length} / 24</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / 24) * 100}%` }}
            />
          </div>
        </div>

        {/* 题目列表 */}
        <div className="space-y-6">
          {QUESTIONS.map((question, index) => {
            const isAnswered = !!answers[question.id];
            return (
              <div
                key={question.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  isAnswered ? 'border-2 border-purple-300' : ''
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {index + 1}. {question.prompt}
                </h3>

                <div className="space-y-3">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(question.id, option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                              isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          <span className="text-gray-700">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 提交按钮 */}
        <div className="mt-8 sticky bottom-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                isComplete && !isSubmitting
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '提交中...' : isComplete ? '查看结果' : '请完成全部题目'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
