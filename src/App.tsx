import { useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toolbar } from '@/components/layout/Toolbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainPanel } from '@/components/layout/MainPanel'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useUiStore } from '@/store/uiStore'

function App() {
  const { loadAll, isLoading } = useBookmarkStore()
  const { theme } = useUiStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // dark 클래스를 html 요소에 직접 적용해야 Tailwind dark: 변수가 동작함
  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
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
  )
}

export default App
