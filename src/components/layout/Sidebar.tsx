import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderTree } from '@/components/folder/FolderTree'
import { FolderForm } from '@/components/folder/FolderForm'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useUiStore } from '@/store/uiStore'
import { buildTree } from '@/utils/treeUtils'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { nodes, selectedFolderId, selectFolder } = useBookmarkStore()
  const { sidebarOpen } = useUiStore()
  const [folderFormOpen, setFolderFormOpen] = useState(false)

  const tree = useMemo(() => buildTree(nodes), [nodes])

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-muted/30 transition-all duration-200 shrink-0',
        sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
      )}
    >
      {/* 헤더 */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <FolderOpen className="size-4" />
          <span>폴더</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setFolderFormOpen(true)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* 전체 보기 */}
      <button
        onClick={() => selectFolder(null)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm text-left w-full hover:bg-accent transition-colors',
          selectedFolderId === null && 'bg-accent font-medium'
        )}
      >
        <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
        전체 북마크
      </button>

      {/* 폴더 트리 */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          <FolderTree nodes={tree.children} depth={0} />
        </div>
      </ScrollArea>

      {/* 새 폴더 다이얼로그 */}
      <FolderForm
        open={folderFormOpen}
        onOpenChange={setFolderFormOpen}
        parentId={selectedFolderId}
      />
    </aside>
  )
}
