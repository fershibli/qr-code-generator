import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { FieldLabel } from './FieldLabel'

export type SelectOption<T extends string | number> = {
  value: T
  label: string
}

type SelectFieldProps<T extends string | number> = {
  label: string
  value: T
  options: Array<SelectOption<T>>
  onChange: (value: T) => void
}

function labelIdFor(label: string) {
  return `${label.replace(/\s+/g, '-').toLowerCase()}-label`
}

/**
 * Select with the label above it rather than floating in the outline, so it
 * lines up with the color and slider fields beside it in the grid.
 */
export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  const labelId = labelIdFor(label)

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <Select
        labelId={labelId}
        value={value}
        size="small"
        fullWidth
        onChange={(event) => onChange(event.target.value as T)}
        sx={{ height: 40 }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
