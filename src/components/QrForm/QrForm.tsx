import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import {
  DEFAULT_LOGO_SIZE,
  DEFAULT_QR_MARGIN,
  DEFAULT_LOGO_PADDING,
  MAX_LOGO_SIZE,
  MAX_QR_MARGIN,
  MAX_LOGO_PADDING,
  MIN_LOGO_SIZE,
  MIN_QR_MARGIN,
  MIN_LOGO_PADDING,
  RESOLUTIONS,
  type Resolution,
} from '../../constants'
import type { QrStyle } from '../../qrStyle'
import { LogoUpload } from '../LogoUpload'
import { QrStyleForm } from '../QrStyleForm'

type QrFormProps = {
  url: string
  onUrlChange: (value: string) => void
  logoFile: File | null
  logoPreviewUrl: string | null
  onLogoChange: (file: File | null) => void
  size: number
  onSizeChange: (value: number) => void
  logoPadding: number
  onLogoPaddingChange: (value: number) => void
  margin: number
  onMarginChange: (value: number) => void
  resolution: Resolution
  onResolutionChange: (value: Resolution) => void
  style: QrStyle
  onStyleChange: (style: QrStyle) => void
  logoTransparentBackground: boolean
  onLogoTransparentBackgroundChange: (value: boolean) => void
  onStyleReset: () => void
}

export function QrForm({
  url,
  onUrlChange,
  logoFile,
  logoPreviewUrl,
  onLogoChange,
  size,
  onSizeChange,
  logoPadding,
  onLogoPaddingChange,
  margin,
  onMarginChange,
  resolution,
  onResolutionChange,
  style,
  onStyleChange,
  logoTransparentBackground,
  onLogoTransparentBackgroundChange,
  onStyleReset,
}: QrFormProps) {
  const [styleOpen, setStyleOpen] = useState(false)

  return (
    <Paper
      sx={{
        height: { xs: 'auto', md: '100%' },
        maxHeight: { md: '100%' },
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          overflow: { xs: 'visible', md: 'auto' },
          flex: 1,
          minHeight: 0,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            bgcolor: 'action.disabled',
          },
        }}
      >
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
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={logoTransparentBackground}
                  onChange={(event) =>
                    onLogoTransparentBackgroundChange(event.target.checked)
                  }
                />
              }
              label="Transparent logo background"
            />
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
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Logo padding ({logoPadding}%)
              </Typography>
              <Slider
                value={logoPadding}
                min={MIN_LOGO_PADDING}
                max={MAX_LOGO_PADDING}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                onChange={(_event, value) => {
                  onLogoPaddingChange(Array.isArray(value) ? value[0] : value)
                }}
                marks={[
                  { value: MIN_LOGO_PADDING, label: `${MIN_LOGO_PADDING}%` },
                  {
                    value: DEFAULT_LOGO_PADDING,
                    label: `${DEFAULT_LOGO_PADDING}%`,
                  },
                  { value: MAX_LOGO_PADDING, label: `${MAX_LOGO_PADDING}%` },
                ]}
              />
              <Typography variant="caption" color="text.secondary">
                Space around the logo, as a percentage of logo size.
              </Typography>
            </Box>
          </>
        ) : null}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            QR margin ({margin} modules)
          </Typography>
          <Slider
            value={margin}
            min={MIN_QR_MARGIN}
            max={MAX_QR_MARGIN}
            step={1}
            valueLabelDisplay="auto"
            onChange={(_event, value) => {
              onMarginChange(Array.isArray(value) ? value[0] : value)
            }}
            marks={[
              { value: MIN_QR_MARGIN, label: `${MIN_QR_MARGIN}` },
              { value: DEFAULT_QR_MARGIN, label: `${DEFAULT_QR_MARGIN}` },
              { value: MAX_QR_MARGIN, label: `${MAX_QR_MARGIN}` },
            ]}
          />
          <Typography variant="caption" color="text.secondary">
            Quiet zone around the QR code, in modules.
          </Typography>
        </Box>

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

        <Button
          variant="outlined"
          fullWidth
          startIcon={<PaletteOutlinedIcon />}
          onClick={() => setStyleOpen((open) => !open)}
          aria-expanded={styleOpen}
        >
          Customize style
        </Button>

        <Collapse in={styleOpen} unmountOnExit>
          <QrStyleForm
            style={style}
            onStyleChange={onStyleChange}
            onReset={onStyleReset}
          />
        </Collapse>
      </Stack>
      </Box>
    </Paper>
  )
}
