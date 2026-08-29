import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import type { QrModuleShape, QrStyle } from '../../qrStyle'

const SHAPE_OPTIONS: Array<{ value: QrModuleShape; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
]

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

type ColorFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [text, setText] = useState(value)
  const pickerValue = HEX_COLOR.test(value) ? value : '#000000'

  useEffect(() => {
    setText(value)
  }, [value])

  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" component="p">
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          component="input"
          type="color"
          aria-label={label}
          value={pickerValue}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
          sx={{
            width: 48,
            height: 40,
            p: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <TextField
          size="small"
          fullWidth
          value={text}
          onChange={(event) => {
            const next = event.target.value
            setText(next)
            if (HEX_COLOR.test(next)) onChange(next.toLowerCase())
          }}
          onBlur={() => setText(value)}
          slotProps={{
            htmlInput: { 'aria-label': `${label} hex`, spellCheck: false },
          }}
        />
      </Stack>
    </Stack>
  )
}

type ShapeSelectProps = {
  label: string
  value: QrModuleShape
  onChange: (value: QrModuleShape) => void
}

function ShapeSelect({ label, value, onChange }: ShapeSelectProps) {
  const labelId = `${label.replace(/\s+/g, '-').toLowerCase()}-label`

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as QrModuleShape)}
      >
        {SHAPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const fieldGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 2,
} as const

type QrStyleFormProps = {
  style: QrStyle
  onStyleChange: (style: QrStyle) => void
  hasLogo: boolean
  logoTransparentBackground: boolean
  onLogoTransparentBackgroundChange: (value: boolean) => void
  onReset: () => void
}

export function QrStyleForm({
  style,
  onStyleChange,
  hasLogo,
  logoTransparentBackground,
  onLogoTransparentBackgroundChange,
  onReset,
}: QrStyleFormProps) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h6">Style</Typography>
        <Typography variant="body2" color="text.secondary">
          Colors and shapes for each QR region. Defaults match a standard
          black-and-white code.
        </Typography>
      </Box>

      <ColorField
        label="Quiet zone color"
        value={style.quietZoneColor}
        onChange={(quietZoneColor) => onStyleChange({ ...style, quietZoneColor })}
      />
      <ColorField
        label="Data and error correction color"
        value={style.dataColor}
        onChange={(dataColor) => onStyleChange({ ...style, dataColor })}
      />

      <Stack spacing={1.5}>
        <Typography variant="subtitle1">Position patterns</Typography>
        <Box sx={fieldGridSx}>
          <ColorField
            label="Position outer color"
            value={style.finder.outerColor}
            onChange={(outerColor) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, outerColor },
              })
            }
          />
          <ColorField
            label="Position center color"
            value={style.finder.centerColor}
            onChange={(centerColor) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, centerColor },
              })
            }
          />
          <ShapeSelect
            label="Position outer shape"
            value={style.finder.outerShape}
            onChange={(outerShape) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, outerShape },
              })
            }
          />
          <ShapeSelect
            label="Position center shape"
            value={style.finder.centerShape}
            onChange={(centerShape) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, centerShape },
              })
            }
          />
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1">Alignment pattern</Typography>
        <Box sx={fieldGridSx}>
          <ColorField
            label="Alignment outer color"
            value={style.alignment.outerColor}
            onChange={(outerColor) =>
              onStyleChange({
                ...style,
                alignment: { ...style.alignment, outerColor },
              })
            }
          />
          <ColorField
            label="Alignment center color"
            value={style.alignment.centerColor}
            onChange={(centerColor) =>
              onStyleChange({
                ...style,
                alignment: { ...style.alignment, centerColor },
              })
            }
          />
          <ShapeSelect
            label="Alignment shape"
            value={style.alignment.shape}
            onChange={(shape) =>
              onStyleChange({
                ...style,
                alignment: { ...style.alignment, shape },
              })
            }
          />
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1">Timing pattern</Typography>
        <Box sx={fieldGridSx}>
          <ColorField
            label="Timing color"
            value={style.timing.color}
            onChange={(color) =>
              onStyleChange({
                ...style,
                timing: { ...style.timing, color },
              })
            }
          />
          <ShapeSelect
            label="Timing shape"
            value={style.timing.shape}
            onChange={(shape) =>
              onStyleChange({
                ...style,
                timing: { ...style.timing, shape },
              })
            }
          />
        </Box>
      </Stack>

      {hasLogo ? (
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
      ) : null}

      <Box>
        <Button variant="text" onClick={onReset} sx={{ px: 0 }}>
          Reset to default
        </Button>
      </Box>
    </Stack>
  )
}
