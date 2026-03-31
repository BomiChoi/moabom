import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderTree } from './FolderTree'
import { FolderForm } from './FolderForm'
import { BookmarkForm } from '@/components/bookmark/BookmarkForm'
import { useBookmarkStore } from '@/store/bookmarkStore'
import type { FolderTree as FolderTreeType } from '@/types/bookmark'
import { cn } from '@/lib/utils'

interface Props {
  folder: FolderTreeType
  depth: number
}

export function FolderNode({ folder, depth }: Props) {
  const { selectedFolderId, selectFolder, toggleFolder, deleteNode } = useBookmarkStore()
  const [editOpen, setEditOpen] = useState(false)
  const [addBookmarkOpen, setAddBookmarkOpen] = useState(false)
  const [addFolderOpen, setAddFolderOpen] = useState(false)

  const isSelected = selectedFolderId === folder.id
  const hasChildren = folder.children.some((c) => c.type === 'folder')

  const handleClick = () => {
    selectFolder(folder.id)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFolder(folder.id)
  }

  const handleDelete = () => {
    if (confirm(`"${folder.title}" 폴더와 하위 항목을 모두 삭제할까요?`)) {
      deleteNode(folder.id)
      if (isSelected) selectFolder(null)
    }
  }

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-0.5 rounded-md mx-1 pr-1 cursor-pointer hover:bg-accent transition-colors',
          isSelected && 'bg-accent font-medium'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleClick}
      >
        {/* 펼침 아이콘 */}
        <button
          onClick={handleToggle}
          className={cn('p-0.5 rounded hover:bg-accent-foreground/10 transition-colors shrink-0', !hasChildren && 'invisible')}
        >
          <ChevronRight
            className={cn('size-3 text-muted-foreground transition-transform', folder.isOpen && 'rotate-90')}
          />
        </button>

        {/* 폴더 아이콘 */}
        {folder.icon ? (
          <span className="text-sm shrink-0 w-4 text-center">{folder.icon}</span>
        ) : folder.isOpen ? (
          <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="size-3.5 shrink-0 text-muted-foreground" />
        )}

        {/* 폴더명 */}
        <span className="flex-1 py-1.5 text-sm truncate pl-1.5">{folder.title}</span>

        {/* 메뉴 버튼 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-foreground/10 transition-opacity shrink-0"
          >
            <MoreHorizontal className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem onClick={() => setAddBookmarkOpen(true)}>
              <Plus className="size-4 mr-2" />
              북마크 추가
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAddFolderOpen(true)}>
              <Folder className="size-4 mr-2" />
              하위 폴더 추가
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 자식 폴더 */}
      {folder.isOpen && hasChildren && (
        <FolderTree nodes={folder.children} depth={depth + 1} />
      )}

      <FolderForm open={editOpen} onOpenChange={setEditOpen} folder={folder} />
      <FolderForm open={addFolderOpen} onOpenChange={setAddFolderOpen} parentId={folder.id} />
      <BookmarkForm open={addBookmarkOpen} onOpenChange={setAddBookmarkOpen} parentId={folder.id} />
    </li>
  )
}
