import { useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toolbar } from '@/components/layout/Toolbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainPanel } from '@/components/layout/MainPanel'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

function App() {
  const { loadAll, isLoading } = useBookmarkStore()
  const { theme } = useUiStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // 시스템 테마 감지
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className={cn('contents', isDark && 'dark')}>
      <TooltipProvider delay={400}>
        <div className="flex flex-col h-svh bg-background text-foreground">
          <Toolbar />
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                로딩 중...
              </div>
            ) : (
              <MainPanel />
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}

export default App
