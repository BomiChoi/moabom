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

interface Props {
  bookmark: BookmarkItem
}

export function BookmarkRow({ bookmark }: Props) {
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

  return (
    <>
      <div
        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors cursor-pointer"
        onClick={handleOpen}
      >
        <FaviconImage url={bookmark.url} cached={bookmark.favicon} size={16} className="shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{bookmark.title}</span>
            {bookmark.pinned && <Pin className="size-3 text-primary rotate-45 shrink-0" />}
          </div>
          {bookmark.description && (
            <p className="text-xs text-muted-foreground truncate">{bookmark.description}</p>
          )}
        </div>

        <span className="text-xs text-muted-foreground truncate max-w-[180px] hidden sm:block">
          {new URL(bookmark.url).hostname}
        </span>

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="hidden md:flex gap-1">
            {bookmark.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent-foreground/10 transition-opacity shrink-0"
          >
            <MoreHorizontal className="size-4 text-muted-foreground" />
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
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateBookmark(bookmark.id, { pinned: !bookmark.pinned }) }}>
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
