import { createTheme } from '@mui/material/styles';

// 创建自定义 MUI 主题
// 孙承完代表色：蓝色 | 裴柱现代表色：粉色
export const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // 孙承完-蓝色 (blue-500)
      light: '#60a5fa', // blue-400
      dark: '#2563eb', // blue-600
    },
    secondary: {
      main: '#ec4899', // 裴柱现-粉色 (pink-500)
      light: '#f472b6', // pink-400
      dark: '#db2777', // pink-600
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 不自动大写
          borderRadius: '9999px', // 圆角按钮
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // 圆角卡片
        },
      },
    },
  },
});
