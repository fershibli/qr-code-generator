import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type FieldLabelProps = {
  id?: string
  htmlFor?: string
  children: ReactNode
  /** Value shown at the end of the row, e.g. the current slider value. */
  hint?: ReactNode
}

/**
 * One label style for every control in the form, so labels line up whatever
 * sits underneath them — a select, a color swatch, or a slider.
 */
export function FieldLabel({ id, htmlFor, children, hint }: FieldLabelProps) {
  return (
    <Typography
      id={id}
      component={htmlFor ? 'label' : 'span'}
      htmlFor={htmlFor}
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 1,
        minHeight: 20,
        mb: 0.75,
        fontWeight: 500,
        color: 'text.primary',
      }}
    >
      <span>{children}</span>
      {hint === undefined ? null : (
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {hint}
        </Typography>
      )}
    </Typography>
  )
}
