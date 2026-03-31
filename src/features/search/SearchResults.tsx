import { ChevronRight } from 'lucide-react'
import { BookmarkCard } from '@/components/bookmark/BookmarkCard'
import { BookmarkRow } from '@/components/bookmark/BookmarkRow'
import type { SearchResult } from '@/types/bookmark'

interface Props {
  results: SearchResult[]
  query: string
  viewMode: 'grid' | 'list'
}

export function SearchResults({ results, query, viewMode }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <p className="text-sm">
          <span className="font-medium text-foreground">"{query}"</span> 검색 결과가 없어요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">
        "{query}" — {results.length}개 결과
      </p>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {results.map(({ node, breadcrumb }) => (
            <div key={node.id} className="space-y-1">
              <BookmarkCard bookmark={node} />
              <Breadcrumb path={breadcrumb} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
          {results.map(({ node, breadcrumb }) => (
            <div key={node.id}>
              <BookmarkRow bookmark={node} />
              <div className="px-4 pb-1.5">
                <Breadcrumb path={breadcrumb} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Breadcrumb({ path }: { path: string[] }) {
  // 마지막 항목(북마크 자신)은 제외
  const folderPath = path.slice(0, -1)
  if (folderPath.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {folderPath.map((segment, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground">{segment}</span>
          {i < folderPath.length - 1 && (
            <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
          )}
        </span>
      ))}
    </div>
  )
}
