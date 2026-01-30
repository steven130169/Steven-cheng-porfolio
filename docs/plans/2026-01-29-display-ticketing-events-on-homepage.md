# Separate Workshop and Speaking Events Components

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將首頁活動區塊拆分為兩個獨立組件：(1) Workshop 組件顯示我主辦的工作坊（售票活動），(2) Speak 組件顯示我受邀的演講活動

**Architecture:**
採用 **關注點分離 (Separation of Concerns)** 原則，將兩種不同性質的活動拆分為獨立組件：

1. **Workshop 組件** (`frontend/src/components/Workshop.tsx`)：
   - 資料來源：`/api/events`（資料庫 events table，PUBLISHED 狀態）
   - 用途：顯示我主辦的工作坊（售票活動）
   - 特色：顯示容量、票務資訊、活動詳情連結
   - 管理方式：透過 Admin API 管理（不提供前台新增功能）
   - Section ID: `#workshop`

2. **Speak 組件** (`frontend/src/components/Speak.tsx`)：
   - 資料來源：已存在，保持原有功能
   - 用途：顯示我受邀參與的演講活動
   - 特色：顯示活動名稱、演講主題、地點、類型（Conference/Meetup/Podcast）
   - 管理方式：保持原有管理方式
   - Section ID: `#speaking`（保持原有 ID）

3. **首頁整合**：
   - 移除舊的 Event 組件
   - 保留現有 Speak 組件
   - 新增 Workshop 組件
   - 在 `page.tsx` 中渲染順序：Workshop → Speak
   - 各自獨立渲染，UI 風格一致但內容結構不同

**Tech Stack:**
- Next.js 16 (App Router)
- React 19 (Client Components)
- Drizzle ORM 0.45.1
- 兩個 API endpoints: `/api/events` (售票), `/api/community-events` (社群)
- Tailwind CSS 4

**優勢:**
- 程式碼更易維護（單一職責原則）
- 命名更精確（Workshop vs Speaking）
- 未來擴展容易（各自獨立演化）
- 測試更簡單（獨立測試案例）

**現有組件狀態:**
- `Speak.tsx` 已存在，顯示靜態演講資料（hardcoded talks）
- `Event.tsx` 將重新命名為 `Workshop.tsx`

---

## Task 1: 將 Event 組件重新命名為 Workshop

**Files:**
- Rename: `frontend/src/components/Event.tsx` → `Workshop.tsx`
- Rename: `frontend/src/components/Event.spec.tsx` → `Workshop.spec.tsx`

**Step 1: 使用 JetBrains MCP 重新命名檔案**

```typescript
// 重新命名組件檔案
mcp__jetbrains__rename_refactoring({
    pathInProject: 'frontend/src/components/Event.tsx',
    symbolName: 'Event',
    newName: 'Workshop',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 定義售票活動型別**

在 Workshop.tsx 中，移除 `import { EventItem } from '@/types';`，改為定義本地型別：

```typescript
// 售票活動型別（對應 database events table）
interface TicketingEvent {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalCapacity: number;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: 更新組件 state 和 API 呼叫**

```typescript
const [events, setEvents] = useState<TicketingEvent[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/events')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('API did not return an array', data);
        setEvents([]);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to fetch events', error);
      setLoading(false);
    });
}, []);
```

移除：
- `isFormOpen`, `newEvent`, `handleSubmit` 相關 state 和函數
- "Add Event" 按鈕
- 新增活動的 modal 表單

**Step 3: 更新 section 標題和描述**

```tsx
<h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
  我的工作坊與演講
</h2>
<div className="h-1 w-20 bg-secondary rounded-full mb-4"></div>
<p className="text-dark-text/70 max-w-2xl">
  我主辦的技術工作坊和演講活動，分享雲端架構、DevOps 實踐經驗。
</p>
```

**Step 4: 更新活動卡片 UI**

```tsx
{events.map((event) => (
  <div
    key={event.id}
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-dark-text mb-2">
          {event.title}
        </h3>
        {event.eventDate && (
          <div className="flex items-center text-dark-text/60 text-sm mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(event.eventDate).toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>

    {event.description && (
      <p className="text-dark-text/70 mb-4 line-clamp-3">
        {event.description}
      </p>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-border-light">
      <div className="flex items-center text-dark-text/60 text-sm">
        <Users className="h-4 w-4 mr-2" />
        容量: {event.totalCapacity} 人
      </div>
      <button className="text-secondary hover:text-orange-500 transition-colors font-medium flex items-center group">
        查看詳情
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
))}
```

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({
    path: 'frontend/src/components/Event.tsx',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/components/Event.tsx',
    errorsOnly: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

預期: 無錯誤

**Step 6: 更新單元測試**

修改 `Event.spec.tsx`：

```typescript
const mockTicketingEvents: TicketingEvent[] = [
  {
    id: 1,
    title: 'Cloud Architecture Workshop',
    description: 'Learn cloud patterns',
    slug: 'cloud-workshop',
    status: 'PUBLISHED',
    totalCapacity: 50,
    eventDate: '2026-03-15T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

describe('Event Component', () => {
  it('should display ticketing events', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockTicketingEvents
    });
    
    render(<Event />);
    
    await waitFor(() => {
      expect(screen.getByText('Cloud Architecture Workshop')).toBeInTheDocument();
      expect(screen.getByText(/容量: 50 人/)).toBeInTheDocument();
    });
  });
});
```

**Step 7: 執行單元測試驗證**

```typescript
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/components/Event.spec.tsx'
});
```

預期: 所有測試通過

**Step 8: Commit**

```bash
git add frontend/src/components/Event.tsx frontend/src/components/Event.spec.tsx
git commit -m "refactor(events): simplify Event component for ticketing only

- Remove EventItem, use TicketingEvent from database
- Remove manual event creation form
- Display event date, capacity, description
- Update section title to '我的工作坊與演講'
- Update tests for ticketing events only

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: 建立 Community Events API endpoint

**Files:**
- Create: `frontend/src/app/api/community-events/route.ts`
- Create: `frontend/src/app/api/community-events/route.test.ts`

**Step 1: 寫失敗的測試**

建立 `frontend/src/app/api/community-events/route.test.ts`:

```typescript
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/community-events', () => {
  it('should return empty array initially', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });
});

describe('POST /api/community-events', () => {
  it('should create a new community event', async () => {
    const payload = {
      title: 'DevOps Taiwan Meetup',
      role: 'Speaker',
      date: 'Mar 2026',
      description: 'Sharing cloud patterns',
      tags: ['DevOps'],
      status: 'Upcoming'
    };
    
    const request = new NextRequest('http://localhost:3000/api/community-events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.title).toBe(payload.title);
    expect(data).toHaveProperty('id');
  });
});
```

**Step 2: 執行測試確認失敗**

```typescript
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/app/api/community-events/route.test.ts'
});
```

預期: FAIL (route not defined)

**Step 3: 實作 API route (in-memory storage)**

建立 `frontend/src/app/api/community-events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { EventItem } from '@/types';

// In-memory storage for community events
// TODO: 未來可改為資料庫儲存
let communityEvents: EventItem[] = [];
let nextId = 1;

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(communityEvents, { status: 200 });
  } catch (error) {
    console.error('Error fetching community events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const newEvent: EventItem = {
      id: String(nextId++),
      title: body.title,
      role: body.role,
      description: body.description,
      date: body.date,
      tags: body.tags || [],
      status: body.status || 'Upcoming'
    };
    
    communityEvents.push(newEvent);
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating community event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4: 執行測試確認通過**

```typescript
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/app/api/community-events/route.test.ts'
});
```

預期: PASS

**Step 5: Commit**

```bash
git add frontend/src/app/api/community-events/
git commit -m "feat(api): add community events endpoint

- In-memory storage for community events (EventItem)
- GET returns all events
- POST creates new event
- Unit tests for API routes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: 建立 CommunityEvent 組件

**Files:**
- Create: `frontend/src/components/CommunityEvent.tsx`
- Create: `frontend/src/components/CommunityEvent.spec.tsx`

**Step 1: 建立組件骨架**

建立 `frontend/src/components/CommunityEvent.tsx`：

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, ArrowRight, Plus, X } from 'lucide-react';
import { EventItem } from '@/types';

const CommunityEvent: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    role: '',
    date: '',
    description: ''
  });

  useEffect(() => {
    fetch('/api/community-events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('API did not return an array', data);
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch community events', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventPayload = {
      title: newEvent.title,
      role: newEvent.role,
      description: newEvent.description,
      date: newEvent.date,
      tags: ['Community'],
      status: 'Upcoming'
    };

    try {
      const res = await fetch('/api/community-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });
      if (res.ok) {
        const createdEvent = await res.json() as EventItem;
        setEvents([createdEvent, ...events]);
        setIsFormOpen(false);
        setNewEvent({ title: '', role: '', date: '', description: '' });
      } else {
        console.error('Failed to create event', await res.text());
      }
    } catch (error) {
      console.error('Error creating event', error);
    }
  };

  return (
    <section id="community-event" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
              社群活動參與
            </h2>
            <div className="h-1 w-20 bg-secondary rounded-full mb-4"></div>
            <p className="text-dark-text/70 max-w-2xl">
              受邀參與的社群活動、技術分享與演講。
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> 新增活動
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-dark-text/60">載入中...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-dark-text/60">目前沒有社群活動</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-light-background rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded mb-2 bg-secondary/10 text-secondary">
                      {event.role}
                    </span>
                    <h3 className="text-xl font-bold text-dark-text mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-dark-text/60 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                  </div>
                </div>

                <p className="text-dark-text/70 mb-4 line-clamp-3">
                  {event.description}
                </p>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border-light">
                    {event.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 新增活動 Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-dark-text">新增社群活動</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-dark-text/50 hover:text-dark-text"
                  aria-label="Cancel"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-dark-text mb-1">
                    活動名稱
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-dark-text mb-1">
                    參與角色
                  </label>
                  <input
                    id="role"
                    type="text"
                    required
                    placeholder="例如: Speaker, Instructor"
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newEvent.role}
                    onChange={e => setNewEvent({...newEvent, role: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-dark-text mb-1">
                    日期
                  </label>
                  <input
                    id="date"
                    type="text"
                    required
                    placeholder="例如: 2026年3月"
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-1">
                    描述
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  儲存活動
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityEvent;
```

**Step 2: 建立單元測試**

建立 `frontend/src/components/CommunityEvent.spec.tsx`：

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommunityEvent from './CommunityEvent';
import { EventItem } from '@/types';

const mockCommunityEvents: EventItem[] = [
  {
    id: '1',
    title: 'DevOps Taiwan Meetup',
    role: 'Speaker',
    description: 'Sharing cloud architecture patterns',
    date: '2026年3月',
    tags: ['DevOps', 'Cloud'],
    status: 'Upcoming'
  }
];

describe('CommunityEvent Component', () => {
  it('should display community events', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCommunityEvents
    } as Response);

    render(<CommunityEvent />);

    await waitFor(() => {
      expect(screen.getByText('DevOps Taiwan Meetup')).toBeInTheDocument();
      expect(screen.getByText('Speaker')).toBeInTheDocument();
    });
  });

  it('should show empty state when no events', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response);

    render(<CommunityEvent />);

    await waitFor(() => {
      expect(screen.getByText('目前沒有社群活動')).toBeInTheDocument();
    });
  });
});
```

**Step 3: 執行測試驗證**

```typescript
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/components/CommunityEvent.spec.tsx'
});
```

預期: 所有測試通過

**Step 4: Commit**

```bash
git add frontend/src/components/CommunityEvent.tsx frontend/src/components/CommunityEvent.spec.tsx
git commit -m "feat(events): add CommunityEvent component

- Display community events from /api/community-events
- Show role badge, date, tags
- Manual event creation form
- Unit tests for component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: 在首頁整合兩個組件

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: 讀取當前首頁檔案**

```typescript
mcp__jetbrains__get_file_text_by_path({
    pathInProject: 'frontend/src/app/page.tsx',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 匯入 CommunityEvent 組件**

在 imports 區塊新增：

```typescript
import CommunityEvent from '@/components/CommunityEvent';
```

**Step 3: 在 Event 組件後新增 CommunityEvent**

找到 `<Event />` 組件的位置，在其後新增：

```tsx
<Event />
<CommunityEvent />
```

**Step 4: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({
    path: 'frontend/src/app/page.tsx',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/app/page.tsx',
    errorsOnly: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

預期: 無錯誤

**Step 5: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(homepage): integrate both Event and CommunityEvent components

- Display ticketing events (主辦)
- Display community events (受邀參與)
- Separate sections for clarity

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: 驗證 BDD 測試通過

**Files:**
- Test: `e2e/specs/event-ticketing.feature` (Scenario: Browse upcoming events)

**Step 1: 執行 BDD 測試**

在 Event.tsx 中新增型別定義：

```typescript
import { EventItem } from '@/types';

// 售票活動型別（對應 database events table）
interface TicketingEvent {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalCapacity: number;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// 統一的活動型別（用於 UI 顯示）
type UnifiedEvent = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  type: 'ticketing' | 'community';
  // Ticketing-specific
  capacity?: number;
  slug?: string;
  // Community-specific
  role?: string;
  tags?: string[];
};
```

**Step 2: 更新組件 state 與資料獲取邏輯**

```typescript
const [events, setEvents] = useState<UnifiedEvent[]>([]);
const [loading, setLoading] = useState(true);
const [isFormOpen, setIsFormOpen] = useState(false);

useEffect(() => {
  Promise.all([
    fetch('/api/events').then(res => res.json()),
    fetch('/api/community-events').then(res => res.json())
  ])
    .then(([ticketingEvents, communityEvents]) => {
      // 轉換售票活動
      const unified Ticketing: UnifiedEvent[] = (ticketingEvents as TicketingEvent[]).map(e => ({
        id: `t-${e.id}`,
        title: e.title,
        description: e.description || '',
        date: e.eventDate,
        type: 'ticketing' as const,
        capacity: e.totalCapacity,
        slug: e.slug
      }));
      
      // 轉換社群活動
      const unifiedCommunity: UnifiedEvent[] = (communityEvents as EventItem[]).map(e => ({
        id: `c-${e.id}`,
        title: e.title,
        description: e.description,
        date: e.date,
        type: 'community' as const,
        role: e.role,
        tags: e.tags
      }));
      
      // 合併並依日期排序
      const all = [...unifiedTicketing, ...unifiedCommunity].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setEvents(all);
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to fetch events', error);
      setLoading(false);
    });
}, []);
```

**Step 3: 更新 handleSubmit 以呼叫新 API**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const eventPayload = {
    title: newEvent.title,
    role: newEvent.role,
    description: newEvent.description,
    date: newEvent.date,
    tags: ['New'],
    status: 'Upcoming'
  };

  try {
    const res = await fetch('/api/community-events', {  // 改為 community-events
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });
    if (res.ok) {
      const createdEvent = await res.json() as EventItem;
      // 重新獲取所有活動
      const [ticketing, community] = await Promise.all([
        fetch('/api/events').then(r => r.json()),
        fetch('/api/community-events').then(r => r.json())
      ]);
      // ... (同 useEffect 的轉換邏輯)
      setIsFormOpen(false);
      setNewEvent({ title: '', role: '', date: '', description: '' });
    }
  } catch (error) {
    console.error('Error creating event', error);
  }
};
```

**Step 4: 更新 UI 卡片以顯示不同類型**

```tsx
{events.map((event) => (
  <div
    key={event.id}
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        {/* 活動類型標籤 */}
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
          event.type === 'ticketing' 
            ? 'bg-primary/10 text-primary' 
            : 'bg-secondary/10 text-secondary'
        }`}>
          {event.type === 'ticketing' ? '主辦活動' : '受邀參與'}
        </span>
        
        <h3 className="text-xl font-bold text-dark-text mb-2">
          {event.title}
        </h3>
        
        {event.date && (
          <div className="flex items-center text-dark-text/60 text-sm mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            {event.type === 'ticketing' && event.date.includes('T')
              ? new Date(event.date).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : event.date
            }
          </div>
        )}
      </div>
    </div>

    <p className="text-dark-text/70 mb-4 line-clamp-3">
      {event.description}
    </p>

    <div className="flex items-center justify-between pt-4 border-t border-border-light">
      {event.type === 'ticketing' ? (
        <div className="flex items-center text-dark-text/60 text-sm">
          <Users className="h-4 w-4 mr-2" />
          容量: {event.capacity} 人
        </div>
      ) : (
        <div className="flex items-center text-dark-text/60 text-sm">
          角色: {event.role}
        </div>
      )}
      
      <button className="text-secondary hover:text-orange-500 transition-colors font-medium flex items-center group">
        {event.type === 'ticketing' ? '查看詳情' : '了解更多'}
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
))}
```

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({
    path: 'frontend/src/components/Event.tsx',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/components/Event.tsx',
    errorsOnly: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

預期: 無錯誤

**Step 6: 更新單元測試**

修改 `Event.spec.tsx` 以 mock 兩個 API 並測試合併邏輯。

**Step 7: 執行測試驗證**

```typescript
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/components/Event.spec.tsx'
});
```

預期: 所有測試通過

**Step 8: Commit**

```bash
git add frontend/src/components/Event.tsx frontend/src/components/Event.spec.tsx
git commit -m "feat(events): integrate ticketing and community events

- Fetch from both /api/events and /api/community-events
- Merge and sort by date
- Display type badge (主辦 vs 受邀)
- Show capacity for ticketing, role for community events
- Update tests to verify both event types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**Step 2: 執行測試確認通過**

```typescript
mcp__jetbrains__execute_run_configuration({
    configurationName: 'Cucumer All Tests',
    timeout: 300000,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

預期: "Browse upcoming events" scenario 通過（售票活動顯示在 Event 組件）

**Step 3: 手動測試兩個組件**

訪問 http://localhost:3000 並確認：
1. Event 組件顯示售票活動（容量、日期、描述）
2. CommunityEvent 組件顯示社群活動（角色、標籤）
3. 可以手動新增社群活動
4. 兩個組件視覺上獨立但風格一致

**Step 4: 執行所有測試套件驗證無 regression**

```typescript
mcp__wallaby__wallaby_failingTests(); // 單元測試

mcp__jetbrains__execute_run_configuration({
    configurationName: 'Playwright All Tests',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
}); // E2E 測試
```

預期: 所有測試通過

---

---

## 驗證清單

完成後，確認以下項目：

- ✅ Event 組件僅顯示售票活動（來自 `/api/events`）
- ✅ Event 組件標題改為「我的工作坊與演講」
- ✅ Event 組件顯示容量、日期、描述
- ✅ Event 組件移除手動新增功能
- ✅ `/api/community-events` API endpoint 正常運作（GET/POST）
- ✅ CommunityEvent 組件顯示社群活動（來自 `/api/community-events`）
- ✅ CommunityEvent 組件標題為「社群活動參與」
- ✅ CommunityEvent 組件顯示角色、日期、標籤
- ✅ CommunityEvent 組件保留手動新增功能
- ✅ 首頁同時引入兩個獨立組件
- ✅ 單元測試通過（Event + CommunityEvent + API routes）
- ✅ BDD 測試 "Browse upcoming events" 通過
- ✅ 所有 E2E 測試通過
- ✅ 無 TypeScript 編譯錯誤

## 後續工作 (不在此計畫範圍)

- 將社群活動從 in-memory storage 遷移至資料庫（新 table: community_events）
- 實作售票活動詳情頁面（點擊「查看詳情」按鈕）
- 顯示票種資訊和可用數量
- 整合預約流程
- 新增活動篩選功能（類型、日期、狀態）
- 社群活動的編輯/刪除功能
- 後台管理介面（分別管理售票活動和社群活動）

---

## 估計時間

- Task 1: 15 分鐘（簡化 Event 組件為售票活動專用）
- Task 2: 15 分鐘（建立 community events API + 測試）
- Task 3: 20 分鐘（建立 CommunityEvent 組件 + 測試）
- Task 4: 5 分鐘（首頁整合兩個組件）
- Task 5: 10 分鐘（驗證 BDD 測試和整合測試）

**總計**: ~65 分鐘
