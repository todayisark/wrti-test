'use client';

/**
 * 首页引导页面
 * 项目介绍和开始测试入口
 */

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Button, Collapse, IconButton } from '@mui/material';
import { ArrowForward, BarChart, ExpandMore, ExpandLess } from '@mui/icons-material';
import changelogData from '@/features/quiz/data/changelog.json';
import { defaultLocale, hasLocale, type Locale } from '@/i18n/config';
import homeZhCN from '@/i18n/dictionaries/home/zh-CN.json';
import homeEnUS from '@/i18n/dictionaries/home/en-US.json';
import { generateUUID } from '@/lib/uuid';
import Link from 'next/link';

type ChangelogItem = {
  version: string;
  date: string;
  content: string;
};

type HomeDictionary = typeof homeZhCN;

const dictionaries: Record<Locale, HomeDictionary> = {
  'zh-CN': homeZhCN,
  'en-US': homeEnUS,
};

const getLocaleFromPathname = (pathname: string): Locale => {
  const segment = pathname.split('/')[1] || '';
  return hasLocale(segment) ? segment : defaultLocale;
};

/**
 * 生成或获取用户 UUID
 */
const getOrCreateUserUUID = (): string => {
  if (typeof window === 'undefined') return '';
  const key = 'wrti_user_uuid';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let uuid = localStorage.getItem(key);
  if (!uuid || !uuidRegex.test(uuid)) {
    uuid = generateUUID();
    localStorage.setItem(key, uuid);
  }
  return uuid;
};

const HomePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const dict = dictionaries[currentLocale];
  const changelog = changelogData as ChangelogItem[];
  const latestLog = changelog[0];
  const historyLogs = changelog.slice(1);

  // ✅ 使用 useState 的 lazy initializer，只在客户端首次渲染时执行一次
  const [hasResult, setHasResult] = useState(() => {
    // 服务器端渲染时返回 false
    if (typeof window === 'undefined') return false;
    // 客户端首次渲染时读取 localStorage
    return !!localStorage.getItem('quizResult');
  });

  const [expandLog, setExpandLog] = useState(false);

  // ✅ 只在 effect 中处理真正的副作用（UUID 初始化）
  useEffect(() => {
    getOrCreateUserUUID();
  }, []);

  const handleStartQuiz = () => {
    localStorage.removeItem('quizResult');
    setHasResult(false); // 同步更新状态
    router.push(`/${currentLocale}/quiz`);
  };

  const handleViewResult = () => {
    router.push(`/${currentLocale}/result`);
  };

  const handleSwitchLanguage = (locale: Locale) => {
    if (locale === currentLocale) return;
    router.push(`/${locale}`);
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
        {/* 语言切换 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: '9999px',
                bgcolor: 'white',
                boxShadow: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
                {dict.language.label}
              </Typography>
              <Button
                size="small"
                variant={currentLocale === 'zh-CN' ? 'contained' : 'text'}
                onClick={() => handleSwitchLanguage('zh-CN')}
                sx={{
                  minWidth: 64,
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {dict.language.zhCN}
              </Button>
              <Button
                size="small"
                variant={currentLocale === 'en-US' ? 'contained' : 'text'}
                onClick={() => handleSwitchLanguage('en-US')}
                sx={{
                  minWidth: 64,
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {dict.language.enUS}
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {dict.language.aiNote}
            </Typography>
          </Box>
        </Box>

        {/* 主标题区域 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {dict.hero.titleLine1}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {dict.hero.titleLine2}
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
            {dict.hero.subtitlePrefix}{' '}
            <Box component="span" sx={{ color: '#3b82f6', fontWeight: 600 }}>
              {dict.hero.wendyName}
            </Box>{' '}
            ×{' '}
            <Box component="span" sx={{ color: '#ec4899', fontWeight: 600 }}>
              {dict.hero.ireneName}
            </Box>{' '}
            {dict.hero.subtitleSuffix}
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
            {dict.intro.line1Prefix}
            <Box component="span" sx={{ color: '#3b82f6', fontWeight: 600 }}>
              {dict.hero.wendyName}
            </Box>{' '}
            和{' '}
            <Box component="span" sx={{ color: '#ec4899', fontWeight: 600 }}>
              {dict.hero.ireneName}
            </Box>{' '}
            {dict.intro.line1Suffix}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {dict.intro.line2}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {dict.intro.line3}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {dict.intro.line4}
          </Typography>

          {/* 分割线 */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3, mt: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
              {dict.instructions.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dict.instructions.items.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary">
                  • {item}
                </Typography>
              ))}
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
            {dict.actions.startQuiz}
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
              {dict.actions.viewResult}
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
          {latestLog ? (
            <>
              {/* 最新日志单行显示 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: expandLog && historyLogs.length > 0 ? 2 : 0,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                      {latestLog.version}
                    </Box>
                    {' · '}
                    <Box component="span" sx={{ fontSize: '0.875rem' }}>
                      {latestLog.date}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {latestLog.content}
                  </Typography>
                </Box>
                {historyLogs.length > 0 && (
                  <IconButton onClick={() => setExpandLog(!expandLog)} sx={{ ml: 2 }} size="small">
                    {expandLog ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Box>

              {/* 展开区域-历史日志 */}
              <Collapse in={expandLog && historyLogs.length > 0}>
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e5e7eb' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                    {dict.changelog.historyTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {historyLogs.map((item) => (
                      <Box key={`${item.version}-${item.date}`}>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" sx={{ fontWeight: 600, color: '#ec4899' }}>
                            {item.version}
                          </Box>
                          {' · '}
                          <Box component="span" sx={{ fontSize: '0.875rem' }}>
                            {item.date}
                          </Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {item.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {dict.changelog.empty}
            </Typography>
          )}
        </Box>

        {/* 页脚说明 */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {dict.footer.disclaimer}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {`${latestLog?.version || 'v1.0.0'} ${dict.footer.metaSuffix}`}
          </Typography>
        </Box>

        {/* 作者链接 */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {dict.footer.contact}
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
      {/* 备案号 */}
      <Box sx={{ mt: 4, textAlign: 'center', fontSize: '0.8rem', color: 'text.secondary' }}>
        <Link href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          京ICP备2026023010号
        </Link>
      </Box>
    </Box>
  );
};

export default HomePage;
