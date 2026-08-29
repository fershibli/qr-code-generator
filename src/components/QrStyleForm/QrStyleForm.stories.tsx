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

function StatefulQrStyleForm({ initialStyle }: { initialStyle?: QrStyle }) {
  const [style, setStyle] = useState<QrStyle>(
    () => initialStyle ?? createDefaultQrStyle(),
  )

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

function resizedMarksStyle(): QrStyle {
  const style = createDefaultQrStyle()
  return {
    ...style,
    finder: { ...style.finder, outerShape: 'circle', scale: 130 },
    alignment: { ...style.alignment, shape: 'circle', scale: 70 },
  }
}

export const Default: Story = {
  args: defaultArgs,
  render: () => <StatefulQrStyleForm />,
}

export const ResizedMarks: Story = {
  args: { ...defaultArgs, style: resizedMarksStyle() },
  render: () => <StatefulQrStyleForm initialStyle={resizedMarksStyle()} />,
}

function contourStyle(): QrStyle {
  const style = createDefaultQrStyle()
  return {
    ...style,
    contour: {
      ...style.contour,
      enabled: true,
      shape: 'circle',
      color: '#6a0dad',
      width: 8,
    },
  }
}

export const WithContour: Story = {
  args: { ...defaultArgs, style: contourStyle() },
  render: () => <StatefulQrStyleForm initialStyle={contourStyle()} />,
}
