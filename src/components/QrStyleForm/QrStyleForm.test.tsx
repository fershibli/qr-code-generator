import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../../qrStyle'
import { renderWithTheme } from '../../test/renderWithTheme'
import { QrStyleForm } from './QrStyleForm'

function renderStyle(
  overrides: Partial<Parameters<typeof QrStyleForm>[0]> = {},
) {
  const props = {
    style: createDefaultQrStyle(),
    onStyleChange: vi.fn(),
    hasLogo: false,
    logoTransparentBackground: false,
    onLogoTransparentBackgroundChange: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  }
  return { ...renderWithTheme(<QrStyleForm {...props} />), props }
}

describe('QrStyleForm', () => {
  it('hides the transparent logo switch when no logo is selected', () => {
    renderStyle()
    expect(
      screen.queryByRole('switch', { name: 'Transparent logo background' }),
    ).not.toBeInTheDocument()
  })

  it('toggles transparent logo background when a logo is selected', async () => {
    const user = userEvent.setup()
    const { props } = renderStyle({ hasLogo: true })
    await user.click(
      screen.getByRole('switch', { name: 'Transparent logo background' }),
    )
    expect(props.onLogoTransparentBackgroundChange).toHaveBeenCalledWith(true)
  })

  it('resets style to the defaults', async () => {
    const user = userEvent.setup()
    const { props } = renderStyle()
    await user.click(screen.getByRole('button', { name: 'Reset to default' }))
    expect(props.onReset).toHaveBeenCalledTimes(1)
  })

  it('updates a color from the picker and a valid hex value', () => {
    const { props } = renderStyle()
    fireEvent.change(screen.getByLabelText('Quiet zone color'), {
      target: { value: '#00ff00' },
    })
    expect(props.onStyleChange).toHaveBeenCalledWith(
      expect.objectContaining({ quietZoneColor: '#00ff00' }),
    )

    fireEvent.change(screen.getByLabelText('Data and error correction color hex'), {
      target: { value: '#123456' },
    })
    expect(props.onStyleChange).toHaveBeenCalledWith(
      expect.objectContaining({ dataColor: '#123456' }),
    )
  })

  it('falls back to black on the picker when the hex is invalid', () => {
    renderStyle({
      style: { ...createDefaultQrStyle(), quietZoneColor: 'not-a-color' },
    })
    expect(screen.getByLabelText('Quiet zone color')).toHaveValue('#000000')
  })

  it('ignores incomplete hex and restores the committed value on blur', () => {
    const { props } = renderStyle()
    const hex = screen.getByLabelText('Quiet zone color hex')
    fireEvent.change(hex, { target: { value: '#fff' } })
    expect(props.onStyleChange).not.toHaveBeenCalled()
    fireEvent.blur(hex)
    expect(hex).toHaveValue('#ffffff')
  })

  it('updates finder, alignment, and timing colors and shapes', async () => {
    const user = userEvent.setup()
    const { props } = renderStyle()

    fireEvent.change(screen.getByLabelText('Position outer color'), {
      target: { value: '#111111' },
    })
    fireEvent.change(screen.getByLabelText('Position center color'), {
      target: { value: '#222222' },
    })
    fireEvent.change(screen.getByLabelText('Alignment outer color'), {
      target: { value: '#333333' },
    })
    fireEvent.change(screen.getByLabelText('Alignment center color'), {
      target: { value: '#444444' },
    })
    fireEvent.change(screen.getByLabelText('Timing color'), {
      target: { value: '#555555' },
    })

    await user.click(screen.getByRole('combobox', { name: 'Position outer shape' }))
    await user.click(await screen.findByRole('option', { name: 'Circle' }))
    await user.click(screen.getByRole('combobox', { name: 'Position center shape' }))
    await user.click(await screen.findByRole('option', { name: 'Rounded' }))
    await user.click(screen.getByRole('combobox', { name: 'Alignment shape' }))
    await user.click(await screen.findByRole('option', { name: 'Circle' }))
    await user.click(screen.getByRole('combobox', { name: 'Timing shape' }))
    await user.click(await screen.findByRole('option', { name: 'Rounded' }))

    expect(props.onStyleChange).toHaveBeenCalled()
    const last = props.onStyleChange.mock.calls.at(-1)?.[0]
    expect(last.timing.shape).toBe('rounded')
  })
})
