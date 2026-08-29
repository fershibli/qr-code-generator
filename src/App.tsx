import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { QrForm } from './components/QrForm'
import { QrPreview } from './components/QrPreview'
import { ColorModeToggle } from './components/ColorModeToggle'
import { AppFooter } from './components/AppFooter'
import {
  DEFAULT_LOGO_PADDING,
  DEFAULT_LOGO_SIZE,
  DEFAULT_QR_MARGIN,
  DEFAULT_RESOLUTION,
  type Resolution,
} from './constants'
import { createDefaultQrStyle, type QrStyle } from './qrStyle'
import { generateQrPng } from './utils/generateQrPng'

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}

function App() {
  const [url, setUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [size, setSize] = useState(DEFAULT_LOGO_SIZE)
  const [logoPadding, setLogoPadding] = useState(DEFAULT_LOGO_PADDING)
  const [margin, setMargin] = useState(DEFAULT_QR_MARGIN)
  const [resolution, setResolution] = useState<Resolution>(DEFAULT_RESOLUTION)
  const [style, setStyle] = useState<QrStyle>(createDefaultQrStyle)
  const [logoTransparentBackground, setLogoTransparentBackground] =
    useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedUrl = url.trim()

  function handleLogoChange(file: File | null) {
    setLogoPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return file ? URL.createObjectURL(file) : null
    })
    setLogoFile(file)
  }

  useEffect(() => {
    if (!trimmedUrl) return

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      setLoading(true)
      void generateQrPng({
        url: trimmedUrl,
        logoFile,
        size,
        resolution,
        margin,
        logoPadding,
        style,
        logoTransparentBackground,
      })
        .then((result) => {
          if (cancelled) {
            URL.revokeObjectURL(result.objectUrl)
            return
          }
          setPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous)
            return result.objectUrl
          })
          setBlob(result.blob)
          setError(null)
        })
        .catch((caught: unknown) => {
          if (cancelled) return
          const message =
            caught instanceof Error
              ? caught.message
              : 'Failed to generate QR code'
          setPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous)
            return null
          })
          setBlob(null)
          setError(message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [
    trimmedUrl,
    logoFile,
    size,
    resolution,
    margin,
    logoPadding,
    style,
    logoTransparentBackground,
  ])

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                QR Code Generator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create a PNG QR code for any URL, with an optional logo in the
                center.
              </Typography>
            </Box>
            <ColorModeToggle />
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ alignItems: 'stretch' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <QrForm
                url={url}
                onUrlChange={setUrl}
                logoFile={logoFile}
                logoPreviewUrl={logoPreviewUrl}
                onLogoChange={handleLogoChange}
                size={size}
                onSizeChange={setSize}
                logoPadding={logoPadding}
                onLogoPaddingChange={setLogoPadding}
                margin={margin}
                onMarginChange={setMargin}
                resolution={resolution}
                onResolutionChange={setResolution}
                style={style}
                onStyleChange={setStyle}
                logoTransparentBackground={logoTransparentBackground}
                onLogoTransparentBackgroundChange={setLogoTransparentBackground}
                onStyleReset={() => {
                  setStyle(createDefaultQrStyle())
                  setLogoTransparentBackground(false)
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <QrPreview
                previewUrl={trimmedUrl ? previewUrl : null}
                quietZoneColor={style.quietZoneColor}
                resolution={resolution}
                loading={Boolean(trimmedUrl) && loading}
                error={trimmedUrl ? error : null}
                disabled={!trimmedUrl || !blob}
                onDownload={() => {
                  if (!blob || !trimmedUrl) return
                  downloadBlob(blob, `qr-code-${resolution}x${resolution}.png`)
                }}
              />
            </Box>
          </Stack>
          <AppFooter />
        </Stack>
      </Container>
    </Box>
  )
}

export default App
