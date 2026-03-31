import type { TreeNode, BookmarkItem, FolderItem, ImportResult } from '@/types/bookmark'

/** NETSCAPE Bookmark File HTML → 내부 TreeNode[] 변환 */
export function parseNetscape(html: string): { nodes: TreeNode[]; result: Omit<ImportResult, 'success'> } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes: TreeNode[] = []
  let imported = 0
  const errors: string[] = []
  const now = Date.now()

  const processItem = (element: Element, parentId: string | null, depth: number): void => {
    const dt = element.tagName === 'DT' ? element : null
    if (!dt) return

    const firstChild = dt.firstElementChild
    if (!firstChild) return

    if (firstChild.tagName === 'A') {
      // 북마크
      const a = firstChild as HTMLAnchorElement
      const url = a.getAttribute('href') ?? ''
      if (!url || url === 'place:') return // Firefox 특수 북마크 스킵

      const node: BookmarkItem = {
        id: crypto.randomUUID(),
        type: 'bookmark',
        parentId,
        title: a.textContent?.trim() ?? url,
        url,
        sortOrder: nodes.filter((n) => n.parentId === parentId).length,
        addDate: a.getAttribute('add_date') ? Number(a.getAttribute('add_date')) * 1000 : now,
        createdAt: now,
        updatedAt: now,
        favicon: a.getAttribute('icon') ?? undefined,
      }
      nodes.push(node)
      imported++
    } else if (firstChild.tagName === 'H3' || firstChild.tagName === 'H1') {
      // 폴더
      if (depth > 20) {
        errors.push(`최대 깊이 초과: ${firstChild.textContent}`)
        return
      }
      const folderId = crypto.randomUUID()
      const folder: FolderItem = {
        id: folderId,
        type: 'folder',
        parentId,
        title: firstChild.textContent?.trim() ?? '폴더',
        sortOrder: nodes.filter((n) => n.parentId === parentId).length,
        isOpen: true,
        createdAt: now,
        updatedAt: now,
      }
      nodes.push(folder)

      // 자식 DL 탐색
      const dl = dt.nextElementSibling
      if (dl && dl.tagName === 'DL') {
        for (const child of Array.from(dl.children)) {
          processItem(child, folderId, depth + 1)
        }
      }
    }
  }

  // 최상위 DL 탐색
  const topDl = doc.querySelector('DL')
  if (topDl) {
    for (const child of Array.from(topDl.children)) {
      processItem(child, null, 0)
    }
  } else {
    errors.push('유효한 북마크 파일이 아닙니다.')
  }

  return { nodes, result: { imported, skipped: 0, errors } }
}

/** 내부 TreeNode[] → NETSCAPE Bookmark File HTML 직렬화 */
export function serializeNetscape(nodes: TreeNode[]): string {
  const buildDl = (parentId: string | null): string => {
    const children = nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    if (children.length === 0) return ''

    const items = children.map((node) => {
      if (node.type === 'bookmark') {
        const addDate = node.addDate ? Math.floor(node.addDate / 1000) : Math.floor(node.createdAt / 1000)
        const iconAttr = node.favicon ? ` ICON="${node.favicon}"` : ''
        return `        <DT><A HREF="${escapeHtml(node.url)}" ADD_DATE="${addDate}"${iconAttr}>${escapeHtml(node.title)}</A>`
      } else {
        const subDl = buildDl(node.id)
        return `        <DT><H3>${escapeHtml(node.title)}</H3>\n        <DL><p>\n${subDl}        </DL><p>`
      }
    })
    return items.join('\n') + '\n'
  }

  const body = buildDl(null)
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${body}</DL>
`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 파일 다운로드 트리거 */
export function downloadAsHtml(content: string, filename = 'bookmarks.html'): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

