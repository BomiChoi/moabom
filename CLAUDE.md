# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint 검사
npm run test      # Vitest 전체 테스트
```

## Architecture

### 상태 관리

스토어는 두 개로 분리되어 있다:
- `src/store/bookmarkStore.ts` — 북마크/폴더 CRUD 및 IndexedDB 동기화. 모든 DB 작업 후 Zustand 상태도 함께 업데이트한다 (낙관적 업데이트 없음, DB 성공 후 반영).
- `src/store/uiStore.ts` — 뷰 모드, 테마, 사이드바 상태 등 UI 전용 상태. DB와 무관하다.

### 데이터 레이어

`src/db/dexie.ts`에서 IndexedDB를 관리한다. 노드는 **플랫 구조**로 저장(`parentId` 참조)되며, 렌더링 시 `src/utils/treeUtils.ts`의 `buildTree()`로 트리 구조로 변환한다. DB에 트리 구조를 직접 저장하지 않는다.

### 데이터 모델

`src/types/bookmark.ts`의 `TreeNode = BookmarkItem | FolderItem` 유니온으로 전체 앱의 타입을 정의한다. `type` 필드로 구분한다.

### 경로 별칭

`@/` → `src/`로 매핑됨 (`tsconfig.app.json` + `vite.config.ts` 모두 설정 완료).

### NETSCAPE 호환 가져오기/내보내기

`src/features/import-export/netscapeParser.ts`:
- `parseNetscape(html)` — DOMParser로 `<DL>/<DT>/<A>/<H3>` 구조를 파싱해 `TreeNode[]` 반환
- `serializeNetscape(nodes)` — `TreeNode[]`를 NETSCAPE Bookmark File HTML로 직렬화
- `downloadAsHtml(content)` — Blob URL로 파일 다운로드 트리거

크롬/엣지는 `ADD_DATE`를 Unix 초(초) 단위로 사용한다. 내부 저장은 밀리초.

### 핵심 유틸리티

`src/utils/treeUtils.ts`:
- `buildTree(nodes)` — 플랫 배열 → 트리 (폴더 우선, sortOrder 기준 정렬)
- `isDescendant(tree, nodeId, ancestorId)` — 드래그앤드롭 시 순환 이동 방지에 사용
- `getBreadcrumb(nodes, nodeId)` — 검색 결과 경로 표시용

### 드래그앤드롭

`@dnd-kit` 사용. 이동 완료 시 `bookmarkStore.moveNode(nodeId, newParentId, newSortOrder)` 호출. 이동 전 `isDescendant` 체크로 폴더를 자기 자손으로 이동하는 것을 차단해야 한다.

## PWA

`vite-plugin-pwa`로 Service Worker 자동 생성. `vite.config.ts`에서 manifest와 Workbox 설정.

## 기술스택 버전 주의

- Tailwind CSS v4: `@import "tailwindcss"` (v3의 `@tailwind` 지시문 사용 금지)
- Zustand v5: `immer` 미들웨어는 `zustand/middleware/immer`에서 임포트
- Dexie v4: `Table<T, K>` 제네릭 두 번째 인자에 primary key 타입 명시
