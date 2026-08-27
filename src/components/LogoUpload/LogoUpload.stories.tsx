import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LogoUpload } from './LogoUpload'

const SAMPLE_PREVIEW =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const meta = {
  title: 'Components/LogoUpload',
  component: LogoUpload,
} satisfies Meta<typeof LogoUpload>

export default meta
type Story = StoryObj<typeof meta>

function StatefulLogoUpload({
  initialFile = null,
  initialPreview = null,
}: {
  initialFile?: File | null
  initialPreview?: string | null
}) {
  const [file, setFile] = useState<File | null>(initialFile)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview)

  return (
    <LogoUpload
      file={file}
      previewUrl={previewUrl}
      onChange={(next) => {
        setPreviewUrl((previous) => {
          if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
          return next ? URL.createObjectURL(next) : null
        })
        setFile(next)
      }}
    />
  )
}

export const Empty: Story = {
  args: {
    file: null,
    previewUrl: null,
    onChange: () => {},
  },
  render: () => <StatefulLogoUpload />,
}

export const WithLogo: Story = {
  args: {
    file: null,
    previewUrl: null,
    onChange: () => {},
  },
  render: () => (
    <StatefulLogoUpload
      initialFile={
        new File([new Uint8Array([1, 2, 3, 4])], 'brand.png', {
          type: 'image/png',
        })
      }
      initialPreview={SAMPLE_PREVIEW}
    />
  ),
}
