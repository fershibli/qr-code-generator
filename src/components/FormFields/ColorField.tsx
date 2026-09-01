import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { FieldLabel } from './FieldLabel'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const FIELD_HEIGHT = 40

type ColorFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Color swatch plus hex input. The native color input is stretched invisibly
 * over the swatch, so the control reads as one button while keeping the
 * platform picker and the input's accessible name.
 */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [text, setText] = useState(value)
  const valid = HEX_COLOR.test(value)
  const pickerValue = valid ? value : '#000000'

  useEffect(() => {
    setText(value)
  }, [value])

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            width: FIELD_HEIGHT,
            height: FIELD_HEIGHT,
            flexShrink: 0,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: pickerValue,
            boxShadow: (theme) =>
              `inset 0 0 0 1px ${theme.palette.divider}, inset 0 1px 2px rgba(0,0,0,0.12)`,
            transition: (theme) => theme.transitions.create('box-shadow'),
            '&:hover': {
              boxShadow: (theme) =>
                `inset 0 0 0 1px ${theme.palette.text.secondary}`,
            },
            '&:focus-within': {
              boxShadow: (theme) =>
                `inset 0 0 0 2px ${theme.palette.primary.main}`,
            },
          }}
        >
          <Box
            component="input"
            type="color"
            aria-label={label}
            value={pickerValue}
            onChange={(event) => onChange(event.target.value.toLowerCase())}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              m: 0,
              p: 0,
              border: 0,
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </Box>
        <TextField
          size="small"
          fullWidth
          value={text.replace(/^#/, '')}
          error={!valid}
          onChange={(event) => {
            const next = `#${event.target.value.replace(/^#/, '')}`
            setText(next)
            if (HEX_COLOR.test(next)) onChange(next.toLowerCase())
          }}
          onBlur={() => setText(value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    #
                  </Typography>
                </InputAdornment>
              ),
              sx: {
                height: FIELD_HEIGHT,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 14,
                '& input': { pl: 0.25 },
              },
            },
            htmlInput: {
              'aria-label': `${label} hex`,
              spellCheck: false,
              autoCapitalize: 'none',
              autoCorrect: 'off',
            },
          }}
        />
      </Box>
    </Box>
  )
}
