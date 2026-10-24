import { createTheme } from '@mantine/core'

// University of Akron navy (#041E42) and gold (#A89968), lightest to darkest.
const akronBlue = ['#e7ebf3', '#c9d2e4', '#9fb0cf', '#738cb8', '#4d6ba1', '#30508a', '#1d3c73', '#112d5c', '#0a2550', '#041e42']
const akronGold = ['#f7f5ef', '#ece7da', '#ddd4bd', '#cdc19f', '#bfb085', '#b3a375', '#a89968', '#918357', '#786c47', '#5f5537']

export const theme = createTheme({
  colors: { akronBlue, akronGold },
  primaryColor: 'akronBlue',
  primaryShade: 8,
  defaultRadius: 'md',
  headings: { fontWeight: '650' },
})
