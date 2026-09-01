import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import {
  getLogo,
  listLogos,
  logoFingerprint,
  saveLogo,
  type CachedLogo,
} from '../../utils/logoCache'

type LogoUploadProps = {
  file: File | null
  previewUrl: string | null
  onChange: (file: File | null) => void
}

export function LogoUpload({ file, previewUrl, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [recent, setRecent] = useState<CachedLogo[]>([])
  const selectedId = file ? logoFingerprint(file) : null

  async function refreshRecent() {
    const logos = await listLogos()
    setRecent(logos)
  }

  useEffect(() => {
    void refreshRecent()
  }, [])

  async function handleSelect(nextFile: File | null) {
    onChange(nextFile)
    if (!nextFile) return
    await saveLogo(nextFile)
    await refreshRecent()
  }

  return (
    <Stack spacing={1.5}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null
          void handleSelect(nextFile)
          event.target.value = ''
        }}
      />
      {file && previewUrl ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            component="img"
            src={previewUrl}
            alt="Selected logo"
            sx={{
              width: 56,
              height: 56,
              objectFit: 'contain',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff',
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Centered on the QR code
            </Typography>
          </Box>
          <IconButton
            aria-label="Remove logo"
            onClick={() => onChange(null)}
            color="error"
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      ) : (
        <Button
          variant="outlined"
          startIcon={<ImageOutlinedIcon />}
          onClick={() => inputRef.current?.click()}
        >
          Upload logo
        </Button>
      )}

      {recent.length > 0 ? (
        <RecentLogos
          logos={recent}
          selectedId={selectedId}
          onSelect={(id) => {
            void getLogo(id).then((cached) => {
              if (cached) void handleSelect(cached)
            })
          }}
        />
      ) : null}
    </Stack>
  )
}

function RecentLogos({
  logos,
  selectedId,
  onSelect,
}: {
  logos: CachedLogo[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const logo of logos) {
      next[logo.id] = URL.createObjectURL(logo.blob)
    }
    setUrls(next)
    return () => {
      Object.values(next).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [logos])

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Recent logos
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        {logos.map((logo) => {
          const selected = logo.id === selectedId
          return (
            <Box
              key={logo.id}
              component="button"
              type="button"
              aria-label={`Use recent logo ${logo.name}`}
              aria-pressed={selected}
              onClick={() => onSelect(logo.id)}
              sx={{
                p: 0,
                width: 56,
                height: 56,
                borderRadius: 1,
                border: '2px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: '#ffffff',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {urls[logo.id] ? (
                <Box
                  component="img"
                  src={urls[logo.id]}
                  alt=""
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : null}
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}
