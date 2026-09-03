import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import { QrPreview } from './QrPreview'

let observerCallback: IntersectionObserverCallback | null = null

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds = [0]

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function emitIntersecting(isIntersecting: boolean) {
  act(() => {
    observerCallback?.(
      [
        {
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    )
  })
}

describe('QrPreview', () => {
  beforeEach(() => {
    observerCallback = null
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows an empty state and a disabled download button', () => {
    renderWithTheme(
      <QrPreview
        previewUrl={null}
        width={500}
        height={500}
        loading={false}
        error={null}
        disabled
        onDownload={() => {}}
      />,
    )
    expect(
      screen.getByText('Enter a URL to generate a QR code.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The preview will appear here.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()
    expect(screen.queryByText('500x500px')).not.toBeInTheDocument()
  })

  it('shows the preview, caption, and download action', async () => {
    const onDownload = vi.fn()
    const user = userEvent.setup()
    renderWithTheme(
      <QrPreview
        previewUrl="blob:preview"
        width={750}
        height={750}
        loading={false}
        error={null}
        disabled={false}
        onDownload={onDownload}
      />,
    )
    expect(screen.getByAltText('QR code preview')).toHaveAttribute(
      'src',
      'blob:preview',
    )
    expect(screen.getByText('750x750px')).toBeInTheDocument()
    expect(screen.queryByText(/Version/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('shows the encoded version and module count when known', () => {
    renderWithTheme(
      <QrPreview
        previewUrl="blob:preview"
        width={500}
        height={500}
        version={7}
        moduleCount={45}
        loading={false}
        error={null}
        disabled={false}
        onDownload={vi.fn()}
      />,
    )
    expect(screen.getByText('Version 7 · 45×45 modules')).toBeInTheDocument()
  })

  it('shows an error and a loading overlay', () => {
    renderWithTheme(
      <QrPreview
        previewUrl="blob:preview"
        width={500}
        height={500}
        loading
        error="Failed to generate QR code"
        disabled={false}
        onDownload={() => {}}
      />,
    )
    expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()
  })

  it('shows a compact top bar when the original card leaves the viewport', async () => {
    const onDownload = vi.fn()
    const user = userEvent.setup()
    renderWithTheme(
      <QrPreview
        previewUrl="blob:preview"
        width={500}
        height={500}
        loading={false}
        error={null}
        disabled={false}
        onDownload={onDownload}
      />,
    )

    expect(screen.queryByRole('complementary', { name: 'Compact preview' })).not.toBeInTheDocument()

    emitIntersecting(false)

    const dock = screen.getByRole('complementary', { name: 'Compact preview' })
    expect(dock).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(onDownload).toHaveBeenCalledTimes(1)

    emitIntersecting(true)
    expect(screen.queryByRole('complementary', { name: 'Compact preview' })).not.toBeInTheDocument()
  })
})
