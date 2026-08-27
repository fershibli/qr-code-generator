import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRef } from 'react'

type LogoUploadProps = {
  file: File | null
  previewUrl: string | null
  onChange: (file: File | null) => void
}

export function LogoUpload({ file, previewUrl, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Logo (optional)</Typography>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null
          onChange(nextFile)
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
              bgcolor: 'background.paper',
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
    </Stack>
  )
}
