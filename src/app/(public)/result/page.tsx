'use client';

/**
 * 结果展示页面
 * 从 localStorage 读取测试结果并展示
 */

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import type { QuizResult } from '@/features/quiz/types';
import { PersonalityCard } from '@/components/PersonalityCard';
import { defaultLocale, hasLocale, type Locale } from '@/i18n/config';
import resultZhCN from '@/i18n/dictionaries/result/zh-CN.json';
import resultEnUS from '@/i18n/dictionaries/result/en-US.json';

type ResultDictionary = typeof resultZhCN;

const resultDictionaries: Record<Locale, ResultDictionary> = {
  'zh-CN': resultZhCN,
  'en-US': resultEnUS,
};

const getLocaleFromPathname = (pathname: string): Locale => {
  const segment = pathname.split('/')[1] || '';
  return hasLocale(segment) ? segment : defaultLocale;
};

const ResultPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const dict = resultDictionaries[currentLocale];
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 读取结果
    const savedResult = localStorage.getItem('quizResult');

    if (!savedResult) {
      // 如果没有结果，重定向到首页
      router.push(`/${currentLocale}`);
      return;
    }

    try {
      const parsedResult = JSON.parse(savedResult) as QuizResult;
      setResult(parsedResult);
    } catch (error) {
      console.error(dict.redirect.parseErrorLog, error);
      router.push(`/${currentLocale}`);
    } finally {
      setIsLoading(false);
    }
  }, [router, currentLocale, dict.redirect.parseErrorLog]);

  const handleRetry = () => {
    localStorage.removeItem('quizResult');
    router.push(`/${currentLocale}/quiz`);
  };

  const handleShare = () => {
    // TODO: 实现分享功能（Phase 3）
    alert(dict.actions.shareComingSoon);
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
            {dict.loading.text}
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              mt: 2,
            }}
          >
            {result.resultEmoji}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              mt: 2,
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
            {result.resultLabel}
          </Typography>
        </Box>
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
          label={dict.cards.wendyLabel}
          primaryColor="#3b82f6"
          lightColor="#dbeafe"
          darkColor="#1e40af"
        />
        <PersonalityCard
          character={result.ireneType}
          label={dict.cards.ireneLabel}
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
            {dict.cards.specialYou}
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
            {dict.cards.personalityTitle}
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
            {dict.cards.parentingTitle}
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
        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
          {dict.story.title}
        </Typography>
        <Box
          sx={{
            width: 220,
            height: 4,
            mx: 'auto',
            mb: 6,
            borderRadius: 999,
            background: 'linear-gradient(to right, #ec4899, #3b82f6)',
          }}
        />
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
          {dict.actions.retry}
        </Button>
        {/* <Button
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
          </Button> */}
      </Box>

      {/* 返回首页链接 */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={() => router.push(`/${currentLocale}`)}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              color: '#3b82f6',
              bgcolor: 'transparent',
            },
          }}
        >
          {dict.actions.backHome}
        </Button>
      </Box>
    </Box>
  );
};

export default ResultPage;
