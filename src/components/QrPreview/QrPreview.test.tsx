import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import { QrPreview } from './QrPreview'

describe('QrPreview', () => {
  it('shows an empty state and a disabled download button', () => {
    renderWithTheme(
      <QrPreview
        previewUrl={null}
        resolution={500}
        loading={false}
        error={null}
        disabled
        onDownload={() => {}}
      />,
    )
    expect(
      screen.getByText('Enter a URL to generate a QR code.'),
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
        resolution={750}
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
    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('shows an error and a loading overlay', () => {
    renderWithTheme(
      <QrPreview
        previewUrl="blob:preview"
        resolution={500}
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
})
