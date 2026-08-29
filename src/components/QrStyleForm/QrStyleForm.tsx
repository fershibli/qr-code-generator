import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import {
  DEFAULT_PATTERN_SCALE,
  MAX_PATTERN_SCALE,
  MIN_PATTERN_SCALE,
} from '../../constants'
import type { QrModuleShape, QrStyle } from '../../qrStyle'

const SHAPE_OPTIONS: Array<{ value: QrModuleShape; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
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

type ScaleSliderProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

function ScaleSlider({ label, value, onChange }: ScaleSliderProps) {
  return (
    <Box>
      <Typography variant="subtitle2" component="p" gutterBottom>
        {label} ({value}%)
      </Typography>
      <Slider
        value={value}
        min={MIN_PATTERN_SCALE}
        max={MAX_PATTERN_SCALE}
        step={5}
        size="small"
        valueLabelDisplay="auto"
        valueLabelFormat={(scale) => `${scale}%`}
        aria-label={label}
        onChange={(_event, next) => {
          onChange(Array.isArray(next) ? next[0] : next)
        }}
        marks={[
          { value: MIN_PATTERN_SCALE, label: `${MIN_PATTERN_SCALE}%` },
          { value: DEFAULT_PATTERN_SCALE, label: `${DEFAULT_PATTERN_SCALE}%` },
          { value: MAX_PATTERN_SCALE, label: `${MAX_PATTERN_SCALE}%` },
        ]}
      />
    </Box>
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
  onReset: () => void
}

export function QrStyleForm({
  style,
  onStyleChange,
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
        <Box>
          <Typography variant="subtitle1">Position patterns</Typography>
          <Typography variant="caption" color="text.secondary">
            Shape and size apply to the whole finder, not each module.
          </Typography>
        </Box>
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
        <ScaleSlider
          label="Position pattern size"
          value={style.finder.scale}
          onChange={(scale) =>
            onStyleChange({ ...style, finder: { ...style.finder, scale } })
          }
        />
        {style.finder.scale === DEFAULT_PATTERN_SCALE ? null : (
          <Alert severity="warning">
            Scanners work out the module size from these marks, so any size
            other than 100% usually stops the code from being read. Test it
            before you publish it.
          </Alert>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle1">Alignment pattern</Typography>
          <Typography variant="caption" color="text.secondary">
            Shape and size apply to the whole alignment mark, not each module.
            Resizing this one kept the code readable across the whole range in
            testing.
          </Typography>
        </Box>
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
        <ScaleSlider
          label="Alignment pattern size"
          value={style.alignment.scale}
          onChange={(scale) =>
            onStyleChange({
              ...style,
              alignment: { ...style.alignment, scale },
            })
          }
        />
      </Stack>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle1">Timing pattern</Typography>
          <Typography variant="caption" color="text.secondary">
            Each timing module uses this shape.
          </Typography>
        </Box>
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

      <Box>
        <Button variant="text" onClick={onReset} sx={{ px: 0 }}>
          Reset to default
        </Button>
      </Box>
    </Stack>
  )
}
