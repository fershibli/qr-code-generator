import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createAppTheme } from '../theme'

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={createAppTheme('light')}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Wrapper, ...options })
}
