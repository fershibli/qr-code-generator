import { useMemo, type ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useColorMode } from '../../hooks/useColorMode'
import { createAppTheme } from '../../theme'
import { ColorModeContext } from './colorModeContext'

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const { mode, toggleColorMode } = useColorMode()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
