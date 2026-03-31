import { useState } from 'react'
import { Globe } from 'lucide-react'
import { getFaviconUrl } from '@/utils/favicon'

interface Props {
  url: string
  cached?: string
  size?: number
  className?: string
}

export function FaviconImage({ url, cached, size = 16, className }: Props) {
  const [src, setSrc] = useState(cached || getFaviconUrl(url))
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return <Globe style={{ width: size, height: size }} className={className ?? 'text-muted-foreground'} />
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      alt=""
      onError={() => {
        // 구글 API 실패 시 DuckDuckGo fallback
        if (!src.includes('duckduckgo')) {
          setSrc(getFaviconUrl(url, true))
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
