import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import {
  ColorField,
  FormSection,
  SelectField,
  SliderField,
  type SelectOption,
} from '../FormFields'
import {
  DEFAULT_CONTOUR_WIDTH,
  DEFAULT_PATTERN_SCALE,
  MAX_CONTOUR_WIDTH,
  MAX_PATTERN_SCALE,
  MIN_CONTOUR_WIDTH,
  MIN_PATTERN_SCALE,
} from '../../constants'
import type { QrContourShape, QrModuleShape, QrStyle } from '../../qrStyle'

const SHAPE_OPTIONS: Array<SelectOption<QrModuleShape>> = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
]

const CONTOUR_SHAPE_OPTIONS: Array<SelectOption<QrContourShape>> = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'diamond', label: 'Diamond' },
]

const SCALE_MARKS = [
  { value: MIN_PATTERN_SCALE, label: `${MIN_PATTERN_SCALE}%` },
  { value: DEFAULT_PATTERN_SCALE, label: `${DEFAULT_PATTERN_SCALE}%` },
  { value: MAX_PATTERN_SCALE, label: `${MAX_PATTERN_SCALE}%` },
]

/** Two columns from `sm` up, so a color and a select never share a cramped row. */
const fieldGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  columnGap: 2,
  rowGap: 2.5,
  alignItems: 'start',
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
    <Stack spacing={3} divider={<Divider flexItem />}>
      <FormSection
        title="Colors"
        description="Defaults match a standard black-and-white code."
      >
        <Box sx={fieldGridSx}>
          <ColorField
            label="Quiet zone color"
            value={style.quietZoneColor}
            onChange={(quietZoneColor) =>
              onStyleChange({ ...style, quietZoneColor })
            }
          />
          <ColorField
            label="Data and error correction color"
            value={style.dataColor}
            onChange={(dataColor) => onStyleChange({ ...style, dataColor })}
          />
        </Box>
      </FormSection>

      <FormSection
        title="Position patterns"
        description="Shape and size apply to the whole finder, not each module."
      >
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
          <SelectField
            label="Position outer shape"
            options={SHAPE_OPTIONS}
            value={style.finder.outerShape}
            onChange={(outerShape) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, outerShape },
              })
            }
          />
          <SelectField
            label="Position center shape"
            options={SHAPE_OPTIONS}
            value={style.finder.centerShape}
            onChange={(centerShape) =>
              onStyleChange({
                ...style,
                finder: { ...style.finder, centerShape },
              })
            }
          />
        </Box>
        <SliderField
          label="Position pattern size"
          valueLabel={`${style.finder.scale}%`}
          value={style.finder.scale}
          min={MIN_PATTERN_SCALE}
          max={MAX_PATTERN_SCALE}
          step={5}
          marks={SCALE_MARKS}
          formatValueLabel={(scale) => `${scale}%`}
          onChange={(scale) =>
            onStyleChange({ ...style, finder: { ...style.finder, scale } })
          }
        />
        {style.finder.scale === DEFAULT_PATTERN_SCALE ? null : (
          <Alert severity="warning" sx={{ mt: 0.5 }}>
            Scanners work out the module size from these marks, so any size
            other than 100% usually stops the code from being read. Test it
            before you publish it.
          </Alert>
        )}
      </FormSection>

      <FormSection
        title="Alignment pattern"
        description="Resizing this one kept the code readable across the whole range in testing."
      >
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
          <SelectField
            label="Alignment shape"
            options={SHAPE_OPTIONS}
            value={style.alignment.shape}
            onChange={(shape) =>
              onStyleChange({
                ...style,
                alignment: { ...style.alignment, shape },
              })
            }
          />
        </Box>
        <SliderField
          label="Alignment pattern size"
          valueLabel={`${style.alignment.scale}%`}
          value={style.alignment.scale}
          min={MIN_PATTERN_SCALE}
          max={MAX_PATTERN_SCALE}
          step={5}
          marks={SCALE_MARKS}
          formatValueLabel={(scale) => `${scale}%`}
          onChange={(scale) =>
            onStyleChange({
              ...style,
              alignment: { ...style.alignment, scale },
            })
          }
        />
      </FormSection>

      <FormSection
        title="Timing pattern"
        description="Each timing module uses this shape."
      >
        <Box sx={fieldGridSx}>
          <ColorField
            label="Timing color"
            value={style.timing.color}
            onChange={(color) =>
              onStyleChange({ ...style, timing: { ...style.timing, color } })
            }
          />
          <SelectField
            label="Timing shape"
            options={SHAPE_OPTIONS}
            value={style.timing.shape}
            onChange={(shape) =>
              onStyleChange({ ...style, timing: { ...style.timing, shape } })
            }
          />
        </Box>
      </FormSection>

      <FormSection
        title="Contour"
        description="Fills the space around the code with copies of its own pixels, with no position or alignment marks, clipped to the chosen outline. QR margin sets the gap between the two: at 0 the fill starts right at the code."
      >
        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Switch
              checked={style.contour.enabled}
              onChange={(event) =>
                onStyleChange({
                  ...style,
                  contour: { ...style.contour, enabled: event.target.checked },
                })
              }
            />
          }
          label="Fill a contour around the code"
        />
        {style.contour.enabled ? (
          <>
            <Box sx={fieldGridSx}>
              <SelectField
                label="Contour shape"
                options={CONTOUR_SHAPE_OPTIONS}
                value={style.contour.shape}
                onChange={(shape) =>
                  onStyleChange({
                    ...style,
                    contour: { ...style.contour, shape },
                  })
                }
              />
              <SelectField
                label="Contour module shape"
                options={SHAPE_OPTIONS}
                value={style.contour.moduleShape}
                onChange={(moduleShape) =>
                  onStyleChange({
                    ...style,
                    contour: { ...style.contour, moduleShape },
                  })
                }
              />
              <ColorField
                label="Contour color"
                value={style.contour.color}
                onChange={(color) =>
                  onStyleChange({
                    ...style,
                    contour: { ...style.contour, color },
                  })
                }
              />
            </Box>
            <SliderField
              label="Contour width"
              valueLabel={`${style.contour.width} modules`}
              value={style.contour.width}
              min={MIN_CONTOUR_WIDTH}
              max={MAX_CONTOUR_WIDTH}
              marks={[
                { value: MIN_CONTOUR_WIDTH, label: `${MIN_CONTOUR_WIDTH}` },
                {
                  value: DEFAULT_CONTOUR_WIDTH,
                  label: `${DEFAULT_CONTOUR_WIDTH}`,
                },
                { value: MAX_CONTOUR_WIDTH, label: `${MAX_CONTOUR_WIDTH}` },
              ]}
              helperText="A wide contour is needed for a round outline to enclose the whole code."
              onChange={(width) =>
                onStyleChange({ ...style, contour: { ...style.contour, width } })
              }
            />
          </>
        ) : null}
      </FormSection>

      <Box>
        <Button variant="text" size="small" onClick={onReset} sx={{ px: 0 }}>
          Reset to default
        </Button>
      </Box>
    </Stack>
  )
}
