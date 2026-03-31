import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useBookmarkStore } from '@/store/bookmarkStore'
import type { BookmarkItem } from '@/types/bookmark'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookmark?: BookmarkItem   // 편집 모드
  parentId?: string | null  // 생성 모드
}

export function BookmarkForm({ open, onOpenChange, bookmark, parentId }: Props) {
  const { addBookmark, updateBookmark } = useBookmarkStore()
  const isEdit = !!bookmark

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setTitle(bookmark?.title ?? '')
      setUrl(bookmark?.url ?? '')
      setDescription(bookmark?.description ?? '')
      setTags(bookmark?.tags ?? [])
      setTagInput('')
    }
  }, [open, bookmark])

  // URL에서 자동으로 제목 추출 시도 (편집 모드가 아니고 제목이 비어 있을 때)
  const handleUrlBlur = () => {
    if (!isEdit && !title && url) {
      try {
        const hostname = new URL(url).hostname.replace('www.', '')
        setTitle(hostname)
      } catch {
        // 무시
      }
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    const data = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    if (isEdit) {
      await updateBookmark(bookmark.id, data)
    } else {
      await addBookmark({ type: 'bookmark', parentId: parentId ?? null, ...data })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '북마크 편집' : '북마크 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bm-url">URL</Label>
            <Input
              id="bm-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com"
              autoFocus={!isEdit}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bm-title">이름</Label>
            <Input
              id="bm-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="사이트 이름"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bm-desc">메모 (선택)</Label>
            <Textarea
              id="bm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="간단한 메모..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bm-tags">태그 (선택)</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] rounded-md border border-input px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="bm-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!title.trim() || !url.trim()}>
              {isEdit ? '저장' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
