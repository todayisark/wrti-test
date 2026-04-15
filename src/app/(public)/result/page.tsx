'use client';

/**
 * 结果展示页面
 * 从 sessionStorage 读取测试结果并展示
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizResult } from '@/features/quiz/types';

const ResultPage = () => {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 sessionStorage 读取结果
    const savedResult = sessionStorage.getItem('quizResult');

    if (!savedResult) {
      // 如果没有结果，重定向到首页
      router.push('/');
      return;
    }

    try {
      const parsedResult = JSON.parse(savedResult) as QuizResult;
      setResult(parsedResult);
    } catch (error) {
      console.error('Failed to parse result:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleRetry = () => {
    sessionStorage.removeItem('quizResult');
    router.push('/quiz');
  };

  const handleShare = () => {
    // TODO: 实现分享功能（Phase 3）
    alert('分享功能将在后续版本中实现');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 结果标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{result.resultTitle}</h1>
          <p className="text-lg text-gray-600">{result.resultSummary}</p>
        </div>

        {/* 父母人格卡片 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Wendy 人格卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-400">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">{result.wendyType.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{result.wendyType.title}</h2>
                <p className="text-sm text-gray-500">{result.wendyType.job}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">性格特质</h3>
              <div className="flex flex-wrap gap-2">
                {result.wendyType.personalityTraits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">性格摘要</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.wendyType.personalitySummary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">详细描述</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.wendyType.detailedDescription}
              </p>
            </div>
          </div>

          {/* Irene 人格卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-400">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">{result.ireneType.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{result.ireneType.title}</h2>
                <p className="text-sm text-gray-500">{result.ireneType.job}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">性格特质</h3>
              <div className="flex flex-wrap gap-2">
                {result.ireneType.personalityTraits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">性格摘要</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.ireneType.personalitySummary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">详细描述</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.ireneType.detailedDescription}
              </p>
            </div>
          </div>
        </div>

        {/* 小剧场 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">一家三口的日常</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.story}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            重新测试
          </button>
          <button
            onClick={handleShare}
            className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-lg border-2 border-gray-300 hover:border-purple-400 transition-all"
          >
            分享结果
          </button>
        </div>

        {/* 返回首页链接 */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-purple-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
