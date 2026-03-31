import { useEffect } from 'react'
import { useBookmarkStore } from '@/store/bookmarkStore'

function App() {
  const { loadAll, isLoading } = useBookmarkStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* TODO: Sidebar, MainPanel, Toolbar 구현 후 여기에 추가 */}
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">북마크 관리자 - 구현 중</p>
      </div>
    </div>
  )
}

export default App
