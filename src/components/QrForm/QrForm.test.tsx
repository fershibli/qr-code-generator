import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultQrStyle } from '../../qrStyle'
import { renderWithTheme } from '../../test/renderWithTheme'
import { QrForm } from './QrForm'

/** Fields render their label and current value as siblings in one row. */
function labelRow(label: string) {
  return screen.getByText(label).parentElement
}

const file = new File([new Uint8Array([1, 2, 3])], 'logo.png', {
  type: 'image/png',
})

function formProps(overrides: Partial<Parameters<typeof QrForm>[0]> = {}) {
  return {
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
    minVersion: 1,
    onMinVersionChange: vi.fn(),
    resolution: 500 as const,
    onResolutionChange: vi.fn(),
    style: createDefaultQrStyle(),
    onStyleChange: vi.fn(),
    logoTransparentBackground: false,
    onLogoTransparentBackgroundChange: vi.fn(),
    onStyleReset: vi.fn(),
    ...overrides,
  }
}

function renderForm(
  overrides: Partial<Parameters<typeof QrForm>[0]> = {},
) {
  const props = formProps(overrides)
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
    expect(labelRow('Logo size')).toHaveTextContent('20%')
    expect(labelRow('Logo padding')).toHaveTextContent('5%')
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

  it('keeps the neutral hint until the URL field is left', async () => {
    const user = userEvent.setup()
    renderForm({ url: 'not-a-url' })
    expect(
      screen.getByText('Include https:// so scanners open the link.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('textbox', { name: /URL/ }))
    await user.tab()
    expect(
      screen.getByText('Start with a scheme, such as https://example.com.'),
    ).toBeInTheDocument()
  })

  it('marks a bad URL as an error and a good one as valid', async () => {
    const user = userEvent.setup()
    const { rerender } = renderForm({ url: 'https://exa mple.com' })
    await user.click(screen.getByRole('textbox', { name: /URL/ }))
    await user.tab()

    const message = screen.getByText('A URL cannot contain spaces.')
    expect(message).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /URL/ })).toBeInvalid()

    rerender(<QrForm {...formProps({ url: 'https://a.com.br' })} />)
    expect(
      screen.getByText('Valid URL — points to a.com.br.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /URL/ })).toBeValid()
  })

  it('says nothing while the field holds only the scheme', async () => {
    const user = userEvent.setup()
    renderForm({ url: 'https://' })
    await user.click(screen.getByRole('textbox', { name: /URL/ }))
    await user.tab()
    expect(
      screen.getByText('Include https:// so scanners open the link.'),
    ).toBeInTheDocument()
  })

  it('labels the density slider as automatic by default', () => {
    renderForm()
    expect(labelRow('Module density')).toHaveTextContent('automatic')
  })

  it('labels a forced version with its module count', () => {
    renderForm({ minVersion: 10 })
    expect(labelRow('Module density')).toHaveTextContent(
      'version 10, 57×57 modules',
    )
  })

  it('notifies parent when the density slider changes', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    sliders[1].focus()
    await user.keyboard('{ArrowRight}')
    expect(props.onMinVersionChange).toHaveBeenCalledWith(2)
  })

  it('notifies parent when logo and margin sliders change', async () => {
    const user = userEvent.setup()
    const { props } = renderForm({
      logoFile: file,
      logoPreviewUrl: 'blob:logo',
    })
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(4)
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
