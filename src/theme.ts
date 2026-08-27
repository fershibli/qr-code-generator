import { createTheme, type Theme } from '@mui/material/styles'

export type ColorMode = 'light' | 'dark'

export function createAppTheme(mode: ColorMode): Theme {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1565c0',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f4f6fb',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: {
        fontWeight: 700,
      },
    },
  })
}
