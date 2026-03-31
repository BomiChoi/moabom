import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBookmarkStore } from '@/store/bookmarkStore'
import type { FolderTree } from '@/types/bookmark'

const COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
const ICONS = ['', '📁', '⭐', '💼', '🎮', '📚', '🛒', '🔧', '💡', '🎵', '🏠', '✈️']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder?: FolderTree       // 편집 모드
  parentId?: string | null  // 생성 모드
}

export function FolderForm({ open, onOpenChange, folder, parentId }: Props) {
  const { addFolder, updateFolder } = useBookmarkStore()
  const isEdit = !!folder

  const [title, setTitle] = useState('')
  const [color, setColor] = useState('')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(folder?.title ?? '')
      setColor(folder?.color ?? '')
      setIcon(folder?.icon ?? '')
    }
  }, [open, folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (isEdit) {
      await updateFolder(folder.id, { title: title.trim(), color, icon })
    } else {
      await addFolder({ type: 'folder', parentId: parentId ?? null, title: title.trim(), color, icon })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? '폴더 편집' : '새 폴더'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder-title">폴더 이름</Label>
            <Input
              id="folder-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="폴더 이름 입력"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>아이콘</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded border text-sm flex items-center justify-center transition-colors
                    ${icon === ic ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}
                >
                  {ic || <span className="text-muted-foreground text-xs">없음</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>색상</Label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all
                    ${color === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c || 'transparent' }}
                  title={c || '색상 없음'}
                >
                  {!c && <span className="text-muted-foreground text-xs leading-none">✕</span>}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? '저장' : '만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
