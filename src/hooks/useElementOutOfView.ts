import { useEffect, useState, type RefObject } from 'react'

export function useElementOutOfView(
  ref: RefObject<Element | null>,
  enabled: boolean,
): boolean {
  const [outOfView, setOutOfView] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setOutOfView(!(entry?.isIntersecting ?? true))
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, enabled])

  return enabled ? outOfView : false
}
