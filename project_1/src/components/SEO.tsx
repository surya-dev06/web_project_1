import { useEffect } from 'react'
type Props = { title: string; description: string; path?: string }
export function SEO({ title, description, path = '' }: Props) {
  useEffect(() => {
    document.title = title
    const set = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.head.querySelector(selector) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); property ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el) }
      el.content = content
    }
    set('description', description)
    set('og:title', title, true); set('og:description', description, true)
    const base = import.meta.env.VITE_SITE_URL || window.location.origin
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }, [title, description, path])
  return null
}