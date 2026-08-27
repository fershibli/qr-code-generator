import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  DEFAULT_LOGO_SIZE,
  MAX_LOGO_SIZE,
  MIN_LOGO_SIZE,
  RESOLUTIONS,
  type Resolution,
} from '../constants'
import { LogoUpload } from './LogoUpload'

type QrFormProps = {
  url: string
  onUrlChange: (value: string) => void
  logoFile: File | null
  logoPreviewUrl: string | null
  onLogoChange: (file: File | null) => void
  size: number
  onSizeChange: (value: number) => void
  resolution: Resolution
  onResolutionChange: (value: Resolution) => void
}

export function QrForm({
  url,
  onUrlChange,
  logoFile,
  logoPreviewUrl,
  onLogoChange,
  size,
  onSizeChange,
  resolution,
  onResolutionChange,
}: QrFormProps) {
  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6">Details</Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a destination URL and optionally add a centered logo.
          </Typography>
        </Box>

        <TextField
          label="URL"
          required
          fullWidth
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://example.com"
          helperText="Include https:// so scanners open the link."
        />

        <LogoUpload
          file={logoFile}
          previewUrl={logoPreviewUrl}
          onChange={onLogoChange}
        />

        {logoFile ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Logo size ({size}%)
            </Typography>
            <Slider
              value={size}
              min={MIN_LOGO_SIZE}
              max={MAX_LOGO_SIZE}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              onChange={(_event, value) => {
                onSizeChange(Array.isArray(value) ? value[0] : value)
              }}
              marks={[
                { value: MIN_LOGO_SIZE, label: `${MIN_LOGO_SIZE}%` },
                { value: DEFAULT_LOGO_SIZE, label: `${DEFAULT_LOGO_SIZE}%` },
                { value: MAX_LOGO_SIZE, label: `${MAX_LOGO_SIZE}%` },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Percentage of the QR code width and height.
            </Typography>
          </Box>
        ) : null}

        <FormControl fullWidth>
          <InputLabel id="resolution-label">Resolution</InputLabel>
          <Select
            labelId="resolution-label"
            label="Resolution"
            value={resolution}
            onChange={(event) => {
              onResolutionChange(event.target.value as Resolution)
            }}
          >
            {RESOLUTIONS.map((value) => (
              <MenuItem key={value} value={value}>
                {value}×{value} px
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  )
}
