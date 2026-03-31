import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { db } from '@/db/dexie'
import type { TreeNode, BookmarkItem, FolderItem } from '@/types/bookmark'
import { nextSortOrder } from '@/utils/treeUtils'

interface BookmarkState {
  nodes: TreeNode[]
  selectedFolderId: string | null
  isLoading: boolean

  // DB에서 전체 노드 로드
  loadAll: () => Promise<void>

  // 북마크 CRUD
  addBookmark: (data: Omit<BookmarkItem, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => Promise<void>
  updateBookmark: (id: string, data: Partial<BookmarkItem>) => Promise<void>
  deleteNode: (id: string) => Promise<void>

  // 폴더 CRUD
  addFolder: (data: Omit<FolderItem, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'isOpen'>) => Promise<void>
  updateFolder: (id: string, data: Partial<FolderItem>) => Promise<void>
  toggleFolder: (id: string) => void

  // 이동 (드래그앤드롭)
  moveNode: (nodeId: string, newParentId: string | null, newSortOrder: number) => Promise<void>

  // 폴더 선택
  selectFolder: (id: string | null) => void

  // 일괄 가져오기 (NETSCAPE 파서에서 호출)
  importNodes: (nodes: TreeNode[]) => Promise<void>
}

const makeId = () => crypto.randomUUID()
const now = () => Date.now()

export const useBookmarkStore = create<BookmarkState>()(
  immer((set, get) => ({
    nodes: [],
    selectedFolderId: null,
    isLoading: false,

    loadAll: async () => {
      set((s) => { s.isLoading = true })
      const nodes = await db.nodes.toArray()
      set((s) => {
        s.nodes = nodes
        s.isLoading = false
      })
    },

    addBookmark: async (data) => {
      const siblings = get().nodes.filter((n) => n.parentId === data.parentId)
      const node: BookmarkItem = {
        ...data,
        id: makeId(),
        sortOrder: nextSortOrder(siblings),
        createdAt: now(),
        updatedAt: now(),
      }
      await db.nodes.add(node)
      set((s) => { s.nodes.push(node) })
    },

    updateBookmark: async (id, data) => {
      const updated = { ...data, updatedAt: now() }
      await db.nodes.update(id, updated)
      set((s) => {
        const idx = s.nodes.findIndex((n) => n.id === id)
        if (idx !== -1) Object.assign(s.nodes[idx], updated)
      })
    },

    deleteNode: async (id) => {
      // 자손 노드 포함 재귀 삭제
      const allIds = collectDescendants(get().nodes, id)
      allIds.push(id)
      await db.nodes.bulkDelete(allIds)
      set((s) => { s.nodes = s.nodes.filter((n) => !allIds.includes(n.id)) })
    },

    addFolder: async (data) => {
      const siblings = get().nodes.filter((n) => n.parentId === data.parentId)
      const node: FolderItem = {
        ...data,
        id: makeId(),
        isOpen: true,
        sortOrder: nextSortOrder(siblings),
        createdAt: now(),
        updatedAt: now(),
      }
      await db.nodes.add(node)
      set((s) => { s.nodes.push(node) })
    },

    updateFolder: async (id, data) => {
      const updated = { ...data, updatedAt: now() }
      await db.nodes.update(id, updated)
      set((s) => {
        const idx = s.nodes.findIndex((n) => n.id === id)
        if (idx !== -1) Object.assign(s.nodes[idx], updated)
      })
    },

    toggleFolder: (id) => {
      set((s) => {
        const node = s.nodes.find((n) => n.id === id)
        if (node && node.type === 'folder') {
          node.isOpen = !node.isOpen
        }
      })
      const node = get().nodes.find((n) => n.id === id)
      if (node && node.type === 'folder') db.nodes.update(id, { isOpen: (node as FolderItem).isOpen } as Partial<FolderItem>)
    },

    moveNode: async (nodeId, newParentId, newSortOrder) => {
      const updated = { parentId: newParentId, sortOrder: newSortOrder, updatedAt: now() }
      await db.nodes.update(nodeId, updated)
      set((s) => {
        const idx = s.nodes.findIndex((n) => n.id === nodeId)
        if (idx !== -1) Object.assign(s.nodes[idx], updated)
      })
    },

    selectFolder: (id) => {
      set((s) => { s.selectedFolderId = id })
    },

    importNodes: async (nodes) => {
      await db.nodes.bulkPut(nodes)
      set((s) => {
        // 기존 nodes에 병합 (같은 id는 덮어쓰기)
        const existingIds = new Set(s.nodes.map((n) => n.id))
        for (const node of nodes) {
          if (existingIds.has(node.id)) {
            const idx = s.nodes.findIndex((n) => n.id === node.id)
            s.nodes[idx] = node
          } else {
            s.nodes.push(node)
          }
        }
      })
    },
  }))
)

function collectDescendants(nodes: TreeNode[], parentId: string): string[] {
  const children = nodes.filter((n) => n.parentId === parentId)
  return children.flatMap((c) => [c.id, ...collectDescendants(nodes, c.id)])
}
