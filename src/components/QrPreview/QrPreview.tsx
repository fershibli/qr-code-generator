import DownloadIcon from '@mui/icons-material/Download'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useRef } from 'react'
import { PREVIEW_SIZE } from '../../constants'
import { useElementOutOfView } from '../../hooks/useElementOutOfView'

type QrPreviewProps = {
  previewUrl: string | null
  quietZoneColor?: string
  resolution: number
  version?: number
  moduleCount?: number
  loading: boolean
  error: string | null
  disabled: boolean
  onDownload: () => void
}

function QrFrame({
  previewUrl,
  quietZoneColor,
  loading,
  compact,
}: {
  previewUrl: string | null
  quietZoneColor: string
  loading: boolean
  compact?: boolean
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: compact ? 'auto' : { xs: '100%', md: 'min(100%, 500px)' },
        height: compact ? '100%' : undefined,
        maxWidth: compact ? '100%' : PREVIEW_SIZE,
        maxHeight: compact ? '100%' : { md: '100%' },
        aspectRatio: '1 / 1',
        flex: compact ? undefined : { md: '1 1 0' },
        minHeight: compact ? 0 : { md: 0 },
        flexShrink: compact ? 1 : { xs: 0, md: 1 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: quietZoneColor,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: compact ? 'stretch' : { md: 'center' },
      }}
    >
      {previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={compact ? '' : 'QR code preview'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <Stack
          spacing={compact ? 0 : 1}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            px: compact ? 0.5 : 3,
            textAlign: 'center',
            color: (theme) => {
              try {
                return theme.palette.getContrastText(quietZoneColor) ===
                  theme.palette.common.white
                  ? 'rgba(255,255,255,0.72)'
                  : 'rgba(0,0,0,0.54)'
              } catch {
                return 'rgba(0,0,0,0.54)'
              }
            },
          }}
        >
          <QrCode2Icon sx={{ fontSize: compact ? 28 : 48 }} />
          {compact ? null : (
            <>
              <Typography variant="body2">
                Enter a URL to generate a QR code.
              </Typography>
              <Typography variant="body2">
                The preview will appear here.
              </Typography>
            </>
          )}
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
          <CircularProgress size={compact ? 18 : 36} />
        </Box>
      ) : null}
    </Box>
  )
}

export function QrPreview({
  previewUrl,
  quietZoneColor = '#ffffff',
  resolution,
  version,
  moduleCount,
  loading,
  error,
  disabled,
  onDownload,
}: QrPreviewProps) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const cardRef = useRef<HTMLDivElement>(null)
  const outOfView = useElementOutOfView(cardRef, !isMdUp)
  const showDock = !isMdUp && outOfView

  return (
    <>
      <Paper
        ref={cardRef}
        aria-hidden={showDock}
        sx={{
          height: { xs: 'auto', md: '100%' },
          width: '100%',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            overflow: { md: 'auto' },
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              bgcolor: 'action.disabled',
            },
          }}
        >
        <Stack
          spacing={2.5}
          sx={{
            alignItems: 'center',
            width: '100%',
            flex: { md: 1 },
            minHeight: 0,
          }}
        >
          <Box sx={{ width: '100%', flexShrink: 0 }}>
            <Typography variant="h6">Preview</Typography>
            <Typography variant="body2" color="text.secondary">
              Displayed at {PREVIEW_SIZE}×{PREVIEW_SIZE} px. Download uses the
              selected resolution.
            </Typography>
          </Box>

          <QrFrame
            previewUrl={previewUrl}
            quietZoneColor={quietZoneColor}
            loading={loading}
          />

          <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
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
              tabIndex={showDock ? -1 : undefined}
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
            {previewUrl && !disabled && version && moduleCount ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'center', width: '100%' }}
              >
                Version {version} · {moduleCount}×{moduleCount} modules
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        </Box>
      </Paper>

      {showDock ? (
        <Paper
          component="aside"
          elevation={4}
          aria-label="Compact preview"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '20vh',
            zIndex: 1200,
            borderRadius: 0,
            px: 1.5,
            py: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ height: '100%', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: '50%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
              }}
            >
              <QrFrame
                previewUrl={previewUrl}
                quietZoneColor={quietZoneColor}
                loading={loading}
                compact
              />
            </Box>
            <Stack
              spacing={0.75}
              sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
            >
              <Box>
                <Typography variant="subtitle2">Preview</Typography>
                <Typography variant="caption" color="text.secondary">
                  Displayed at {PREVIEW_SIZE}×{PREVIEW_SIZE} px. Download uses
                  the selected resolution.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                disabled={disabled || loading || !previewUrl}
                onClick={onDownload}
              >
                Download
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </>
  )
}
