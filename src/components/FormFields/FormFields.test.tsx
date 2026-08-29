import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import { ColorField } from './ColorField'
import { FormSection } from './FormSection'
import { SelectField } from './SelectField'
import { SliderField } from './SliderField'

describe('ColorField', () => {
  it('shows the color on the swatch and the digits in the field', () => {
    renderWithTheme(
      <ColorField label="Data color" value="#1a2b3c" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Data color')).toHaveValue('#1a2b3c')
    expect(screen.getByLabelText('Data color hex')).toHaveValue('1a2b3c')
  })

  it('commits a color typed without the leading hash', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <ColorField label="Data color" value="#000000" onChange={onChange} />,
    )
    fireEvent.change(screen.getByLabelText('Data color hex'), {
      target: { value: 'ABCDEF' },
    })
    expect(onChange).toHaveBeenCalledWith('#abcdef')
  })

  it('marks an unusable value as an error and falls back on the picker', () => {
    renderWithTheme(
      <ColorField label="Data color" value="nope" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Data color')).toHaveValue('#000000')
    expect(screen.getByLabelText('Data color hex')).toBeInvalid()
  })
})

describe('SliderField', () => {
  it('renders the label, the current value, and every mark', () => {
    renderWithTheme(
      <SliderField
        label="Contour width"
        valueLabel="6 modules"
        value={6}
        min={1}
        max={16}
        marks={[
          { value: 1, label: '1' },
          { value: 16, label: '16' },
        ]}
        helperText="Wider is rounder."
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Contour width')).toBeInTheDocument()
    expect(screen.getByText('6 modules')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(screen.getByText('Wider is rounder.')).toBeInTheDocument()
  })

  it('pins the outer mark labels inside the track', () => {
    renderWithTheme(
      <SliderField
        label="Module density"
        valueLabel="automatic"
        value={1}
        min={1}
        max={40}
        marks={[
          { value: 1, label: 'Auto' },
          { value: 20, label: '20' },
          { value: 40, label: '40' },
        ]}
        onChange={vi.fn()}
      />,
    )
    // MUI centers mark labels on their tick, which pushed "Auto" out of the
    // card; the first and last are pulled back inside instead.
    expect(getComputedStyle(screen.getByText('Auto')).transform).toBe(
      'translateX(0%)',
    )
    expect(getComputedStyle(screen.getByText('40')).transform).toBe(
      'translateX(-100%)',
    )
    expect(getComputedStyle(screen.getByText('20')).transform).not.toBe(
      'translateX(0%)',
    )
  })

  it('reports changes from the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithTheme(
      <SliderField
        label="QR margin"
        valueLabel="2 modules"
        value={2}
        min={0}
        max={10}
        marks={[{ value: 0, label: '0' }]}
        onChange={onChange}
      />,
    )
    screen.getByRole('slider', { name: 'QR margin' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(3)
  })
})

describe('SelectField', () => {
  it('names the select from the label above it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithTheme(
      <SelectField
        label="Contour shape"
        value="circle"
        options={[
          { value: 'circle', label: 'Circle' },
          { value: 'diamond', label: 'Diamond' },
        ]}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Contour shape' }))
    await user.click(await screen.findByRole('option', { name: 'Diamond' }))
    expect(onChange).toHaveBeenCalledWith('diamond')
  })
})

describe('FormSection', () => {
  it('renders its title, description, action, and children', () => {
    renderWithTheme(
      <FormSection
        title="Output"
        description="Matrix and resolution."
        action={<button type="button">Reset</button>}
      >
        <p>child</p>
      </FormSection>,
    )
    expect(screen.getByText('Output')).toBeInTheDocument()
    expect(screen.getByText('Matrix and resolution.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
