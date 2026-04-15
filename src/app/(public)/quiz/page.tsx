'use client';

/**
 * 答题页面
 * 展示 24 道题目，记录用户选择，提交后跳转到结果页
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
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

      // 获取用户 UUID
      const userUUID = localStorage.getItem('wrti_user_uuid') || '';

      // 调用 API
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIds, userUUID }),
      });

      const result: QuizSubmitResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.success ? '' : result.error || '提交失败');
      }

      // 将结果存到 localStorage
      localStorage.setItem('quizResult', JSON.stringify(result.data));

      // 跳转到结果页
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fce7f3',
        py: 8,
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* 固定进度条 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: 'white',
          boxShadow: 2,
          py: 1.5,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
            已完成 {Object.keys(answers).length} / 24
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 6,
              bgcolor: '#f3f4f6',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: 'linear-gradient(to right, #ec4899, #3b82f6)',
                borderRadius: 999,
                transition: 'width 0.3s',
                width: `${(Object.keys(answers).length / 24) * 100}%`,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', pt: 8 }}>
        {/* 页面标题 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            「她们的孩子」人格测试
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            共 24 道题
          </Typography>
        </Box>

        {/* 题目列表 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {QUESTIONS.map((question, index) => {
            const isAnswered = !!answers[question.id];
            return (
              <Box
                key={question.id}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  boxShadow: 2,
                  border: isAnswered ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {index + 1}. {question.prompt}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.id;
                    return (
                      <Box
                        key={option.id}
                        onClick={() => handleOptionSelect(question.id, option.id)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                          bgcolor: isSelected ? '#eff6ff' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#60a5fa',
                            bgcolor: isSelected ? '#eff6ff' : '#f9fafb',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          {/* 单选圆圈 */}
                          <Box
                            sx={{
                              flexShrink: 0,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #3b82f6' : '2px solid #d1d5db',
                              bgcolor: isSelected ? '#3b82f6' : 'transparent',
                              mr: 1.5,
                              mt: 0.2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'white',
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {option.text}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* 提交按钮 */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            mt: 4,
          }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              p: 2,
              boxShadow: 4,
            }}
          >
            {error && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: '#dc2626' }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              fullWidth
              sx={{
                py: 2,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background:
                  isComplete && !isSubmitting
                    ? 'linear-gradient(to right, #ec4899, #3b82f6)'
                    : '#d1d5db',
                color: 'white',
                boxShadow: isComplete && !isSubmitting ? 3 : 0,
                '&:hover': {
                  background:
                    isComplete && !isSubmitting
                      ? 'linear-gradient(to right, #db2777, #2563eb)'
                      : '#d1d5db',
                  boxShadow: isComplete && !isSubmitting ? 6 : 0,
                },
                '&:disabled': {
                  color: 'white',
                  cursor: 'not-allowed',
                },
              }}
            >
              {isSubmitting ? '提交中...' : isComplete ? '查看结果' : '请完成全部题目'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default QuizPage;
