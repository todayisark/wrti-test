'use client';

/**
 * 结果展示页面
 * 从 localStorage 读取测试结果并展示
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import type { QuizResult } from '@/features/quiz/types';
import { PersonalityCard } from '@/components/PersonalityCard';

const ResultPage = () => {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 读取结果
    const savedResult = localStorage.getItem('quizResult');

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
    localStorage.removeItem('quizResult');
    router.push('/quiz');
  };

  const handleShare = () => {
    // TODO: 实现分享功能（Phase 3）
    alert('分享功能将在后续版本中实现');
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #fce7f3, #dbeafe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              border: '3px solid transparent',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            加载中...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #fce7f3, #dbeafe)',
        py: { xs: 6, md: 12 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* 结果标题 */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {result.resultTitle}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            {result.resultSummary}
          </Typography>
        </Box>

        {/* 父母人格卡片 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 8,
          }}
        >
          <PersonalityCard
            character={result.wendyType}
            label="你的妈咪孙承完是"
            primaryColor="#3b82f6"
            lightColor="#dbeafe"
            darkColor="#1e40af"
          />
          <PersonalityCard
            character={result.ireneType}
            label="你的妈妈裴柱现是"
            primaryColor="#ec4899"
            lightColor="#fce7f3"
            darkColor="#be185d"
          />
        </Box>

        {/* 孩子人格卡片 */}
        <Box
          sx={{
            background: 'linear-gradient(to right, #ec4899, #3b82f6)',
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            mb: 8,
            boxShadow: 4,
            color: 'white',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              {result.childProfile.emoji}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {result.childProfile.label}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              特别的你
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}
            >
              <Box component="span" sx={{ mr: 1 }}>
                ✨
              </Box>
              你的性格
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.7 }}>
              {result.childProfile.personality}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}
            >
              <Box component="span" sx={{ mr: 1 }}>
                💝
              </Box>
              她们会怎么爱你
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.7 }}>
              {result.childProfile.parentingStyle}
            </Typography>
          </Box>
        </Box>

        {/* 小剧场 */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            mb: 6,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
            一家三口的日常
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', lineHeight: 1.8, whiteSpace: 'pre-line' }}
          >
            {result.story}
          </Typography>
        </Box>

        {/* 操作按钮 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Button
            onClick={handleRetry}
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(to right, #ec4899, #3b82f6)',
              color: 'white',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 3,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to right, #db2777, #2563eb)',
                boxShadow: 4,
              },
            }}
          >
            重新测试
          </Button>
          <Button
            onClick={handleShare}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: 'white',
              color: 'text.primary',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 3,
              border: '2px solid #e5e7eb',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'white',
                borderColor: '#3b82f6',
              },
            }}
          >
            分享结果
          </Button>
        </Box>

        {/* 返回首页链接 */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            onClick={() => router.push('/')}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': {
                color: '#3b82f6',
                bgcolor: 'transparent',
              },
            }}
          >
            返回首页
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResultPage;
