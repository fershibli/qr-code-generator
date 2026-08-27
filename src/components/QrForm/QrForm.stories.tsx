import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  DEFAULT_LOGO_PADDING,
  DEFAULT_LOGO_SIZE,
  DEFAULT_QR_MARGIN,
  DEFAULT_RESOLUTION,
  type Resolution,
} from '../../constants'
import { QrForm } from './QrForm'

const SAMPLE_PREVIEW =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const meta = {
  title: 'Components/QrForm',
  component: QrForm,
} satisfies Meta<typeof QrForm>

export default meta
type Story = StoryObj<typeof meta>

function StatefulQrForm({ withLogo = false }: { withLogo?: boolean }) {
  const [url, setUrl] = useState(withLogo ? 'https://example.com' : '')
  const [logoFile, setLogoFile] = useState<File | null>(
    withLogo
      ? new File([new Uint8Array([1, 2, 3, 4])], 'logo.png', {
          type: 'image/png',
        })
      : null,
  )
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    withLogo ? SAMPLE_PREVIEW : null,
  )
  const [size, setSize] = useState(DEFAULT_LOGO_SIZE)
  const [logoPadding, setLogoPadding] = useState(DEFAULT_LOGO_PADDING)
  const [margin, setMargin] = useState(DEFAULT_QR_MARGIN)
  const [resolution, setResolution] = useState<Resolution>(DEFAULT_RESOLUTION)

  return (
    <QrForm
      url={url}
      onUrlChange={setUrl}
      logoFile={logoFile}
      logoPreviewUrl={logoPreviewUrl}
      onLogoChange={(file) => {
        setLogoPreviewUrl((previous) => {
          if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
          return file ? URL.createObjectURL(file) : null
        })
        setLogoFile(file)
      }}
      size={size}
      onSizeChange={setSize}
      logoPadding={logoPadding}
      onLogoPaddingChange={setLogoPadding}
      margin={margin}
      onMarginChange={setMargin}
      resolution={resolution}
      onResolutionChange={setResolution}
    />
  )
}

const defaultArgs = {
  url: '',
  onUrlChange: () => {},
  logoFile: null,
  logoPreviewUrl: null,
  onLogoChange: () => {},
  size: DEFAULT_LOGO_SIZE,
  onSizeChange: () => {},
  logoPadding: DEFAULT_LOGO_PADDING,
  onLogoPaddingChange: () => {},
  margin: DEFAULT_QR_MARGIN,
  onMarginChange: () => {},
  resolution: DEFAULT_RESOLUTION,
  onResolutionChange: () => {},
}

export const Empty: Story = {
  args: defaultArgs,
  render: () => <StatefulQrForm />,
}

export const WithLogo: Story = {
  args: defaultArgs,
  render: () => <StatefulQrForm withLogo />,
}
