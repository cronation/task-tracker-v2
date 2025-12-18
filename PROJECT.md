# PROJECT.md : React Kanban & Todo Board

## 1. 프로젝트 개요
**React**, **Zustand**, **Styled-components**를 사용하여 Jira 스타일의 깔끔한 칸반 보드 및 리스트 뷰를 제공하는 정적 웹 애플리케이션입니다. 데이터는 **LocalStorage**에 저장되며, **Undo/Redo** 기능과 **2중 아코디언** 형태의 리스트 뷰를 특징으로 합니다.

## 2. 기술 스택 (Tech Stack)

| 구분 | 라이브러리/기술 | 용도 |
| --- | --- | --- |
| **Framework** | React (Vite) | UI 라이브러리 및 빌드 도구 |
| **Language** | TypeScript | 정적 타입 시스템 |
| **State Mgmt** | Zustand | 전역 상태 관리 |
| **Middleware** | zundo, persist | Undo/Redo(시간 여행), LocalStorage 영구 저장 |
| **Styling** | styled-components | CSS-in-JS, 테마 관리 |
| **Icons** | react-icons | UI 아이콘 (MdMoreHoriz, MdArrowForward, MdDelete, MdUndo, MdRedo 등) |
| **Utils** | date-fns | 날짜 포맷팅 및 계산 |
| **Utils** | uuid | 고유 ID 생성 |

---

## 3. 데이터 구조 (Data Structure)

### 3.1. 타입 정의 (`src/types/todo.ts`)

```typescript
export type TodoStatus = 'IDEA' | 'PLAN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type SortOption = 'CREATED_DESC' | 'DUE_ASC' | 'TITLE_ASC';

export interface Todo {
  id: string;             // UUID v4
  title: string;          // 제목 (빈 문자열 허용)
  memo: string;           // 메모 (빈 문자열 허용)
  dueDate: string;        // YYYY-MM-DD (빈 문자열 허용)
  status: TodoStatus;     // 현재 단계
  createdAt: number;      // Timestamp
  updatedAt: number;      // Timestamp
}
```

### 3.2. 상태 관리 설계 (`src/store`)
스토어는 데이터 변경(History 기록 대상)과 단순 UI 상태(기록 비대상)로 분리합니다.

#### A. TodoStore (데이터 + Undo/Redo)
* **Middleware:** `persist` (key: 'todo-storage'), `temporal` (zundo)
* **State:**
    * `todos`: Todo[]
    * `columnSorts`: Record<TodoStatus, SortOption> (각 단계별 정렬 기준)
* **Actions:**
    * `addTodo(todo: Todo)`
    * `updateTodo(id: string, updates: Partial<Todo>)` (리스트 인라인 편집 시 `onBlur` 시점에 호출)
    * `deleteTodo(id: string)`
    * `moveTodo(id: string, targetStatus: TodoStatus)`
    * `setColumnSort(status: TodoStatus, option: SortOption)`

#### B. UIStore (UI 상태)
* **State:**
    * `viewMode`: 'KANBAN' | 'LIST'
    * `expandedStatus`: TodoStatus | null (리스트 뷰 - 1단계 아코디언 제어)
    * `expandedTodoId`: string | null (리스트 뷰 - 2단계 아코디언 제어)
* **Actions:**
    * `setViewMode(mode)`
    * `setExpandedStatus(status)`: 해당 구획 열기/닫기 (Toggle/Accordion)
    * `setExpandedTodoId(id)`: 해당 항목 상세 열기/닫기 (Toggle/Accordion)

---

## 4. 디자인 시스템 & 스타일링

**Jira-like White Theme**를 기반으로 `DefaultTheme`을 구성합니다.

### 4.1. 컬러 팔레트
* **Background:** `#F4F5F7` (전체 배경), `#FFFFFF` (카드/보드 배경)
* **Text:** `#172B4D` (Primary), `#5E6C84` (Secondary/Placeholder)
* **Border:** `#DFE1E6`
* **Brand:** `#0052CC` (Primary Action), `#DE350B` (Delete/Danger)
* **Status Colors:**
    * IDEA: `#42526E` (Neutral)
    * PLAN: `#0052CC` (Blue)
    * IN_PROGRESS: `#00B8D9` (Cyan)
    * REVIEW: `#FFAB00` (Orange)
    * DONE: `#36B37E` (Green)

### 4.2. 글로벌 스타일
* `reset.css` 적용.
* Font: 시스템 폰트, Pretendard, Inter.

---

## 5. 상세 기능 명세 (Specifications)

### 5.1. 공통 헤더 (Header)
* **좌측:** 로고/앱 타이틀.
* **중앙:** 뷰 모드 전환 탭 (Switch UI).
* **우측:** Undo/Redo 컨트롤 (`<`, `>`). `zundo`의 `undo()`, `redo()` 바인딩.

### 5.2. 칸반 모드 (Kanban View)
**구조:** 5개의 컬럼이 가로로 배치 (Flex Row).

#### A. 컬럼 (Column)
* **Header:** `[단계명] [갯수 Badge] [정렬 아이콘]`
* **Footer (Add Card Widget):**
    * 카드 UI 내부에 `제목 Input`, `기한 Input`, `+ 추가 버튼` 포함.
    * 빈 값 입력 가능. 생성 시 즉시 해당 컬럼에 추가.

#### B. 카드 (Card)
* **내용:** 제목, 기한, 메모 아이콘.
* **Action:**
    * `>` 버튼: 다음 단계 이동.
    * `...` 버튼: 메뉴 (타 단계 이동, 삭제).
    * 카드 본문 클릭: 우측 `Detail Drawer` 오픈.

#### C. 상세 모달 (Detail Drawer)
* 우측 Overlay 슬라이드.
* 제목, 메모, 기한, 상태 수정 가능. (`onBlur` 저장)

### 5.3. 리스트 모드 (List View - Double Accordion)
**구조:** 2중 아코디언 구조. (Level 1: 상태 구획 → Level 2: 항목 상세)

#### Level 1: 상태 구획 (Status Group)
* 초기 상태: 5개의 상태 바(Header)가 세로로 나열됨.
* 표시: `[상태 컬러 띠] [단계명] [항목 갯수]`
* 동작: 클릭 시 해당 구획이 아래로 펼쳐지며(Expand) 포함된 Todo 리스트가 노출됨.
    * *UX:* 한 번에 하나의 구획만 열리거나(Accordion), 여러 개 열기(Toggle) 선택 구현 (기본: Accordion 권장).

#### Level 2: 항목 리스트 (Todo Item)
* 구획 내부에 존재하는 Todo 항목들.
* **Collapsed (기본 상태):**
    * 표시: `[제목] | [기한] | [메모 미리보기]`
    * **메모 미리보기:** CSS `line-clamp` 속성을 사용하여 **최대 5줄**까지 노출.
    * 동작: 클릭 시 해당 항목이 편집 모드로 확장됨 (다른 항목은 닫힘).
* **Expanded (편집 모드):**
    * 표시: `Input(제목)`, `Select(상태)`, `Input(기한)`, `Textarea(메모 - 전체)`, `Button(삭제)`.
    * 동작:
        * **인라인 편집:** 별도 저장 버튼 없이 `onBlur` 이벤트 발생 시 `updateTodo` 액션 실행 및 History 저장.
        * **Debounce:** 필요 시 `onChange`에 적용하되, `onBlur` 저장을 권장.

---

## 6. 구현 단계 (Implementation Steps)

1.  **Setup:** React + TypeScript + Vite, styled-components, zustand, zundo 설치.
2.  **Store:**
    * `useTodoStore`: CRUD, Undo/Redo, Persist.
    * `useUIStore`: `viewMode`, `expandedStatus`(Level 1), `expandedTodoId`(Level 2).
3.  **Components (Bottom-up):**
    * `Layout`: Main Wrapper, Header.
    * `Kanban`: Column, Card, Drawer.
    * `List`:
        * `StatusAccordion`: 5개 상태를 렌더링하고 `expandedStatus` 제어.
        * `TodoAccordion`: 각 상태 내부의 Todo 리스트, `expandedTodoId` 제어 및 인라인 폼.
4.  **Integration:**
    * Store 액션 연결.
    * 정렬 로직 (`utils/sort.ts`) 적용.
    * `zundo` Undo/Redo 버튼 연결.
5.  **Test:**
    * 리스트 모드 2중 아코디언 동작 확인 (구획 열기 -> 항목 열기 -> 편집 -> 닫기).
    * `onBlur` 시점의 데이터 저장 및 Undo 동작 검증.

---

## 7. 디렉토리 구조 (Directory Structure)

```
src/
├── components/
│   ├── common/          # Button, Input, Badge
│   ├── kanban/          # Board, Column, KanbanCard, AddWidget
│   ├── list/            # ListViewContainer, StatusAccordion, TodoItemAccordion
│   ├── layout/          # Header, MainLayout
│   └── modals/          # DetailDrawer
├── hooks/
├── store/               # useTodoStore (w/ zundo), useUIStore
├── styles/              # GlobalStyle, theme
├── types/
└── utils/
```