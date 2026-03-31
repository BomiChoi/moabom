import Fuse, { type IFuseOptions } from 'fuse.js'
import { useMemo } from 'react'
import type { TreeNode, BookmarkItem, SearchResult } from '@/types/bookmark'
import { getBreadcrumb } from '@/utils/treeUtils'

const fuseOptions: IFuseOptions<BookmarkItem> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'url', weight: 0.2 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
}

export function useSearch(nodes: TreeNode[], query: string): SearchResult[] {
  const bookmarks = useMemo(
    () => nodes.filter((n): n is BookmarkItem => n.type === 'bookmark'),
    [nodes]
  )

  const fuse = useMemo(() => new Fuse(bookmarks, fuseOptions), [bookmarks])

  return useMemo(() => {
    const q = query.trim()
    if (!q) return []

    return fuse.search(q).map((result) => ({
      node: result.item,
      breadcrumb: getBreadcrumb(nodes, result.item.id),
      score: result.score ?? 1,
    }))
  }, [fuse, query, nodes])
}
