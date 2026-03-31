import { Plus, FolderPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { BookmarkCard } from '@/components/bookmark/BookmarkCard'
import { BookmarkRow } from '@/components/bookmark/BookmarkRow'
import { BookmarkForm } from '@/components/bookmark/BookmarkForm'
import { FolderForm } from '@/components/folder/FolderForm'
import { SortableItem } from '@/components/dnd/SortableItem'
import { BookmarkDragOverlay } from '@/components/dnd/BookmarkDragOverlay'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useUiStore } from '@/store/uiStore'
import { buildTree, isDescendant } from '@/utils/treeUtils'
import type { BookmarkItem, FolderItem, FolderTree as FolderTreeType } from '@/types/bookmark'

export function MainPanel() {
  const { nodes, selectedFolderId, moveNode } = useBookmarkStore()
  const { viewMode, searchQuery } = useUiStore()
  const [bookmarkFormOpen, setBookmarkFormOpen] = useState(false)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [activeNode, setActiveNode] = useState<BookmarkItem | FolderItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tree = useMemo(() => buildTree(nodes), [nodes])

  const visibleNodes = useMemo(() => {
    if (searchQuery.trim()) return []

    const targetId = selectedFolderId ?? 'root'
    const findFolder = (id: string): typeof tree | undefined => {
      if (tree.id === id) return tree
      for (const child of tree.children) {
        if (child.type === 'folder' && child.id === id) return child as typeof tree
      }
      return undefined
    }

    const parent = findFolder(targetId)
    if (!parent) return []
    return parent.children
  }, [tree, selectedFolderId, searchQuery])

  const folders = visibleNodes.filter((n): n is FolderTreeType => n.type === 'folder')
  const bookmarks = visibleNodes.filter((n): n is BookmarkItem => n.type === 'bookmark')

  const currentFolderTitle = useMemo(() => {
    if (!selectedFolderId) return '전체 북마크'
    return nodes.find((n) => n.id === selectedFolderId)?.title ?? '폴더'
  }, [nodes, selectedFolderId])

  const handleDragStart = (event: DragStartEvent) => {
    const node = nodes.find((n) => n.id === event.active.id)
    setActiveNode((node as BookmarkItem | FolderItem) ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNode(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeNode = nodes.find((n) => n.id === active.id)
    if (!activeNode) return

    // 폴더를 자기 자손으로 이동하는 것 방지
    if (activeNode.type === 'folder' && isDescendant(tree, over.id as string, activeNode.id)) return

    const siblings = visibleNodes
    const overIndex = siblings.findIndex((n) => n.id === over.id)
    if (overIndex === -1) return

    moveNode(active.id as string, activeNode.parentId, overIndex)
  }

  const sortableIds = visibleNodes.map((n) => n.id)

  return (
    <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="flex h-12 items-center justify-between px-4 border-b border-border shrink-0">
        <h2 className="text-sm font-medium truncate">{currentFolderTitle}</h2>
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {visibleNodes.length === 0 ? (
          <EmptyState onAdd={() => setBookmarkFormOpen(true)} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              {viewMode === 'grid' ? (
                <GridView folders={folders} bookmarks={bookmarks} sortableIds={sortableIds} />
              ) : (
                <ListView folders={folders} bookmarks={bookmarks} sortableIds={sortableIds} />
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

function GridView({
  folders,
  bookmarks,
  sortableIds,
}: {
  folders: FolderTreeType[]
  bookmarks: BookmarkItem[]
  sortableIds: string[]
}) {
  const { selectFolder } = useBookmarkStore()
  void sortableIds

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
      {folders.map((folder) => (
        <SortableItem key={folder.id} id={folder.id}>
          <button
            onDoubleClick={() => selectFolder(folder.id)}
            className="w-full flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center hover:bg-accent transition-colors cursor-pointer"
            style={{ borderLeftColor: folder.color || undefined, borderLeftWidth: folder.color ? 3 : undefined }}
          >
            <span className="text-3xl">{folder.icon ?? '📁'}</span>
            <span className="text-xs font-medium truncate w-full">{folder.title}</span>
          </button>
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

function ListView({
  folders,
  bookmarks,
  sortableIds,
}: {
  folders: FolderTreeType[]
  bookmarks: BookmarkItem[]
  sortableIds: string[]
}) {
  const { selectFolder } = useBookmarkStore()
  void sortableIds

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
      {folders.map((folder) => (
        <SortableItem key={folder.id} id={folder.id}>
          <button
            onDoubleClick={() => selectFolder(folder.id)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left w-full"
          >
            <span className="text-lg shrink-0">{folder.icon ?? '📁'}</span>
            <span className="text-sm font-medium">{folder.title}</span>
          </button>
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

