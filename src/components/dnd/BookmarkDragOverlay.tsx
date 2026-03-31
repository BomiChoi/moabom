import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import { FaviconImage } from '@/components/bookmark/FaviconImage'
import type { BookmarkItem, FolderItem } from '@/types/bookmark'

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
}

interface Props {
  activeNode: BookmarkItem | FolderItem | null
}

export function BookmarkDragOverlay({ activeNode }: Props) {
  return (
    <DragOverlay dropAnimation={dropAnimation}>
      {activeNode ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary bg-card px-3 py-2 shadow-lg text-sm font-medium opacity-90 max-w-[200px]">
          {activeNode.type === 'bookmark' ? (
            <>
              <FaviconImage url={activeNode.url} size={14} className="shrink-0" />
              <span className="truncate">{activeNode.title}</span>
            </>
          ) : (
            <>
              <span className="shrink-0">{activeNode.icon ?? '📁'}</span>
              <span className="truncate">{activeNode.title}</span>
            </>
          )}
        </div>
      ) : null}
    </DragOverlay>
  )
}
