import { Box, Typography } from '@mui/material';
import type { ParentCharacterCard } from '@/features/quiz/types';

interface PersonalityCardProps {
  character: ParentCharacterCard;
  label: string;
  primaryColor: string;
  lightColor: string;
  darkColor: string;
}

export const PersonalityCard = ({
  character,
  label,
  primaryColor,
  lightColor,
  darkColor,
}: PersonalityCardProps) => {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: 3,
        borderTop: `4px solid ${primaryColor}`,
      }}
    >
      {/* 顶部：表情符号 + 你的XXX是职业 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ mr: 1.5 }}>
          {character.emoji}
        </Typography>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: primaryColor }}>
            {label}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
            {character.job}
          </Typography>
        </Box>
      </Box>

      {/* 中间：故事描述 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          {character.story}
        </Typography>
      </Box>

      {/* 底部：性格标签 */}
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {character.tags.map((tag: string, index: number) => (
            <Box
              key={index}
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: lightColor,
                color: darkColor,
                borderRadius: 999,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
