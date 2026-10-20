declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
export function track(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', eventName, params)
  window.dataLayer?.push({ event: eventName, ...params })
}