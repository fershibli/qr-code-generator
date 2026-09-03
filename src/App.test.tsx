import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ColorModeProvider } from './components/ColorModeProvider'
import App from './App'
import { generateQrPng } from './utils/generateQrPng'

vi.mock('./utils/generateQrPng', () => ({
  generateQrPng: vi.fn(async () => ({
    blob: new Blob(['png'], { type: 'image/png' }),
    objectUrl: 'blob:qr-preview',
    width: 500,
    height: 500,
    version: 3,
    moduleCount: 29,
  })),
}))

/** The field starts holding the scheme, so tests replace it outright. */
async function typeUrl(
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) {
  const input = screen.getByRole('textbox', { name: /URL/ })
  await user.clear(input)
  await user.type(input, value)
  return input
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.colorMode = 'light'
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.mocked(generateQrPng).mockReset()
    vi.mocked(generateQrPng).mockResolvedValue({
      blob: new Blob(['png'], { type: 'image/png' }),
      objectUrl: 'blob:qr-preview',
      width: 500,
      height: 500,
      version: 3,
      moduleCount: 29,
    })
  })

  it('generates a preview from a URL and downloads it', async () => {
    const user = userEvent.setup()
    let downloadName: string | undefined
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadName = this.download
      })

    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'QR Code Generator' }),
    ).toBeInTheDocument()
    await typeUrl(user, 'https://example.com')
    await waitFor(() => {
      expect(generateQrPng).toHaveBeenCalled()
    })
    expect(generateQrPng).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com',
        style: expect.objectContaining({ quietZoneColor: '#ffffff' }),
        logoTransparentBackground: false,
      }),
    )
    await waitFor(() => {
      expect(screen.getByAltText('QR code preview')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(click).toHaveBeenCalled()
    expect(downloadName).toBe('example.com-500px.png')
    click.mockRestore()
  })

  it('exports the advanced width, height and unit, and names the file for it', async () => {
    const user = userEvent.setup()
    let downloadName: string | undefined
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadName = this.download
      })
    vi.mocked(generateQrPng).mockResolvedValue({
      blob: new Blob(['png'], { type: 'image/png' }),
      objectUrl: 'blob:qr-preview',
      width: 192,
      height: 288,
      version: 3,
      moduleCount: 29,
    })

    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    await typeUrl(user, 'https://example.com')
    await waitFor(() => expect(generateQrPng).toHaveBeenCalled())

    // The preset resolution carries over, so nothing jumps when it is checked.
    await user.click(
      screen.getByRole('checkbox', { name: 'Advanced resolution' }),
    )
    expect(screen.getByLabelText('Width')).toHaveValue(500)

    await user.click(screen.getByRole('combobox', { name: /Unit/ }))
    await user.click(await screen.findByRole('option', { name: /Inches/ }))

    const width = screen.getByLabelText('Width')
    await user.clear(width)
    await user.type(width, '2')
    const height = screen.getByLabelText('Height')
    await user.clear(height)
    await user.type(height, '3')

    await waitFor(() => {
      expect(generateQrPng).toHaveBeenLastCalledWith(
        expect.objectContaining({ width: 192, height: 288 }),
      )
    })

    await waitFor(() => {
      expect(screen.getByAltText('QR code preview')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(downloadName).toBe('example.com-192x288px.png')
    click.mockRestore()
  })

  it('starts with the scheme and waits for a destination', async () => {
    const user = userEvent.setup()
    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    expect(screen.getByRole('textbox', { name: /URL/ })).toHaveValue('https://')
    expect(
      screen.getByText('Enter a URL to generate a QR code.'),
    ).toBeInTheDocument()

    // Nothing to encode yet, so nothing is generated.
    await waitFor(() => expect(generateQrPng).not.toHaveBeenCalled())

    await typeUrl(user, 'https://example.com')
    await waitFor(() => expect(generateQrPng).toHaveBeenCalledTimes(1))
  })

  it('shows a generation error', async () => {
    const user = userEvent.setup()
    vi.mocked(generateQrPng).mockRejectedValueOnce(new Error('boom'))
    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    await typeUrl(user, 'https://bad.example')
    await waitFor(() => {
      expect(screen.getByText('boom')).toBeInTheDocument()
    })
  })

  it('shows a fallback error message for non-Error failures', async () => {
    const user = userEvent.setup()
    vi.mocked(generateQrPng).mockRejectedValueOnce('nope')
    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    await typeUrl(user, 'https://fail.example')
    await waitFor(() => {
      expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument()
    })
  })

  it('replaces and removes a selected logo', async () => {
    const user = userEvent.setup()
    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const first = new File([new Uint8Array([1, 2, 3, 4])], 'one.png', {
      type: 'image/png',
      lastModified: 1,
    })
    const second = new File([new Uint8Array([5, 6, 7, 8])], 'two.png', {
      type: 'image/png',
      lastModified: 2,
    })
    await user.upload(input, first)
    expect(screen.getByText('one.png')).toBeInTheDocument()
    await user.upload(input, second)
    expect(screen.getByText('two.png')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove logo' }))
    expect(screen.queryByText('two.png')).not.toBeInTheDocument()
  })

  it('ignores a stale generation result after the URL changes', async () => {
    const user = userEvent.setup()
    const result = {
      blob: new Blob(['png'], { type: 'image/png' }),
      objectUrl: 'blob:stale',
      width: 500,
      height: 500,
      version: 3,
      moduleCount: 29,
    }
    let resolveFirst: ((value: typeof result) => void) | undefined
    vi.mocked(generateQrPng)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValue({
        ...result,
        objectUrl: 'blob:fresh',
      })

    render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    const input = await typeUrl(user, 'https://first.example')
    await waitFor(() => expect(generateQrPng).toHaveBeenCalledTimes(1))
    await user.clear(input)
    await user.type(input, 'https://second.example')
    resolveFirst?.(result)
    await waitFor(() => expect(generateQrPng).toHaveBeenCalledTimes(2))
    await waitFor(() => {
      expect(screen.getByAltText('QR code preview')).toHaveAttribute(
        'src',
        'blob:fresh',
      )
    })
  })

  it('ignores a stale generation error after unmount', async () => {
    const user = userEvent.setup()
    let rejectFirst: ((reason: unknown) => void) | undefined
    vi.mocked(generateQrPng).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectFirst = reject
        }),
    )
    const { unmount } = render(
      <ColorModeProvider>
        <App />
      </ColorModeProvider>,
    )
    await typeUrl(user, 'https://stale.example')
    await waitFor(() => expect(generateQrPng).toHaveBeenCalledTimes(1))
    unmount()
    rejectFirst?.(new Error('stale'))
  })
})
