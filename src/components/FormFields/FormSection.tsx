import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

/** Titled block of related controls, with one consistent gap between them. */
export function FormSection({
  title,
  description,
  action,
  children,
}: FormSectionProps) {
  return (
    <Box component="section">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              lineHeight: 1.6,
              letterSpacing: '0.08em',
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>
      <Stack spacing={2.5} sx={{ mt: 1.5 }}>
        {children}
      </Stack>
    </Box>
  )
}
