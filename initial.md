# Moabom - 북마크 관리 웹앱 초기 설계

## 프로젝트 개요

폴더 구조로 북마크를 관리하고, 크롬/엣지 등 브라우저와 호환되는 북마크 관리 웹앱.  
오프라인에서도 동작하는 PWA.

---

## 기술스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React + Vite + TypeScript | React 18, Vite 6 |
| 상태관리 | Zustand + Immer | v5 |
| 스토리지 | Dexie.js (IndexedDB) | v4 |
| 드래그앤드롭 | @dnd-kit/core + @dnd-kit/sortable | v6/v8 |
| 검색 | Fuse.js | v7 |
| 스타일 | Tailwind CSS v4 + shadcn/ui | - |
| 아이콘 | Lucide React | - |
| PWA | vite-plugin-pwa | - |
| 테스트 | Vitest | - |

---

## 핵심 기능

### Phase 1 (필수)
- [x] 프로젝트 기반 구축 (Vite + TS + Tailwind + Dexie + Zustand)
- [ ] 폴더 트리 UI (사이드바)
- [ ] 북마크 목록 (그리드/리스트 뷰)
- [ ] 북마크/폴더 추가·편집·삭제 모달
- [ ] 파비콘 자동 수집 (Google Favicon API)

### Phase 2 (핵심 UX)
- [ ] 드래그앤드롭 (폴더 내 재정렬, 폴더 간 이동)
- [ ] NETSCAPE 형식 가져오기/내보내기 (크롬·엣지 호환)
- [ ] 퍼지 검색 (Fuse.js, URL/제목/메모/태그 통합)
- [ ] 실행 취소/다시 실행 (Ctrl+Z/Y)
- [ ] 다크 모드

### Phase 3 (추가 기능)
- [ ] 태그 시스템
- [ ] 중복 URL 감지
- [ ] 링크 유효성 검사 (깨진 링크 표시)
- [ ] 휴지통 (삭제 후 30일 보관)
- [ ] 자동 JSON 백업 다운로드
- [ ] PWA (오프라인 지원, 앱 설치)

### Phase 4 (선택)
- [ ] GitHub Gist / WebDAV 동기화
- [ ] 스마트 폴더 (조건 기반 자동 수집)
- [ ] 키보드 단축키

---

## 데이터 모델

```typescript
// 플랫 구조로 IndexedDB에 저장, 렌더링 시 트리로 변환

interface BookmarkItem {
  id: string           // crypto.randomUUID()
  type: 'bookmark'
  parentId: string | null
  title: string
  url: string
  description?: string // 메모
  tags?: string[]
  favicon?: string
  sortOrder: number
  createdAt: number    // Unix ms
  updatedAt: number
  addDate?: number     // NETSCAPE 호환
  pinned?: boolean
}

interface FolderItem {
  id: string
  type: 'folder'
  parentId: string | null
  title: string
  isOpen: boolean
  sortOrder: number
  icon?: string        // 이모지
  color?: string       // hex 색상 레이블
  createdAt: number
  updatedAt: number
}
```

---

## 디렉토리 구조

```
src/
├── types/bookmark.ts              핵심 타입 정의
├── store/
│   ├── bookmarkStore.ts           북마크 CRUD + DB 동기화
│   └── uiStore.ts                 UI 상태 (뷰모드, 테마 등)
├── db/dexie.ts                    IndexedDB 스키마
├── utils/
│   ├── treeUtils.ts               트리 순회/변환 유틸
│   └── favicon.ts                 파비콘 URL 생성
├── features/
│   ├── import-export/
│   │   └── netscapeParser.ts      가져오기/내보내기 로직
│   └── search/                    검색 컴포넌트
├── components/
│   ├── layout/                    Sidebar, MainPanel, Toolbar
│   ├── bookmark/                  BookmarkCard, BookmarkRow, BookmarkForm
│   ├── folder/                    FolderTree, FolderNode, FolderForm
│   ├── dnd/                       DnD 래퍼 컴포넌트
│   └── ui/                        shadcn/ui 컴포넌트
└── hooks/                         커스텀 훅
```

---

## NETSCAPE 북마크 형식

크롬/엣지/파이어폭스가 사용하는 표준 형식:

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>폴더명</H3>
    <DL><p>
        <DT><A HREF="https://example.com" ADD_DATE="1234567890">사이트명</A>
    </DL><p>
</DL>
```

주의: `ADD_DATE`는 Unix 타임스탬프 **초** 단위. 내부 저장은 밀리초.
