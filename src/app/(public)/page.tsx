'use client';

/**
 * 首页引导页面
 * 项目介绍和开始测试入口
 */

import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  const handleStartQuiz = () => {
    // 清除之前的测试结果
    sessionStorage.removeItem('quizResult');
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 主标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">测一测你是哪种「她们的孩子」</h1>
          <p className="text-gray-500">探索你是哪种孙承完 × 裴柱现的孩子</p>
        </div>

        {/* 介绍卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <p className="text-gray-600 leading-relaxed">
            在不同的世界线里，孙承完 和 裴柱现 会以不同的样子相遇。
          </p>
          <p className="text-gray-600 leading-relaxed">
            她们的性格不同，关系不同，爱你的方式也不一样。
          </p>

          <p className="text-gray-600 leading-relaxed">
            有的家庭温柔而安静，有的克制而深沉，有的明亮到让人离不开。
          </p>
          <p className="text-gray-600 leading-relaxed">
            而你，会在这样的家庭里长大，慢慢成为独一无二的那一个。
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">测试说明</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>共 24 道题目，需要全部完成</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>每道题请选择最符合你的选项</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>预计用时 5-8 分钟</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>完成后将获得你的专属人格组合和一个温馨的一家三口小剧场</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 开始按钮 */}
      <div className="text-center">
        <button
          onClick={handleStartQuiz}
          className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-xl hover:from-pink-600 hover:to-purple-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
        >
          开始测试 →
        </button>
      </div>

      {/* 示例人格展示 */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">可能的人格组合</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '🌞', name: '小太阳DJ', color: 'pink' },
            { emoji: '🎵', name: '感性音乐人', color: 'rose' },
            { emoji: '🦷', name: '温柔牙医', color: 'blue' },
            { emoji: '💼', name: '娱乐公司老板', color: 'indigo' },
            { emoji: '🌸', name: '花店老板', color: 'pink' },
            { emoji: '👔', name: '职场精英', color: 'purple' },
            { emoji: '🎨', name: '画家', color: 'violet' },
            { emoji: '👶', name: '幼儿园老师', color: 'fuchsia' },
          ].map((type, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-2">{type.emoji}</div>
              <div className="text-sm text-gray-700 font-medium">{type.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 页脚说明 */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>本测试仅供娱乐，所有人格特质均为虚构设定</p>
        <p className="mt-2">v1.0.0 MVP · 无需登录 · 结果仅本地保存</p>
      </div>
    </div>
  );
};

export default HomePage;
