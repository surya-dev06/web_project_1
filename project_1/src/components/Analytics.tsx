import { useEffect } from 'react'
export function Analytics() {
  useEffect(() => {
    const id = import.meta.env.VITE_GA_ID
    if (!id || id.includes('XXXX')) return
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)
    window.dataLayer = window.dataLayer || []
    window.gtag = function(){ window.dataLayer?.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', id, { anonymize_ip: true })
    return () => { script.remove() }
  }, [])
  return null
}