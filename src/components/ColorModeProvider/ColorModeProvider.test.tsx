import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorModeProvider } from './ColorModeProvider'
import { ColorModeToggle } from '../ColorModeToggle'
import { useColorModeContext } from './colorModeContext'

function Probe() {
  const { mode } = useColorModeContext()
  return <span>mode:{mode}</span>
}

describe('ColorModeProvider', () => {
  it('throws when the context hook is used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(
      'useColorModeContext must be used within ColorModeProvider',
    )
  })

  it('provides mode to children and toggles it', async () => {
    document.documentElement.dataset.colorMode = 'light'
    const user = userEvent.setup()
    render(
      <ColorModeProvider>
        <Probe />
        <ColorModeToggle />
      </ColorModeProvider>,
    )
    expect(screen.getByText('mode:light')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Toggle dark mode'))
    expect(screen.getByText('mode:dark')).toBeInTheDocument()
  })
})
