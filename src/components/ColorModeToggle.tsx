import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import { useColorModeContext } from './ColorModeProvider'

export function ColorModeToggle() {
  const { mode, toggleColorMode } = useColorModeContext()
  const isDark = mode === 'dark'

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <LightModeOutlinedIcon
        fontSize="small"
        color={isDark ? 'disabled' : 'warning'}
      />
      <Switch
        checked={isDark}
        onChange={toggleColorMode}
        inputProps={{ 'aria-label': 'Toggle dark mode' }}
      />
      <DarkModeOutlinedIcon
        fontSize="small"
        color={isDark ? 'primary' : 'disabled'}
      />
    </Stack>
  )
}
