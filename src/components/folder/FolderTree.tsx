import type { BookmarkItem, FolderTree as FolderTreeType } from '@/types/bookmark'
import { FolderNode } from './FolderNode'

interface Props {
  nodes: (BookmarkItem | FolderTreeType)[]
  depth: number
}

export function FolderTree({ nodes, depth }: Props) {
  const folders = nodes.filter((n): n is FolderTreeType => n.type === 'folder')

  if (folders.length === 0) return null

  return (
    <ul className="list-none p-0 m-0">
      {folders.map((folder) => (
        <FolderNode key={folder.id} folder={folder} depth={depth} />
      ))}
    </ul>
  )
}
