import { Plus, FolderPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { BookmarkCard } from '@/components/bookmark/BookmarkCard'
import { BookmarkRow } from '@/components/bookmark/BookmarkRow'
import { BookmarkForm } from '@/components/bookmark/BookmarkForm'
import { FolderForm } from '@/components/folder/FolderForm'
import { SortableItem } from '@/components/dnd/SortableItem'
import { BookmarkDragOverlay } from '@/components/dnd/BookmarkDragOverlay'
import { SearchResults } from '@/features/search/SearchResults'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useUiStore } from '@/store/uiStore'
import { useSearch } from '@/hooks/useSearch'
import { buildTree, isDescendant, findNode, nextSortOrder } from '@/utils/treeUtils'
import type { BookmarkItem, FolderItem, FolderTree as FolderTreeType } from '@/types/bookmark'
import { cn } from '@/lib/utils'

export function MainPanel() {
  const { nodes, selectedFolderId, moveNode } = useBookmarkStore()
  const { viewMode, searchQuery } = useUiStore()
  const [bookmarkFormOpen, setBookmarkFormOpen] = useState(false)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [activeNode, setActiveNode] = useState<BookmarkItem | FolderItem | null>(null)
  // 현재 드래그 중인 아이템이 위에 올려진 폴더 id
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tree = useMemo(() => buildTree(nodes), [nodes])
  const searchResults = useSearch(nodes, searchQuery)

  // 현재 폴더의 직접 자식 노드 (깊이에 상관없이 선택된 폴더 찾기)
  const visibleNodes = useMemo(() => {
    const targetId = selectedFolderId ?? 'root'
    const parent = targetId === 'root' ? tree : (findNode(tree, targetId) as FolderTreeType | undefined)
    if (!parent || parent.type !== 'folder') return []
    return (parent as FolderTreeType).children
  }, [tree, selectedFolderId])

  const folders = visibleNodes.filter((n): n is FolderTreeType => n.type === 'folder')
  const bookmarks = visibleNodes.filter((n): n is BookmarkItem => n.type === 'bookmark')
  const sortableIds = visibleNodes.map((n) => n.id)

  const currentFolderTitle = useMemo(() => {
    if (!selectedFolderId) return '전체 북마크'
    return nodes.find((n) => n.id === selectedFolderId)?.title ?? '폴더'
  }, [nodes, selectedFolderId])

  const handleDragStart = (event: DragStartEvent) => {
    const node = nodes.find((n) => n.id === event.active.id)
    setActiveNode((node as BookmarkItem | FolderItem) ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined
    if (!overId) {
      setDragOverFolderId(null)
      return
    }
    // over 대상이 폴더인지 확인
    const overNode = nodes.find((n) => n.id === overId)
    setDragOverFolderId(overNode?.type === 'folder' ? overId : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNode(null)
    setDragOverFolderId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const dragged = nodes.find((n) => n.id === active.id)
    if (!dragged) return

    const overNode = nodes.find((n) => n.id === over.id)

    // ── 경우 1: 폴더 위에 드롭 → 해당 폴더 안으로 이동 ──
    if (overNode?.type === 'folder') {
      // 폴더를 자기 자손으로 이동하는 것 방지
      if (dragged.type === 'folder' && isDescendant(tree, overNode.id, dragged.id)) return
      // 이미 그 폴더 안에 있으면 무시
      if (dragged.parentId === overNode.id) return

      const siblings = nodes.filter((n) => n.parentId === overNode.id)
      moveNode(dragged.id, overNode.id, nextSortOrder(siblings))
      return
    }

    // ── 경우 2: 북마크/같은 레벨 위에 드롭 → 순서 변경 ──
    const overIndex = sortableIds.indexOf(over.id as string)
    if (overIndex === -1) return
    moveNode(dragged.id, dragged.parentId, overIndex)
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {/* 헤더 */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-border shrink-0">
        <h2 className="text-sm font-medium truncate">
          {isSearching ? `검색: "${searchQuery}"` : currentFolderTitle}
        </h2>
        {!isSearching && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setFolderFormOpen(true)} className="h-8 gap-1.5 text-xs">
              <FolderPlus className="size-3.5" />
              새 폴더
            </Button>
            <Button size="sm" onClick={() => setBookmarkFormOpen(true)} className="h-8 gap-1.5 text-xs">
              <Plus className="size-3.5" />
              북마크 추가
            </Button>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <SearchResults results={searchResults} query={searchQuery} viewMode={viewMode} />
        ) : visibleNodes.length === 0 ? (
          <EmptyState onAdd={() => setBookmarkFormOpen(true)} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              {viewMode === 'grid' ? (
                <GridView folders={folders} bookmarks={bookmarks} dragOverFolderId={dragOverFolderId} />
              ) : (
                <ListView folders={folders} bookmarks={bookmarks} dragOverFolderId={dragOverFolderId} />
              )}
            </SortableContext>
            <BookmarkDragOverlay activeNode={activeNode} />
          </DndContext>
        )}
      </div>

      <BookmarkForm open={bookmarkFormOpen} onOpenChange={setBookmarkFormOpen} parentId={selectedFolderId} />
      <FolderForm open={folderFormOpen} onOpenChange={setFolderFormOpen} parentId={selectedFolderId} />
    </main>
  )
}

// ── 폴더 드롭 타겟 래퍼 ──────────────────────────────────
function DroppableFolder({
  id,
  isDragOver,
  children,
}: {
  id: string
  isDragOver: boolean
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg transition-colors',
        isDragOver && 'ring-2 ring-primary ring-offset-1 bg-primary/5'
      )}
    >
      {children}
    </div>
  )
}

// ── 그리드 뷰 ─────────────────────────────────────────────
function GridView({
  folders,
  bookmarks,
  dragOverFolderId,
}: {
  folders: FolderTreeType[]
  bookmarks: BookmarkItem[]
  dragOverFolderId: string | null
}) {
  const { selectFolder } = useBookmarkStore()

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
      {folders.map((folder) => (
        <SortableItem key={folder.id} id={folder.id}>
          <DroppableFolder id={folder.id} isDragOver={dragOverFolderId === folder.id}>
            <button
              onDoubleClick={() => selectFolder(folder.id)}
              className="w-full flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center hover:bg-accent transition-colors cursor-pointer"
              style={{
                borderLeftColor: folder.color || undefined,
                borderLeftWidth: folder.color ? 3 : undefined,
              }}
            >
              <span className="text-3xl">{folder.icon ?? '📁'}</span>
              <span className="text-xs font-medium truncate w-full">{folder.title}</span>
            </button>
          </DroppableFolder>
        </SortableItem>
      ))}
      {bookmarks.map((bookmark) => (
        <SortableItem key={bookmark.id} id={bookmark.id}>
          <BookmarkCard bookmark={bookmark} />
        </SortableItem>
      ))}
    </div>
  )
}

// ── 리스트 뷰 ─────────────────────────────────────────────
function ListView({
  folders,
  bookmarks,
  dragOverFolderId,
}: {
  folders: FolderTreeType[]
  bookmarks: BookmarkItem[]
  dragOverFolderId: string | null
}) {
  const { selectFolder } = useBookmarkStore()

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
      {folders.map((folder) => (
        <SortableItem key={folder.id} id={folder.id}>
          <DroppableFolder id={folder.id} isDragOver={dragOverFolderId === folder.id}>
            <button
              onDoubleClick={() => selectFolder(folder.id)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left w-full"
            >
              <span className="text-lg shrink-0">{folder.icon ?? '📁'}</span>
              <span className="text-sm font-medium">{folder.title}</span>
            </button>
          </DroppableFolder>
        </SortableItem>
      ))}
      {bookmarks.map((bookmark) => (
        <SortableItem key={bookmark.id} id={bookmark.id}>
          <BookmarkRow bookmark={bookmark} />
        </SortableItem>
      ))}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <p className="text-sm">북마크가 없어요.</p>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4 mr-1.5" />
        첫 번째 북마크 추가
      </Button>
    </div>
  )
}
