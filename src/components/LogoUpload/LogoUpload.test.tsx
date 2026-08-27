import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import * as logoCache from '../../utils/logoCache'
import { LogoUpload } from './LogoUpload'

function makeFile(name: string, lastModified = 1) {
  return new File([new Uint8Array([1, 2, 3, 4])], name, {
    type: 'image/png',
    lastModified,
  })
}

describe('LogoUpload', () => {
  it('uploads a logo and lists it under recent logos', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const { rerender } = renderWithTheme(
      <LogoUpload file={null} previewUrl={null} onChange={onChange} />,
    )
    const file = makeFile('brand.png')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    expect(onChange).toHaveBeenCalledWith(file)

    rerender(
      <LogoUpload
        file={file}
        previewUrl="blob:selected"
        onChange={onChange}
      />,
    )
    expect(screen.getByText('brand.png')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Use recent logo brand.png' }),
      ).toBeInTheDocument()
    })
  })

  it('selects a recent logo and does not clear the cache on remove', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const file = makeFile('cached.png', 5)
    const { rerender } = renderWithTheme(
      <LogoUpload file={null} previewUrl={null} onChange={onChange} />,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Use recent logo cached.png' }),
      ).toBeInTheDocument(),
    )

    rerender(
      <LogoUpload file={null} previewUrl={null} onChange={onChange} />,
    )
    onChange.mockClear()
    await user.click(
      screen.getByRole('button', { name: 'Use recent logo cached.png' }),
    )
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.calls[0]?.[0]).toBeInstanceOf(File)

    rerender(
      <LogoUpload
        file={file}
        previewUrl="blob:selected"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove logo' }))
    expect(onChange).toHaveBeenCalledWith(null)
    expect(await logoCache.listLogos()).toHaveLength(1)
  })

  it('opens the file picker and treats an empty selection as a clear', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const click = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    renderWithTheme(
      <LogoUpload file={null} previewUrl={null} onChange={onChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Upload logo' }))
    expect(click).toHaveBeenCalled()
    click.mockRestore()

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [] } })
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('ignores a recent logo that can no longer be read', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const file = makeFile('gone.png', 7)
    renderWithTheme(
      <LogoUpload file={null} previewUrl={null} onChange={onChange} />,
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Use recent logo gone.png' }),
      ).toBeInTheDocument(),
    )
    onChange.mockClear()
    vi.spyOn(logoCache, 'getLogo').mockResolvedValueOnce(null)
    await user.click(
      screen.getByRole('button', { name: 'Use recent logo gone.png' }),
    )
    await waitFor(() => {
      expect(logoCache.getLogo).toHaveBeenCalled()
    })
    expect(onChange).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
