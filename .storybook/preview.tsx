import CssBaseline from '@mui/material/CssBaseline'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react-vite'
import { ColorModeProvider } from '../src/components/ColorModeProvider'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-color-mode',
    }),
    (Story, context) => {
      const theme = String(context.globals.theme ?? 'light')
      return (
        <ColorModeProvider key={theme}>
          <CssBaseline />
          <Story />
        </ColorModeProvider>
      )
    },
  ],
}

export default preview
