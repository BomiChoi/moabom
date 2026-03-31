const GOOGLE_FAVICON = 'https://www.google.com/s2/favicons?sz=32&domain_url='
const DUCKDUCKGO_FAVICON = 'https://icons.duckduckgo.com/ip3/'

export function getFaviconUrl(url: string, useFallback = false): string {
  try {
    const domain = new URL(url).hostname
    if (useFallback) {
      return `${DUCKDUCKGO_FAVICON}${domain}.ico`
    }
    return `${GOOGLE_FAVICON}${encodeURIComponent(url)}`
  } catch {
    return ''
  }
}
