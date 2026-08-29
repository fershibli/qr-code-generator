import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import {
  DEFAULT_LOGO_SIZE,
  DEFAULT_QR_MARGIN,
  DEFAULT_LOGO_PADDING,
  MAX_LOGO_SIZE,
  MAX_QR_MARGIN,
  MAX_LOGO_PADDING,
  MAX_QR_VERSION,
  MIN_LOGO_SIZE,
  MIN_QR_MARGIN,
  MIN_LOGO_PADDING,
  MIN_QR_VERSION,
  RESOLUTIONS,
  modulesForVersion,
  type Resolution,
} from '../../constants'
import type { QrStyle } from '../../qrStyle'
import { FormSection, SelectField, SliderField } from '../FormFields'
import { LogoUpload } from '../LogoUpload'
import { QrStyleForm } from '../QrStyleForm'

const RESOLUTION_OPTIONS = RESOLUTIONS.map((value) => ({
  value,
  label: `${value}×${value} px`,
}))

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
  minVersion: number
  onMinVersionChange: (value: number) => void
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
  minVersion,
  onMinVersionChange,
  resolution,
  onResolutionChange,
  style,
  onStyleChange,
  logoTransparentBackground,
  onLogoTransparentBackgroundChange,
  onStyleReset,
}: QrFormProps) {
  const [styleOpen, setStyleOpen] = useState(false)
  const densityModules = modulesForVersion(minVersion)
  const densityLabel =
    minVersion > MIN_QR_VERSION
      ? `version ${minVersion}, ${densityModules}×${densityModules} modules`
      : 'automatic'

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
        <Stack spacing={3} divider={<Divider flexItem />}>
          <FormSection
            title="Destination"
            description="Where the code sends whoever scans it."
          >
            <TextField
              label="URL"
              required
              fullWidth
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder="https://example.com"
              helperText="Include https:// so scanners open the link."
            />
          </FormSection>

          <FormSection
            title="Logo"
            description="Optional image composited in the center of the code."
          >
            <LogoUpload
              file={logoFile}
              previewUrl={logoPreviewUrl}
              onChange={onLogoChange}
            />

            {logoFile ? (
              <>
                <FormControlLabel
                  sx={{ mr: 0 }}
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
                <SliderField
                  label="Logo size"
                  valueLabel={`${size}%`}
                  value={size}
                  min={MIN_LOGO_SIZE}
                  max={MAX_LOGO_SIZE}
                  marks={[
                    { value: MIN_LOGO_SIZE, label: `${MIN_LOGO_SIZE}%` },
                    { value: DEFAULT_LOGO_SIZE, label: `${DEFAULT_LOGO_SIZE}%` },
                    { value: MAX_LOGO_SIZE, label: `${MAX_LOGO_SIZE}%` },
                  ]}
                  formatValueLabel={(value) => `${value}%`}
                  helperText="Percentage of the QR code width and height."
                  onChange={onSizeChange}
                />
                <SliderField
                  label="Logo padding"
                  valueLabel={`${logoPadding}%`}
                  value={logoPadding}
                  min={MIN_LOGO_PADDING}
                  max={MAX_LOGO_PADDING}
                  marks={[
                    { value: MIN_LOGO_PADDING, label: `${MIN_LOGO_PADDING}%` },
                    {
                      value: DEFAULT_LOGO_PADDING,
                      label: `${DEFAULT_LOGO_PADDING}%`,
                    },
                    { value: MAX_LOGO_PADDING, label: `${MAX_LOGO_PADDING}%` },
                  ]}
                  formatValueLabel={(value) => `${value}%`}
                  helperText="Space around the logo, as a percentage of logo size."
                  onChange={onLogoPaddingChange}
                />
              </>
            ) : null}
          </FormSection>

          <FormSection
            title="Output"
            description="Matrix size and the resolution of the exported PNG."
          >
            <SliderField
              label="QR margin"
              valueLabel={`${margin} modules`}
              value={margin}
              min={MIN_QR_MARGIN}
              max={MAX_QR_MARGIN}
              marks={[
                { value: MIN_QR_MARGIN, label: `${MIN_QR_MARGIN}` },
                { value: DEFAULT_QR_MARGIN, label: `${DEFAULT_QR_MARGIN}` },
                { value: MAX_QR_MARGIN, label: `${MAX_QR_MARGIN}` },
              ]}
              helperText="Quiet zone around the QR code, in modules."
              onChange={onMarginChange}
            />
            <SliderField
              label="Module density"
              valueLabel={densityLabel}
              value={minVersion}
              min={MIN_QR_VERSION}
              max={MAX_QR_VERSION}
              marks={[
                { value: MIN_QR_VERSION, label: 'Auto' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 30, label: '30' },
                { value: MAX_QR_VERSION, label: `${MAX_QR_VERSION}` },
              ]}
              formatValueLabel={(value) =>
                value > MIN_QR_VERSION ? `v${value}` : 'auto'
              }
              helperText="Smallest QR version to encode with. Higher versions pack more, smaller squares; the version rises on its own when the URL needs more room."
              onChange={onMinVersionChange}
            />
            <SelectField
              label="Resolution"
              value={resolution}
              options={RESOLUTION_OPTIONS}
              onChange={(value) => onResolutionChange(value as Resolution)}
            />
          </FormSection>

          <Box>
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
              <Box sx={{ pt: 3 }}>
                <QrStyleForm
                  style={style}
                  onStyleChange={onStyleChange}
                  onReset={onStyleReset}
                />
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </Box>
    </Paper>
  )
}
