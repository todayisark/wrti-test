'use client';

/**
 * 首页引导页面
 * 项目介绍和开始测试入口
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Collapse, IconButton } from '@mui/material';
import { ArrowForward, BarChart, ExpandMore, ExpandLess } from '@mui/icons-material';

/**
 * 生成或获取用户 UUID
 */
const getOrCreateUserUUID = (): string => {
  if (typeof window === 'undefined') return '';
  const key = 'wrti_user_uuid';
  let uuid = localStorage.getItem(key);
  if (!uuid) {
    uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, uuid);
  }
  return uuid;
};

const HomePage = () => {
  const router = useRouter();
  // 使用函数式初始化，只在组件首次渲染时执行一次
  const [hasResult, setHasResult] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('quizResult');
    }
    return false;
  });

  const [expandLog, setExpandLog] = useState(false);

  // 初始化用户 UUID
  const userUUID = getOrCreateUserUUID();

  const handleStartQuiz = () => {
    localStorage.removeItem('quizResult');
    setHasResult(false); // 同步更新状态
    router.push('/quiz');
  };

  const handleViewResult = () => {
    router.push('/result');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fce7f3',
        pb: 8,
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 }, py: 8 }}>
        {/* 主标题区域 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            测一测你是哪种
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            「她们的孩子」
          </Typography>
          {/* <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              display: 'inline-block',
              backgroundImage: 'linear-gradient(90deg, #ec4899, #3b82f6, #ec4899)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'flowGradient 4s linear infinite',
              whiteSpace: 'pre-line',
              lineHeight: 1.3,
              '@keyframes flowGradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '200% 50%' },
              },
            }}
          >
            WRTI
          </Typography> */}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            探索你是哪种{' '}
            <Box component="span" sx={{ color: '#3b82f6', fontWeight: 600 }}>
              孙承完
            </Box>{' '}
            ×{' '}
            <Box component="span" sx={{ color: '#ec4899', fontWeight: 600 }}>
              裴柱现
            </Box>{' '}
            的孩子
          </Typography>
        </Box>

        {/* 介绍卡片 */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 4,
            p: 4,
            mb: 4,
            boxShadow: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            在不同的世界线里，
            <Box component="span" sx={{ color: '#3b82f6', fontWeight: 600 }}>
              孙承完
            </Box>{' '}
            和{' '}
            <Box component="span" sx={{ color: '#ec4899', fontWeight: 600 }}>
              裴柱现
            </Box>{' '}
            会以不同的样子相遇。
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            她们的性格不同，职业不同，爱你的方式也不一样。
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            有的家庭温柔而安静，有的克制而深沉，有的明亮到让人离不开。
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            而你，会在这样的家庭里长大，慢慢成为独一无二的那一个。
          </Typography>

          {/* 分割线 */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3, mt: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
              测试说明
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • 共 24 道题目，需要全部完成
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 每道题请选择最符合你的选项
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 预计用时 5-8 分钟
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 完成后将获得你的专属人格组合和一个温馨的一家三口小剧场
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 按钮区域 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuiz}
            endIcon={<ArrowForward />}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.125rem',
              fontWeight: 600,
              borderRadius: '9999px',
              background: 'linear-gradient(to right, #ec4899, #3b82f6)',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(to right, #db2777, #2563eb)',
                boxShadow: 6,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            开始测试
          </Button>
          {hasResult && (
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewResult}
              endIcon={<BarChart />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: '9999px',
                borderWidth: 2,
                borderColor: '#60a5fa',
                color: '#3b82f6',
                bgcolor: 'white',
                boxShadow: 3,
                '&:hover': {
                  bgcolor: '#eff6ff',
                  borderWidth: 2,
                  borderColor: '#60a5fa',
                  boxShadow: 6,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              查看结果
            </Button>
          )}
        </Box>

        {/* 更新日志区域 */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 4,
            p: 4,
            mb: 6,
            mt: 6,
            boxShadow: 3,
          }}
        >
          {/* 最新日志单行显示 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: expandLog ? 2 : 0,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  v1.1.0
                </Box>
                {' · '}
                <Box component="span" sx={{ fontSize: '0.875rem' }}>
                  2026-04-16 00:59:30
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                优化计分算法，改进平分处理机制
              </Typography>
            </Box>
            <IconButton onClick={() => setExpandLog(!expandLog)} sx={{ ml: 2 }} size="small">
              {expandLog ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* 展开区域-历史日志 */}
          <Collapse in={expandLog}>
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e5e7eb' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                更新历史
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <Box component="span" sx={{ fontWeight: 600, color: '#ec4899' }}>
                      v1.0.0
                    </Box>
                    {' · '}
                    <Box component="span" sx={{ fontSize: '0.875rem' }}>
                      2026-04-10 10:00:00
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    完成 24 道测试题库、16 种人格组合与对应故事
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* 页脚说明 */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            本测试仅供娱乐，所有人格特质均为虚构设定
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            v1.1.0 MVP · 无需登录 · 结果仅本地保存
          </Typography>
        </Box>

        {/* 作者链接 */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            联系作者
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              component="a"
              href="https://github.com/todayisark"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              GitHub
            </Typography>
            <Typography sx={{ color: 'text.disabled' }}>·</Typography>
            <Typography
              component="a"
              href="https://xhslink.com/m/8w8Vj7p3TWK"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#ec4899',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              小红书
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
