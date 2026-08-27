import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithTheme } from '../../test/renderWithTheme'
import { AppFooter } from './AppFooter'

describe('AppFooter', () => {
  it('shows the app version and GitHub repository link', () => {
    renderWithTheme(<AppFooter />)
    expect(screen.getByText(/^v/)).toHaveTextContent(/^v\d+\.\d+\.\d+$/)
    const link = screen.getByRole('link', {
      name: 'github.com/fershibli/qr-code-generator',
    })
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/fershibli/qr-code-generator',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })
})
