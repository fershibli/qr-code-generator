import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useEffect, useId, useState } from 'react'
import { FieldLabel } from './FieldLabel'

type NumberFieldProps = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  /** Decimals the committed value is snapped to when the field is left. */
  decimals?: number
  /** Short unit shown at the end of the input, e.g. `cm`. */
  suffix?: string
  helperText?: string
  onChange: (value: number) => void
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Decimal input with the label above it, matching the select and slider
 * fields. The draft text is kept as typed so `1.` or an empty field never
 * fights the user; the value is only snapped and clamped once the field is
 * left.
 */
export function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  decimals = 2,
  suffix,
  helperText,
  onChange,
}: NumberFieldProps) {
  const inputId = useId()
  const [draft, setDraft] = useState(() => String(value))

  // Follows the value when it changes elsewhere — a unit switch, a reset —
  // without overwriting a draft that already parses to it.
  useEffect(() => {
    setDraft((current) =>
      Number.parseFloat(current) === value ? current : String(value),
    )
  }, [value])

  function handleChange(raw: string) {
    setDraft(raw)
    const parsed = Number.parseFloat(raw)
    if (Number.isFinite(parsed)) onChange(parsed)
  }

  function handleBlur() {
    const parsed = Number.parseFloat(draft)
    const base = Number.isFinite(parsed) ? parsed : value
    const clamped = Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min ?? Number.NEGATIVE_INFINITY, base),
    )
    const settled = round(clamped, decimals)
    setDraft(String(settled))
    if (settled !== value) onChange(settled)
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <TextField
        id={inputId}
        type="number"
        size="small"
        fullWidth
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        helperText={helperText}
        slotProps={{
          htmlInput: { min, max, step, inputMode: 'decimal' },
          input: suffix
            ? {
                endAdornment: (
                  <InputAdornment position="end">{suffix}</InputAdornment>
                ),
              }
            : undefined,
        }}
        sx={{ '& .MuiOutlinedInput-root': { height: 40 } }}
      />
    </Box>
  )
}
