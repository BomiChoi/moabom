/** 북마크 트리의 모든 노드 공통 속성 */
interface BaseNode {
  id: string
  parentId: string | null
  title: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

/** 북마크 아이템 */
export interface BookmarkItem extends BaseNode {
  type: 'bookmark'
  url: string
  description?: string
  tags?: string[]
  favicon?: string
  addDate?: number
  lastVisited?: number
  visitCount?: number
  pinned?: boolean
}

/** 폴더 */
export interface FolderItem extends BaseNode {
  type: 'folder'
  isOpen: boolean
  icon?: string
  color?: string
}

/** 유니온 타입 */
export type TreeNode = BookmarkItem | FolderItem

/** 렌더링용 트리 구조 */
export interface FolderTree extends FolderItem {
  children: (BookmarkItem | FolderTree)[]
}

/** 검색 결과 */
export interface SearchResult {
  node: BookmarkItem
  breadcrumb: string[]
  score: number
}

/** NETSCAPE 파싱 중간 타입 */
export interface NetscapeNode {
  type: 'bookmark' | 'folder'
  title: string
  href?: string
  addDate?: string
  icon?: string
  children?: NetscapeNode[]
}

/** 가져오기 결과 */
export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}
