import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ColorField } from './ColorField'
import { FormSection } from './FormSection'
import { SelectField } from './SelectField'
import { SliderField } from './SliderField'

const meta = {
  title: 'Components/FormFields',
  component: FormSection,
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

function Fields() {
  const [color, setColor] = useState('#6a0dad')
  const [shape, setShape] = useState('circle')
  const [width, setWidth] = useState(6)
  const [version, setVersion] = useState(1)

  return (
    <Stack spacing={3} sx={{ maxWidth: 520 }}>
      <FormSection title="Colors" description="Swatch plus hex input.">
        <ColorField label="Contour color" value={color} onChange={setColor} />
        <ColorField
          label="Invalid value"
          value="not-a-color"
          onChange={() => {}}
        />
      </FormSection>

      <FormSection title="Choices" description="Label above the control.">
        <SelectField
          label="Contour shape"
          value={shape}
          options={[
            { value: 'circle', label: 'Circle' },
            { value: 'square', label: 'Square' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'diamond', label: 'Diamond' },
          ]}
          onChange={setShape}
        />
      </FormSection>

      <FormSection
        title="Ranges"
        description="Outer mark labels stay inside the track."
      >
        <SliderField
          label="Contour width"
          valueLabel={`${width} modules`}
          value={width}
          min={1}
          max={16}
          marks={[
            { value: 1, label: '1' },
            { value: 6, label: '6' },
            { value: 16, label: '16' },
          ]}
          helperText="A wide contour is needed for a round outline."
          onChange={setWidth}
        />
        <SliderField
          label="Module density"
          valueLabel={version > 1 ? `version ${version}` : 'automatic'}
          value={version}
          min={1}
          max={40}
          marks={[
            { value: 1, label: 'Auto' },
            { value: 20, label: '20' },
            { value: 40, label: '40' },
          ]}
          onChange={setVersion}
        />
      </FormSection>
    </Stack>
  )
}

export const Default: Story = {
  args: { title: 'Colors', children: null },
  render: () => <Fields />,
}
