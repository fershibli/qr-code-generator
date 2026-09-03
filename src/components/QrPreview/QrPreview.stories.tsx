import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { QrPreview } from './QrPreview'

const SAMPLE_PREVIEW =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const meta = {
  title: 'Components/QrPreview',
  component: QrPreview,
  args: {
    onDownload: fn(),
  },
} satisfies Meta<typeof QrPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    previewUrl: null,
    width: 500,
    height: 500,
    loading: false,
    error: null,
    disabled: true,
  },
}

export const WithPreview: Story = {
  args: {
    previewUrl: SAMPLE_PREVIEW,
    width: 750,
    height: 750,
    loading: false,
    error: null,
    disabled: false,
  },
}

export const Loading: Story = {
  args: {
    previewUrl: SAMPLE_PREVIEW,
    width: 500,
    height: 500,
    loading: true,
    error: null,
    disabled: false,
  },
}

export const ErrorState: Story = {
  args: {
    previewUrl: null,
    width: 500,
    height: 500,
    loading: false,
    error: 'Failed to generate QR code',
    disabled: true,
  },
}
