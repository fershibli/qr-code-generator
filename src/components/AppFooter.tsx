import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const REPO_URL = 'https://github.com/fershibli/qr-code-generator'

export function AppFooter() {
  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center', pt: 2 }}>
      <Typography variant="caption" color="text.secondary">
        v{__APP_VERSION__}
      </Typography>
      <Link
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="caption"
      >
        github.com/fershibli/qr-code-generator
      </Link>
    </Stack>
  )
}
