import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import { ColorModeContext } from '../ColorModeProvider/colorModeContext'
import { ColorModeToggle } from './ColorModeToggle'

describe('ColorModeToggle', () => {
  it('renders a switch that reflects the current mode and toggles it', async () => {
    const toggleColorMode = vi.fn()
    const user = userEvent.setup()
    renderWithTheme(
      <ColorModeContext.Provider value={{ mode: 'dark', toggleColorMode }}>
        <ColorModeToggle />
      </ColorModeContext.Provider>,
    )
    const toggle = screen.getByLabelText('Toggle dark mode')
    expect(toggle).toBeChecked()
    await user.click(toggle)
    expect(toggleColorMode).toHaveBeenCalledTimes(1)
  })
})
