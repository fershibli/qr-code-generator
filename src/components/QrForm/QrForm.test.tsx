import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../../qrStyle'
import { renderWithTheme } from '../../test/renderWithTheme'
import { QrForm } from './QrForm'

const file = new File([new Uint8Array([1, 2, 3])], 'logo.png', {
  type: 'image/png',
})

function renderForm(
  overrides: Partial<Parameters<typeof QrForm>[0]> = {},
) {
  const props = {
    url: '',
    onUrlChange: vi.fn(),
    logoFile: null as File | null,
    logoPreviewUrl: null as string | null,
    onLogoChange: vi.fn(),
    size: 20,
    onSizeChange: vi.fn(),
    logoPadding: 5,
    onLogoPaddingChange: vi.fn(),
    margin: 2,
    onMarginChange: vi.fn(),
    resolution: 500 as const,
    onResolutionChange: vi.fn(),
    style: createDefaultQrStyle(),
    onStyleChange: vi.fn(),
    logoTransparentBackground: false,
    onLogoTransparentBackgroundChange: vi.fn(),
    onStyleReset: vi.fn(),
    ...overrides,
  }
  return { ...renderWithTheme(<QrForm {...props} />), props }
}

describe('QrForm', () => {
  it('always shows the QR margin control and hides logo sliders without a logo', () => {
    renderForm()
    expect(screen.getByText(/QR margin/)).toBeInTheDocument()
    expect(screen.queryByText(/Logo size/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Logo padding/)).not.toBeInTheDocument()
  })

  it('shows logo size and padding sliders when a logo is selected', () => {
    renderForm({
      logoFile: file,
      logoPreviewUrl: 'blob:logo',
    })
    expect(screen.getByText('Logo size (20%)')).toBeInTheDocument()
    expect(screen.getByText('Logo padding (5%)')).toBeInTheDocument()
  })

  it('notifies parent when the URL changes', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()
    await user.type(screen.getByRole('textbox', { name: /URL/ }), 'https://example.com')
    expect(props.onUrlChange).toHaveBeenCalled()
  })

  it('notifies parent when resolution changes', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()
    await user.click(screen.getByRole('combobox', { name: /Resolution/ }))
    await user.click(await screen.findByRole('option', { name: '750×750 px' }))
    expect(props.onResolutionChange).toHaveBeenCalledWith(750)
  })

  it('reveals style controls when Customize style is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    expect(screen.queryByText('Quiet zone color')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Customize style' }))
    expect(screen.getByText('Quiet zone color')).toBeInTheDocument()
  })

  it('hides the transparent logo switch without a logo', () => {
    renderForm()
    expect(
      screen.queryByRole('switch', { name: 'Transparent logo background' }),
    ).not.toBeInTheDocument()
  })

  it('shows the transparent logo switch below the upload when a logo is set', async () => {
    const user = userEvent.setup()
    const { props } = renderForm({
      logoFile: file,
      logoPreviewUrl: 'blob:logo',
    })
    const toggle = screen.getByRole('switch', {
      name: 'Transparent logo background',
    })
    expect(toggle).toBeInTheDocument()
    expect(screen.queryByText('Quiet zone color')).not.toBeInTheDocument()
    await user.click(toggle)
    expect(props.onLogoTransparentBackgroundChange).toHaveBeenCalledWith(true)
  })

  it('notifies parent when logo and margin sliders change', async () => {
    const user = userEvent.setup()
    const { props } = renderForm({
      logoFile: file,
      logoPreviewUrl: 'blob:logo',
    })
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)
    sliders[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(props.onSizeChange).toHaveBeenCalled()
    sliders[1].focus()
    await user.keyboard('{ArrowRight}')
    expect(props.onLogoPaddingChange).toHaveBeenCalled()
    sliders[2].focus()
    await user.keyboard('{ArrowRight}')
    expect(props.onMarginChange).toHaveBeenCalled()
  })
})
