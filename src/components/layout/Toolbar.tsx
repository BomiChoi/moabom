import { Grid2X2, List, Download, Upload, Moon, Sun, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUiStore } from '@/store/uiStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { serializeNetscape, downloadAsHtml, parseNetscape } from '@/features/import-export/netscapeParser'

export function Toolbar() {
  const { viewMode, setViewMode, theme, setTheme, toggleSidebar, searchQuery, setSearchQuery } = useUiStore()
  const { nodes, importNodes } = useBookmarkStore()

  const handleExport = () => {
    const html = serializeNetscape(nodes)
    downloadAsHtml(html, 'moabom-bookmarks.html')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.htm'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const { nodes: imported } = parseNetscape(text)
      await importNodes(imported)
    }
    input.click()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex h-12 items-center gap-2 border-b border-border px-3 shrink-0">
      <Tooltip>
        <TooltipTrigger render={
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="size-8" />
        }>
          <PanelLeft className="size-4" />
        </TooltipTrigger>
        <TooltipContent>사이드바 토글</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5" />

      <Input
        placeholder="북마크 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8 w-64 text-sm"
      />

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger render={
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="size-8" />
          }>
            <Grid2X2 className="size-4" />
          </TooltipTrigger>
          <TooltipContent>그리드 뷰</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="size-8" />
          }>
            <List className="size-4" />
          </TooltipTrigger>
          <TooltipContent>리스트 뷰</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" size="icon" onClick={handleImport} className="size-8" />
          }>
            <Upload className="size-4" />
          </TooltipTrigger>
          <TooltipContent>북마크 가져오기 (.html)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" size="icon" onClick={handleExport} className="size-8" />
          }>
            <Download className="size-4" />
          </TooltipTrigger>
          <TooltipContent>북마크 내보내기</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-8" />
          }>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </TooltipTrigger>
          <TooltipContent>테마 전환</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
