export const DemoFonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const DemoFontSources = {
  [DemoFonts.regular]: require('../../assets/fonts/Inter-Regular.ttf'),
  [DemoFonts.medium]: require('../../assets/fonts/Inter-Medium.ttf'),
  [DemoFonts.semibold]: require('../../assets/fonts/Inter-SemiBold.ttf'),
  [DemoFonts.bold]: require('../../assets/fonts/Inter-Bold.ttf'),
  [DemoFonts.extraBold]: require('../../assets/fonts/Inter-ExtraBold.ttf'),
} as const;
