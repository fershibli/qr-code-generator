import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { FieldLabel } from './FieldLabel'

export type SliderMark = { value: number; label: string }

type SliderFieldProps = {
  label: string
  /** Current value, rendered at the end of the label row. */
  valueLabel: string
  value: number
  min: number
  max: number
  step?: number
  marks: SliderMark[]
  helperText?: string
  formatValueLabel?: (value: number) => string
  onChange: (value: number) => void
}

/**
 * Slider with its label, current value, scale marks, and helper text.
 *
 * The first and last mark labels are pinned inside the track instead of being
 * centered on their tick, which is what MUI does by default and what pushed
 * labels such as "Auto" past the edge of the card.
 */
export function SliderField({
  label,
  valueLabel,
  value,
  min,
  max,
  step = 1,
  marks,
  helperText,
  formatValueLabel,
  onChange,
}: SliderFieldProps) {
  const lastMark = marks.length - 1

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel hint={valueLabel}>{label}</FieldLabel>
      <Box sx={{ px: 0.5 }}>
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          marks={marks}
          size="small"
          valueLabelDisplay="auto"
          valueLabelFormat={formatValueLabel}
          aria-label={label}
          onChange={(_event, next) => {
            onChange(Array.isArray(next) ? next[0] : next)
          }}
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: 11,
              color: 'text.secondary',
              top: 26,
            },
            '& .MuiSlider-markLabel[data-index="0"]': {
              transform: 'translateX(0%)',
            },
            [`& .MuiSlider-markLabel[data-index="${lastMark}"]`]: {
              transform: 'translateX(-100%)',
            },
          }}
        />
      </Box>
      {helperText ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1.5 }}
        >
          {helperText}
        </Typography>
      ) : null}
    </Box>
  )
}
