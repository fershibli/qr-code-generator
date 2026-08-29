import { describe, expect, it } from 'vitest'
import {
  MAX_QR_VERSION,
  MIN_QR_VERSION,
  clampQrVersion,
  modulesForVersion,
  versionForModules,
} from './constants'

describe('QR version helpers', () => {
  it('maps versions to their module count', () => {
    expect(modulesForVersion(1)).toBe(21)
    expect(modulesForVersion(10)).toBe(57)
    expect(modulesForVersion(MAX_QR_VERSION)).toBe(177)
  })

  it('maps module counts back to their version', () => {
    expect(versionForModules(21)).toBe(1)
    expect(versionForModules(177)).toBe(MAX_QR_VERSION)
    expect(versionForModules(modulesForVersion(23))).toBe(23)
  })

  it('clamps and rounds versions into the supported range', () => {
    expect(clampQrVersion(0)).toBe(MIN_QR_VERSION)
    expect(clampQrVersion(-5)).toBe(MIN_QR_VERSION)
    expect(clampQrVersion(99)).toBe(MAX_QR_VERSION)
    expect(clampQrVersion(7.4)).toBe(7)
  })
})
