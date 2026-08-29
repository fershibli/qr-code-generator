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

function StatefulQrStyleForm() {
  const [style, setStyle] = useState<QrStyle>(createDefaultQrStyle)

  return (
    <QrStyleForm
      style={style}
      onStyleChange={setStyle}
      onReset={() => setStyle(createDefaultQrStyle())}
    />
  )
}

const defaultArgs = {
  style: createDefaultQrStyle(),
  onStyleChange: fn(),
  onReset: fn(),
}

export const Default: Story = {
  args: defaultArgs,
  render: () => <StatefulQrStyleForm />,
}
