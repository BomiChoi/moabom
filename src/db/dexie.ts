import Dexie, { type Table } from 'dexie'
import type { TreeNode } from '@/types/bookmark'

export class BookmarkDatabase extends Dexie {
  nodes!: Table<TreeNode, string>

  constructor() {
    super('moabom')
    this.version(1).stores({
      // id는 primary key, 나머지는 인덱스
      nodes: 'id, parentId, type, sortOrder, createdAt',
    })
  }
}

export const db = new BookmarkDatabase()
