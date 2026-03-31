import type { TreeNode, FolderItem, FolderTree, BookmarkItem } from '@/types/bookmark'

/** 플랫 노드 배열을 트리 구조로 변환 */
export function buildTree(nodes: TreeNode[]): FolderTree {
  const nodeMap = new Map<string, TreeNode & { children?: (BookmarkItem | FolderTree)[] }>()

  // 루트 폴더 생성 (parentId가 null인 노드들의 컨테이너)
  const root: FolderTree = {
    id: 'root',
    type: 'folder',
    parentId: null,
    title: '루트',
    sortOrder: 0,
    isOpen: true,
    createdAt: 0,
    updatedAt: 0,
    children: [],
  }
  nodeMap.set('root', root)

  // 모든 노드를 map에 등록
  for (const node of nodes) {
    if (node.type === 'folder') {
      nodeMap.set(node.id, { ...node, children: [] })
    } else {
      nodeMap.set(node.id, node)
    }
  }

  // 부모-자식 관계 구성
  for (const node of nodes) {
    const parentId = node.parentId ?? 'root'
    const parent = nodeMap.get(parentId) as FolderTree | undefined
    if (parent && 'children' in parent) {
      parent.children.push(nodeMap.get(node.id) as BookmarkItem | FolderTree)
    }
  }

  // 각 폴더 자식들을 sortOrder 기준으로 정렬
  const sortChildren = (folder: FolderTree) => {
    folder.children.sort((a, b) => {
      // 폴더를 북마크보다 먼저, 같은 타입 내에서는 sortOrder 기준
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.sortOrder - b.sortOrder
    })
    for (const child of folder.children) {
      if (child.type === 'folder') sortChildren(child as FolderTree)
    }
  }
  sortChildren(root)

  return root
}

/** 트리에서 특정 id의 노드 찾기 */
export function findNode(tree: FolderTree, id: string): TreeNode | undefined {
  if (tree.id === id) return tree
  for (const child of tree.children) {
    if (child.id === id) return child
    if (child.type === 'folder') {
      const found = findNode(child as FolderTree, id)
      if (found) return found
    }
  }
  return undefined
}

/** 특정 노드의 조상 경로(breadcrumb) 반환 */
export function getBreadcrumb(nodes: TreeNode[], nodeId: string): string[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const path: string[] = []
  let current = nodeMap.get(nodeId)
  while (current) {
    path.unshift(current.title)
    if (!current.parentId) break
    current = nodeMap.get(current.parentId)
  }
  return path
}

/** 새 노드의 sortOrder 계산 (형제 중 최댓값 + 1) */
export function nextSortOrder(siblings: TreeNode[]): number {
  if (siblings.length === 0) return 0
  return Math.max(...siblings.map((s) => s.sortOrder)) + 1
}

/** 폴더 id 목록 (선택된 폴더의 모든 자손 폴더 포함) 반환 */
export function getAllDescendantIds(tree: FolderTree, folderId: string): string[] {
  const folder = findNode(tree, folderId)
  if (!folder || folder.type !== 'folder') return []
  const ids: string[] = [folderId]
  const collect = (f: FolderTree) => {
    for (const child of f.children) {
      ids.push(child.id)
      if (child.type === 'folder') collect(child as FolderTree)
    }
  }
  collect(folder as FolderTree)
  return ids
}

/** 노드가 특정 폴더의 자손인지 확인 (순환 이동 방지) */
export function isDescendant(tree: FolderTree, nodeId: string, potentialAncestorId: string): boolean {
  const descendantIds = getAllDescendantIds(tree, potentialAncestorId)
  return descendantIds.includes(nodeId)
}

export function isFolderItem(node: TreeNode): node is FolderItem {
  return node.type === 'folder'
}

export function isBookmarkItem(node: TreeNode): node is BookmarkItem {
  return node.type === 'bookmark'
}
