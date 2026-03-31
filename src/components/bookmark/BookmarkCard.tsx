import { useState } from 'react'
import { ExternalLink, MoreHorizontal, Pencil, Trash2, Pin } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { FaviconImage } from './FaviconImage'
import { BookmarkForm } from './BookmarkForm'
import { useBookmarkStore } from '@/store/bookmarkStore'
import type { BookmarkItem } from '@/types/bookmark'
import { cn } from '@/lib/utils'

interface Props {
  bookmark: BookmarkItem
}

export function BookmarkCard({ bookmark }: Props) {
  const { deleteNode, updateBookmark } = useBookmarkStore()
  const [editOpen, setEditOpen] = useState(false)

  const handleOpen = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    updateBookmark(bookmark.id, {
      lastVisited: Date.now(),
      visitCount: (bookmark.visitCount ?? 0) + 1,
    })
  }

  const handleDelete = () => {
    if (confirm(`"${bookmark.title}" 북마크를 삭제할까요?`)) {
      deleteNode(bookmark.id)
    }
  }

  const handlePin = () => {
    updateBookmark(bookmark.id, { pinned: !bookmark.pinned })
  }

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer',
          bookmark.pinned && 'ring-1 ring-primary/30'
        )}
        onClick={handleOpen}
      >
        {bookmark.pinned && (
          <Pin className="absolute top-2 right-2 size-3 text-primary rotate-45" />
        )}

        {/* 파비콘 + 제목 */}
        <div className="flex items-start gap-2">
          <FaviconImage url={bookmark.url} cached={bookmark.favicon} size={16} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1 pr-4">{bookmark.title}</p>
        </div>

        {/* URL */}
        <p className="text-xs text-muted-foreground truncate">{new URL(bookmark.url).hostname}</p>

        {/* 설명 */}
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.description}</p>
        )}

        {/* 태그 */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
          >
            <MoreHorizontal className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen() }}>
              <ExternalLink className="size-4 mr-2" />
              열기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}>
              <Pencil className="size-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePin() }}>
              <Pin className="size-4 mr-2" />
              {bookmark.pinned ? '핀 해제' : '핀 고정'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleDelete() }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BookmarkForm open={editOpen} onOpenChange={setEditOpen} bookmark={bookmark} />
    </>
  )
}
