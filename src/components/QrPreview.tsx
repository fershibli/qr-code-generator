import DownloadIcon from '@mui/icons-material/Download'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PREVIEW_SIZE } from '../constants'

type QrPreviewProps = {
  previewUrl: string | null
  resolution: number
  loading: boolean
  error: string | null
  disabled: boolean
  onDownload: () => void
}

export function QrPreview({
  previewUrl,
  resolution,
  loading,
  error,
  disabled,
  onDownload,
}: QrPreviewProps) {
  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', overflow: 'auto' }}>
      <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6">Preview</Typography>
          <Typography variant="body2" color="text.secondary">
            Displayed at {PREVIEW_SIZE}×{PREVIEW_SIZE} px. Download uses the
            selected resolution.
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: '#ffffff',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="QR code preview"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <Stack
              spacing={1}
              sx={{ alignItems: 'center', px: 3, color: 'text.secondary' }}
            >
              <QrCode2Icon sx={{ fontSize: 48 }} />
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Enter a URL to generate a QR code.
              </Typography>
            </Stack>
          )}

          {loading ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.72)',
              }}
            >
              <CircularProgress size={36} />
            </Box>
          ) : null}
        </Box>

        {error ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        ) : null}

        <Button
          variant="contained"
          size="large"
          startIcon={<DownloadIcon />}
          disabled={disabled || loading || !previewUrl}
          onClick={onDownload}
          fullWidth
        >
          Download
        </Button>
        {previewUrl && !disabled ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', width: '100%' }}
          >
            {resolution}x{resolution}px
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  )
}
