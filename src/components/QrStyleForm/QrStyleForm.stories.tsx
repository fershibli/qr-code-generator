import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useState } from 'react'
import { createDefaultQrStyle, type QrStyle } from '../../qrStyle'
import { QrStyleForm } from './QrStyleForm'

const meta = {
  title: 'Components/QrStyleForm',
  component: QrStyleForm,
} satisfies Meta<typeof QrStyleForm>

export default meta
type Story = StoryObj<typeof meta>

function StatefulQrStyleForm({ hasLogo = false }: { hasLogo?: boolean }) {
  const [style, setStyle] = useState<QrStyle>(createDefaultQrStyle)
  const [logoTransparentBackground, setLogoTransparentBackground] =
    useState(false)

  return (
    <QrStyleForm
      style={style}
      onStyleChange={setStyle}
      hasLogo={hasLogo}
      logoTransparentBackground={logoTransparentBackground}
      onLogoTransparentBackgroundChange={setLogoTransparentBackground}
      onReset={() => {
        setStyle(createDefaultQrStyle())
        setLogoTransparentBackground(false)
      }}
    />
  )
}

const defaultArgs = {
  style: createDefaultQrStyle(),
  onStyleChange: fn(),
  hasLogo: false,
  logoTransparentBackground: false,
  onLogoTransparentBackgroundChange: fn(),
  onReset: fn(),
}

export const Default: Story = {
  args: defaultArgs,
  render: () => <StatefulQrStyleForm />,
}

export const WithLogo: Story = {
  args: { ...defaultArgs, hasLogo: true },
  render: () => <StatefulQrStyleForm hasLogo />,
}
