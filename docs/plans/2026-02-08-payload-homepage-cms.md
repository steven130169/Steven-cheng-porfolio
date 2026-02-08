# Payload CMS 首頁內容管理系統實施計劃

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 使用 Payload CMS 管理首頁內容，讓所有內容可通過 Admin UI 編輯，無需修改程式碼

**Architecture:**

- 創建 Payload Collections 對應首頁各區塊（Hero, About, Skills）
- 使用 Payload 的 Singleton 模式管理單頁內容
- 保持現有 UI/UX 不變，僅將硬編碼內容遷移至 CMS
- 使用 Server Components 直接從 Payload 獲取數據（Next.js 15+ 模式）

**Tech Stack:**

- Payload CMS 3.74.0 (Collections + Globals)
- Next.js 16.1.5 Server Components
- Lexical Editor 用於富文本內容
- TypeScript 強型別

**Migration Scope:**

- ✅ Hero 區塊（標題、副標題、圖片輪播、CTA、社交連結）
- ✅ About 區塊（關於我、技能卡片、程式碼展示）
- ⏳ Blog, Event, Speak 區塊（後續階段）

---

## Task 1: 創建 Homepage Global (Singleton)

**Files:**

- Create: `frontend/src/globals/Homepage.ts`
- Create: `frontend/src/globals/index.ts`

**Step 1: 創建 Hero 區塊的 Global 定義**

```typescript
// frontend/src/globals/Homepage.ts
import type {GlobalConfig} from 'payload'

export const Homepage: GlobalConfig = {
    slug: 'homepage',
    label: '首頁內容',
    access: {
        read: () => true, // Public read
        update: () => true, // TODO: 之後加上 admin 權限
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Hero 區塊',
                    fields: [
                        {
                            name: 'hero',
                            type: 'group',
                            fields: [
                                {
                                    name: 'eventBadge',
                                    type: 'group',
                                    label: '活動標籤',
                                    fields: [
                                        {
                                            name: 'text',
                                            type: 'text',
                                            label: '標籤文字',
                                            defaultValue: 'Next Event: K8s Workshop (Oct 20)',
                                            required: true,
                                        },
                                        {
                                            name: 'link',
                                            type: 'text',
                                            label: '連結',
                                            defaultValue: '#event',
                                            required: true,
                                        },
                                        {
                                            name: 'enabled',
                                            type: 'checkbox',
                                            label: '顯示標籤',
                                            defaultValue: true,
                                        },
                                    ],
                                },
                                {
                                    name: 'mainHeading',
                                    type: 'text',
                                    label: '主標題（第一行）',
                                    defaultValue: 'Architecting',
                                    required: true,
                                },
                                {
                                    name: 'highlightedText',
                                    type: 'text',
                                    label: '強調文字（第二行）',
                                    defaultValue: 'High Availability',
                                    required: true,
                                },
                                {
                                    name: 'trailingText',
                                    type: 'text',
                                    label: '結尾文字（第二行）',
                                    defaultValue: 'Cloud Systems.',
                                    required: true,
                                },
                                {
                                    name: 'description',
                                    type: 'textarea',
                                    label: '介紹文字',
                                    defaultValue: "I'm Steven (鄭棋文), a Senior Cloud Architect. I specialize in designing resilient cloud infrastructures, optimizing DevOps workflows, and mastering CI/CD pipelines to deliver speed and stability.",
                                    required: true,
                                },
                                {
                                    name: 'ctaButtons',
                                    type: 'array',
                                    label: 'CTA 按鈕',
                                    minRows: 1,
                                    maxRows: 3,
                                    fields: [
                                        {
                                            name: 'text',
                                            type: 'text',
                                            label: '按鈕文字',
                                            required: true,
                                        },
                                        {
                                            name: 'link',
                                            type: 'text',
                                            label: '連結',
                                            required: true,
                                        },
                                        {
                                            name: 'variant',
                                            type: 'select',
                                            label: '樣式',
                                            options: [
                                                {label: '主要按鈕', value: 'primary'},
                                                {label: '次要按鈕', value: 'secondary'},
                                            ],
                                            defaultValue: 'primary',
                                            required: true,
                                        },
                                    ],
                                    defaultValue: [
                                        {text: 'View My Blog', link: '#blog', variant: 'primary'},
                                        {text: 'Contact Me', link: '#contact', variant: 'secondary'},
                                    ],
                                },
                                {
                                    name: 'socialLinks',
                                    type: 'array',
                                    label: '社交媒體連結',
                                    minRows: 1,
                                    maxRows: 6,
                                    fields: [
                                        {
                                            name: 'platform',
                                            type: 'select',
                                            label: '平台',
                                            options: [
                                                {label: 'GitHub', value: 'github'},
                                                {label: 'Threads', value: 'threads'},
                                                {label: 'LinkedIn', value: 'linkedin'},
                                                {label: 'Twitter', value: 'twitter'},
                                            ],
                                            required: true,
                                        },
                                        {
                                            name: 'url',
                                            type: 'text',
                                            label: 'URL',
                                            required: true,
                                        },
                                    ],
                                    defaultValue: [
                                        {platform: 'github', url: 'https://github.chiwencheng.com'},
                                        {platform: 'threads', url: 'https://thread.chiwencheng.com'},
                                    ],
                                },
                                {
                                    name: 'carouselImages',
                                    type: 'array',
                                    label: '輪播圖片',
                                    minRows: 1,
                                    maxRows: 10,
                                    fields: [
                                        {
                                            name: 'src',
                                            type: 'text',
                                            label: '圖片路徑',
                                            required: true,
                                        },
                                        {
                                            name: 'alt',
                                            type: 'text',
                                            label: '圖片描述（Alt Text）',
                                            required: true,
                                        },
                                    ],
                                    defaultValue: [
                                        {src: '/images/ddd.webp', alt: 'Steven Cheng presenting at conference 1'},
                                        {
                                            src: '/images/2023DevOpsDays-1.webp',
                                            alt: 'Steven Cheng presenting at conference 2'
                                        },
                                        {
                                            src: '/images/2023DevOpsDays-2.webp',
                                            alt: 'Steven Cheng presenting at conference 3'
                                        },
                                    ],
                                },
                                {
                                    name: 'uptimeBadge',
                                    type: 'group',
                                    label: 'Uptime 標籤',
                                    fields: [
                                        {
                                            name: 'enabled',
                                            type: 'checkbox',
                                            label: '顯示 Uptime 標籤',
                                            defaultValue: true,
                                        },
                                        {
                                            name: 'percentage',
                                            type: 'text',
                                            label: 'Uptime 百分比',
                                            defaultValue: '99.99%',
                                            required: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'About 區塊',
                    fields: [
                        {
                            name: 'about',
                            type: 'group',
                            fields: [
                                {
                                    name: 'sectionTitle',
                                    type: 'text',
                                    label: '區塊標題',
                                    defaultValue: 'About Me',
                                    required: true,
                                },
                                {
                                    name: 'introduction',
                                    type: 'textarea',
                                    label: '簡介文字',
                                    defaultValue: 'I architect scalable, secure, and cost-effective cloud solutions. My obsession is automating the boring stuff so teams can focus on innovation.',
                                    required: true,
                                },
                                {
                                    name: 'skills',
                                    type: 'array',
                                    label: '技能卡片',
                                    minRows: 1,
                                    maxRows: 8,
                                    fields: [
                                        {
                                            name: 'name',
                                            type: 'text',
                                            label: '技能名稱',
                                            required: true,
                                        },
                                        {
                                            name: 'icon',
                                            type: 'select',
                                            label: '圖示',
                                            options: [
                                                {label: 'Cloud', value: 'cloud'},
                                                {label: 'Terminal', value: 'terminal'},
                                                {label: 'GitBranch', value: 'gitbranch'},
                                                {label: 'Shield', value: 'shield'},
                                                {label: 'Server', value: 'server'},
                                                {label: 'Database', value: 'database'},
                                            ],
                                            required: true,
                                        },
                                        {
                                            name: 'items',
                                            type: 'array',
                                            label: '技術項目',
                                            minRows: 1,
                                            fields: [
                                                {
                                                    name: 'item',
                                                    type: 'text',
                                                    label: '項目名稱',
                                                    required: true,
                                                },
                                            ],
                                        },
                                    ],
                                    defaultValue: [
                                        {
                                            name: 'Cloud Architecture',
                                            icon: 'cloud',
                                            items: [
                                                {item: 'AWS'},
                                                {item: 'Azure'},
                                                {item: 'GCP'},
                                                {item: 'Hybrid Cloud'},
                                                {item: 'Serverless'},
                                            ],
                                        },
                                        {
                                            name: 'DevOps & IaC',
                                            icon: 'terminal',
                                            items: [
                                                {item: 'Terraform'},
                                                {item: 'Ansible'},
                                                {item: 'Kubernetes'},
                                                {item: 'Docker'},
                                                {item: 'Helm'},
                                            ],
                                        },
                                        {
                                            name: 'CI / CD',
                                            icon: 'gitbranch',
                                            items: [
                                                {item: 'Jenkins'},
                                                {item: 'GitLab CI'},
                                                {item: 'GitHub Actions'},
                                                {item: 'ArgoCD'},
                                                {item: 'CircleCI'},
                                            ],
                                        },
                                        {
                                            name: 'Security & Ops',
                                            icon: 'shield',
                                            items: [
                                                {item: 'IAM Policies'},
                                                {item: 'Prometheus'},
                                                {item: 'Grafana'},
                                                {item: 'ELK Stack'},
                                                {item: 'DevSecOps'},
                                            ],
                                        },
                                    ],
                                },
                                {
                                    name: 'whyWorkWithMe',
                                    type: 'group',
                                    label: 'Why work with me 區塊',
                                    fields: [
                                        {
                                            name: 'title',
                                            type: 'text',
                                            label: '標題',
                                            defaultValue: 'Why work with me?',
                                            required: true,
                                        },
                                        {
                                            name: 'paragraph1',
                                            type: 'richText',
                                            label: '第一段內容',
                                            required: true,
                                        },
                                        {
                                            name: 'paragraph2',
                                            type: 'richText',
                                            label: '第二段內容',
                                            required: true,
                                        },
                                        {
                                            name: 'showCodeBlock',
                                            type: 'checkbox',
                                            label: '顯示程式碼區塊',
                                            defaultValue: true,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}
```

**Step 2: 創建 globals index**

```typescript
// frontend/src/globals/index.ts
export {Homepage} from './Homepage'
```

**Step 3: 驗證檔案建立成功**

Run: `mcp__jetbrains__list_directory_tree({directoryPath: 'frontend/src/globals', maxDepth: 1, projectPath: '...'})`

Expected: 應顯示 Homepage.ts 和 index.ts

**Step 4: Commit**

```bash
git add frontend/src/globals/
git commit -m "feat(payload): add homepage global for cms content management"
```

---

## Task 2: 註冊 Homepage Global 到 Payload Config

**Files:**

- Modify: `frontend/payload.config.ts`

**Step 1: 匯入並註冊 Homepage global**

```typescript
// frontend/payload.config.ts
import sharp from 'sharp'
import {lexicalEditor} from '@payloadcms/richtext-lexical'
import {postgresAdapter} from '@payloadcms/db-postgres'
import {buildConfig} from 'payload'
import {Homepage} from '@/globals'

export default buildConfig({
    editor: lexicalEditor(),
    collections: [], // 暫時保持為空，不影響現有 API
    globals: [Homepage],
    secret: process.env.PAYLOAD_SECRET || '',
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL!,
        }
    }),
    sharp,
})
```

**Step 2: 檢查設定檔問題**

Run:`mcp__jetbrains__get_file_problems({filePath: 'frontend/payload.config.ts', errorsOnly: false, projectPath: '...'})`

Expected: 無錯誤

**Step 3: 格式化檔案**

Run: `mcp__jetbrains__reformat_file({path: 'frontend/payload.config.ts', projectPath: '...'})`

**Step 4: Build 專案驗證型別**

Run: `mcp__jetbrains__build_project({projectPath: '...'})`

Expected: Build 成功

**Step 5: Commit**

```bash
git add frontend/payload.config.ts
git commit -m "feat(payload): register homepage global in config"
```

---

## Task 3: 啟動 Payload 並初始化首頁內容

**Files:**

- None (manual verification)

**Step 1: 啟動開發伺服器**

Run:
`mcp__jetbrains__execute_terminal_command({command: 'npm run dev -w frontend', projectPath: '...', reuseExistingTerminalWindow: true})`

Expected: 伺服器在 http://localhost:3000 啟動

**Step 2: 手動驗證 Payload Admin UI**

請用戶執行以下操作：

1. 開啟 http://localhost:3000/admin
2. 檢查左側選單是否出現「首頁內容」(Homepage) 項目
3. 點擊進入，確認所有欄位（Hero、About）都正確顯示
4. 驗證預設值是否已正確填入
5. 點擊「Save」儲存初始內容

**Step 3: 確認 API 端點可用**

Run:

```bash
curl http://localhost:3000/api/globals/homepage
```

Expected: 返回 JSON 格式的首頁內容數據

---

## Task 4: 創建首頁數據獲取函數

**Files:**

- Create: `frontend/src/lib/getHomepageData.ts`

**Step 1: 創建 Server-side 數據獲取函數**

```typescript
// frontend/src/lib/getHomepageData.ts
import {getPayload} from 'payload'
import config from '@payload-config'
import type {Homepage as HomepageType} from '@/payload-types'

/**
 * 從 Payload CMS 獲取首頁內容
 * 此函數僅在 Server Components 中使用
 */
export async function getHomepageData(): Promise<HomepageType> {
    const payload = await getPayload({config})

    const homepage = await payload.findGlobal({
        slug: 'homepage',
    })

    return homepage
}

/**
 * 類型輔助：提取 Hero 資料
 */
export type HeroData = NonNullable<HomepageType['hero']>

/**
 * 類型輔助：提取 About 資料
 */
export type AboutData = NonNullable<HomepageType['about']>
```

**Step 2: 檢查檔案問題**

Run:
`mcp__jetbrains__get_file_problems({filePath: 'frontend/src/lib/getHomepageData.ts', errorsOnly: false, projectPath: '...'})`

Expected: 無型別錯誤（可能有 payload-types 尚未生成的警告，Task 5 處理）

**Step 3: Commit**

```bash
git add frontend/src/lib/getHomepageData.ts
git commit -m "feat(payload): add homepage data fetching utilities"
```

---

## Task 5: 生成 Payload TypeScript 型別

**Files:**

- Generate: `frontend/src/payload-types.ts` (auto-generated)

**Step 1: 執行 Payload 型別生成**

Run:
`mcp__jetbrains__execute_terminal_command({command: 'npm run payload generate:types -w frontend', projectPath: '...'})`

Expected: 生成 `frontend/src/payload-types.ts` 檔案

**Step 2: 驗證型別檔案**

Run:
`mcp__jetbrains__get_file_text_by_path({pathInProject: 'frontend/src/payload-types.ts', maxLinesCount: 50, projectPath: '...'})`

Expected: 應包含 `export interface Homepage` 定義

**Step 3: 重新檢查型別錯誤**

Run:
`mcp__jetbrains__get_file_problems({filePath: 'frontend/src/lib/getHomepageData.ts', errorsOnly: true, projectPath: '...'})`

Expected: 無型別錯誤

**Step 4: Commit**

```bash
git add frontend/src/payload-types.ts
git commit -m "chore(payload): generate typescript types for homepage global"
```

---

## Task 6: 重構 Hero 組件使用 Payload 數據

**Files:**

- Modify: `frontend/src/components/Hero.tsx`

**Step 1: 將 Hero 改為 Server Component 並使用 Payload 數據**

```typescript
// frontend/src/components/Hero.tsx
import React from 'react'
import {HeroClient} from './HeroClient'
import {getHomepageData} from '@/lib/getHomepageData'

const Hero: React.FC = async () => {
    const homepageData = await getHomepageData()
    const hero = homepageData.hero

    if (!hero) {
        return null
    }

    return <HeroClient data = {hero}
    />
}

export default Hero
```

**Step 2: 創建 HeroClient 組件（保留原有交互邏輯）**

Create: `frontend/src/components/HeroClient.tsx`

```typescript
// frontend/src/components/HeroClient.tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import React, {useState, useEffect} from 'react'
import {SiGithub, SiThreads} from '@icons-pack/react-simple-icons'
import {ArrowRight, Cloud} from 'lucide-react'
import type {HeroData} from '@/lib/getHomepageData'

interface HeroClientProps {
    data: HeroData
}

export const HeroClient: React.FC<HeroClientProps> = ({data}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const images = data.carouselImages || []

    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }

    useEffect(() => {
        if (images.length === 0) return

        const timer = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                goToNextImage()
                setIsAnimating(false)
            }, 1500)
        }, 5000)

        return () => clearInterval(timer)
    }, [images.length])

    const socialIcons = {
        github: SiGithub,
        threads: SiThreads,
        linkedin: SiGithub, // TODO: 加入 LinkedIn icon
        twitter: SiGithub, // TODO: 加入 Twitter icon
    }

    return (
        <section className = "min-h-screen flex items-center pt-32 pb-20" >
        <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" >
        <div className = "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" >
        <div className = "space-y-8 text-center lg:text-left" >
            {
                data
                .eventBadge?.enabled && (
                    <a
                        href = {data.eventBadge.link}
                className = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer group"
                >
                <span className = "relative flex h-2 w-2" >
                <span className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" > </span>
                    < span
                className = "relative inline-flex rounded-full h-2 w-2 bg-secondary" > </span>
                    < /span>
                    < span
                className = "text-sm text-primary font-medium" >
                    {data.eventBadge.text}
                    < /span>
                    < ArrowRight
                className = "h-3.5 w-3.5 text-primary/80 group-hover:translate-x-1 transition-transform" / >
                    </a>
    )
}

    <h1 className = "text-5xl md:text-7xl font-bold text-dark-text tracking-tight leading-tight" >
    {data.mainHeading} < br / >
    <span className = "text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary" >
        {data.highlightedText}
        < /span>{' '}
    {
        data.trailingText
    }
    </h1>

    < p
    className = "text-lg text-dark-text/70 max-w-xl leading-relaxed mx-auto lg:mx-0" >
        {data.description}
        < /p>

        < div
    className = "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" >
        {
            data.ctaButtons?.map((button, index) => (
                <a
                    key = {index}
            href = {button.link}
            className = {
                    button.variant === 'primary'
                        ? 'inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-orange-700 transition-all shadow-lg hover:shadow-primary/40'
                        : 'inline-flex items-center justify-center px-8 py-3 border border-border-light text-base font-medium rounded-lg text-dark-text hover:bg-black/5 transition-all'
                }
                >
                {button.text}
    {
        button.variant === 'primary' && <ArrowRight className = "ml-2 h-4 w-4" / >
    }
    </a>
))
}
    </div>

    < div
    className = "flex items-center gap-6 pt-4 justify-center lg:justify-start" >
        {
            data.socialLinks?.map((social, index) => {
                const Icon = socialIcons[social.platform as keyof typeof socialIcons] || SiGithub
                return (
                    <a
                        key = {index}
                href = {social.url}
                target = "_blank"
                rel = "noopener noreferrer"
                className = "text-dark-text/50 hover:text-primary transition-colors"
                >
                <Icon className = "h-6 w-6" / >
                    </a>
            )
            })
        }
        < /div>
        < /div>

    {
        images.length > 0 && (
            <div className = "relative hidden lg:block" >
            <div className = "relative z-10 w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white" >
                {
                    images.map((image, index) => (
                        <img
                            key = {image.src}
                    src = {image.src}
                    alt = {image.alt}
                    className = {`absolute inset-0 w-full h-full object-cover ${
                        index === currentImageIndex && isAnimating ? 'animate-ink-splash' : ''
                    } ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`
                }
        />
    ))
    }
        </div>
        {
            data.uptimeBadge?.enabled && (
                <div className = "absolute -bottom-6 -right-6 z-20 bg-card border border-border-light p-4 rounded-xl shadow-lg flex items-center gap-4" >
                <div className = "bg-primary/10 p-2 rounded-full text-primary" >
                <Cloud className = "h-6 w-6" / >
                </div>
                < div >
                <p className = "text-xs text-dark-text/60" > Uptime < /p>
                    < p
            className = "text-lg font-bold text-dark-text" > {data.uptimeBadge.percentage} < /p>
                < /div>
                < /div>
        )
        }
        </div>
    )
    }
    </div>
    < /div>
    < /section>
)
}
```

**Step 3: 檢查檔案問題**

Run:

```typescript
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/components/Hero.tsx',
    errorsOnly: false,
    projectPath: '...'
});
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/components/HeroClient.tsx',
    errorsOnly: false,
    projectPath: '...'
});
```

Expected: 無錯誤

**Step 4: 格式化檔案**

Run:

```typescript
mcp__jetbrains__reformat_file({path: 'frontend/src/components/Hero.tsx', projectPath: '...'});
mcp__jetbrains__reformat_file({path: 'frontend/src/components/HeroClient.tsx', projectPath: '...'});
```

**Step 5: 執行 Playwright 測試驗證 UI**

Run: `mcp__jetbrains__execute_run_configuration({configurationName: 'Playwright All Tests', projectPath: '...'})`

Expected: 所有測試通過（特別是首頁相關的冒煙測試）

**Step 6: Commit**

```bash
git add frontend/src/components/Hero.tsx frontend/src/components/HeroClient.tsx
git commit -m "refactor(hero): migrate to payload cms data source"
```

---

## Task 7: 重構 About 組件使用 Payload 數據

**Files:**

- Modify: `frontend/src/components/About.tsx`

**Step 1: 將 About 改為使用 Payload 數據**

```typescript
// frontend/src/components/About.tsx
import React from 'react'
import {Cloud, GitBranch, Terminal, Shield, Server, Database} from 'lucide-react'
import {getHomepageData} from '@/lib/getHomepageData'
import {serializeLexical} from '@/lib/serializeLexical'

const iconMap = {
    cloud: Cloud,
    terminal: Terminal,
    gitbranch: GitBranch,
    shield: Shield,
    server: Server,
    database: Database,
}

const About: React.FC = async () => {
    const homepageData = await getHomepageData()
    const about = homepageData.about

    if (!about) {
        return null
    }

    return (
        <section id = "about"
    className = "py-24 bg-light-background" >
    <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
    <div className = "text-center mb-16" >
    <h2 className = "text-3xl md:text-4xl font-bold text-dark-text mb-4" >
        {about.sectionTitle}
        < /h2>
        < div
    className = "h-1 w-20 bg-primary mx-auto rounded-full" > </div>
        < p
    className = "mt-4 text-dark-text/70 max-w-2xl mx-auto" >
        {about.introduction}
        < /p>
        < /div>

        < div
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" >
        {
            about.skills?.map((skill) => {
                const Icon = iconMap[skill.icon as keyof typeof iconMap] || Cloud
                return (
                    <div
                        key = {skill.name}
                className = "bg-card p-6 rounded-2xl border border-border-light shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                <div className = "w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6" >
                <Icon className = "h-6 w-6 text-primary" / >
                    </div>
                    < h3
                className = "text-xl font-semibold text-dark-text mb-4" > {skill.name} < /h3>
                    < ul
                className = "space-y-2" >
                    {
                        skill.items?.map((techItem) => (
                            <li
                                key = {techItem.item}
                        className = "flex items-center text-dark-text/70 text-sm"
                        >
                        <span className = "w-1.5 h-1.5 bg-primary rounded-full mr-2" > </span>
                {
                    techItem.item
                }
                </li>
            ))
            }
                </ul>
                < /div>
            )
            })
        }
        < /div>

    {
        about.whyWorkWithMe && (
            <div className = "mt-20 bg-white rounded-3xl p-8 md:p-12 border border-border-light relative overflow-hidden shadow-md" >
            <div className = "relative z-10 grid md:grid-cols-2 gap-12 items-center" >
            <div>
                <h3 className = "text-2xl font-bold text-dark-text mb-4" >
                {about.whyWorkWithMe.title}
                < /h3>
                < div
        className = "text-dark-text/70 mb-6 leading-relaxed" >
            {serializeLexical(about.whyWorkWithMe.paragraph1
    )
    }
        </div>
        < div
        className = "text-dark-text/70 leading-relaxed" >
            {serializeLexical(about.whyWorkWithMe.paragraph2
    )
    }
        </div>
        < /div>
        {
            about.whyWorkWithMe.showCodeBlock && (
                <div className = "bg-light-background p-6 rounded-xl border border-border-light" >
                <code className = "text-sm font-mono text-dark-text/70" >
                <span className = "text-purple-600" > resource < /span>{' '}
                    < span
            className = "text-green-600" > & quot;
            cloud_architect & quot;
            </span>{' '}
            < span
            className = "text-orange-500" > & quot;
            steven & quot;
            </span>{' '}
            < span
            className = "text-orange-500" > {'{'} < /span>
                < br / >
                & nbsp;
        &
            nbsp;
            name & nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
            = {' '}
                < span
            className = "text-green-600" > & quot;
            Steven
            Cheng & quot;
            </span>
            < br / >
            & nbsp;
        &
            nbsp;
            specialty & nbsp;
        &
            nbsp;
            = {' '}
                < span
            className = "text-green-600" > & quot;
            High
            Availability & quot;
            </span>
            < br / >
            & nbsp;
        &
            nbsp;
            tools & nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
            = [
                <span className = "text-green-600" > & quot;
            Terraform & quot;
            </span>,{' '}
            < span
            className = "text-green-600" > & quot;
            K8s & quot;
            </span>]<br / >
            <br / >
            & nbsp;
        &
            nbsp;
            <span className = "text-purple-600" > provisioner < /span>{' '}
                < span
            className = "text-green-600" > & quot;
            local - exec & quot;
            </span>{' '}
            < span
            className = "text-orange-500" > {'{'} < /span>
                < br / >
                & nbsp;
        &
            nbsp;
        &
            nbsp;
        &
            nbsp;
            command = {' '}
                < span
            className = "text-green-600" > & quot;
            optimize_pipelines.sh & quot;
            </span>
            < br / >
            & nbsp;
        &
            nbsp;
            <span className = "text-orange-500" > {'}'} < /span>
            < br / >
            <span className = "text-orange-500" > {'}'} < /span>
                < /code>
                < /div>
        )
        }
        </div>
        < /div>
    )
    }
    </div>
    < /section>
)
}

export default About
```

**Step 2: 創建 Lexical 序列化工具**

Create: `frontend/src/lib/serializeLexical.tsx`

```typescript
// frontend/src/lib/serializeLexical.tsx
import React from 'react'

/**
 * 簡化版 Lexical 內容序列化
 * 將 Lexical Rich Text 轉換為 React 元素
 *
 * TODO: 根據實際需求擴展支援更多 Lexical 節點類型
 */
export function serializeLexical(content: any): React.ReactNode {
    if (!content) return null

    // 如果是字串，直接返回
    if (typeof content === 'string') {
        return <p>{content} < /p>
    }

    // 處理 Lexical JSON 結構（待實作）
    // 暫時返回純文字版本
    return <p>Rich
    text
    content(TODO
:
    implement
    Lexical
    serialization
)
    </p>
}
```

**Step 3: 檢查檔案問題**

Run:

```typescript
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/components/About.tsx',
    errorsOnly: false,
    projectPath: '...'
});
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/lib/serializeLexical.tsx',
    errorsOnly: false,
    projectPath: '...'
});
```

Expected: 無錯誤

**Step 4: 格式化檔案**

Run:

```typescript
mcp__jetbrains__reformat_file({path: 'frontend/src/components/About.tsx', projectPath: '...'});
mcp__jetbrains__reformat_file({path: 'frontend/src/lib/serializeLexical.tsx', projectPath: '...'});
```

**Step 5: 執行 Playwright 測試驗證 UI**

Run: `mcp__jetbrains__execute_run_configuration({configurationName: 'Playwright All Tests', projectPath: '...'})`

Expected: 所有測試通過（特別是 About 區塊的顯示）

**Step 6: Commit**

```bash
git add frontend/src/components/About.tsx frontend/src/lib/serializeLexical.tsx
git commit -m "refactor(about): migrate to payload cms data source"
```

---

## Task 8: E2E 測試驗證首頁完整性

**Files:**

- None (automated E2E testing)

**Step 1: 確保開發伺服器運行**

Run:
`mcp__jetbrains__execute_terminal_command({command: 'npm run dev -w frontend', projectPath: '...', reuseExistingTerminalWindow: true})`

Expected: 伺服器在 http://localhost:3000 啟動

**Step 2: 執行 Playwright 完整測試套件**

Run: `mcp__jetbrains__execute_run_configuration({configurationName: 'Playwright All Tests', projectPath: '...'})`

Expected:

- 所有 E2E 測試通過
- 首頁冒煙測試（portfolio_smoke.feature）通過
- Hero 區塊元素正確顯示
- About 區塊元素正確顯示
- 無 Console 錯誤

**Step 3: 手動驗證內容編輯（可選）**

如果需要手動確認 Payload CMS 功能：

1. 開啟 http://localhost:3000/admin
2. 進入「首頁內容」(Homepage)
3. 修改 Hero 主標題為「Building」
4. 儲存變更
5. 重新整理 http://localhost:3000
6. 確認首頁標題已更新為「Building」
7. 恢復原始內容（改回 "Architecting"）

**Step 4: 記錄驗證結果**

確認：

- [ ] Playwright 測試全部通過
- [ ] 首頁正確顯示 Payload CMS 內容
- [ ] 修改內容後即時生效（如執行 Step 3）

---

## Task 9: 更新測試（Hero 和 About）

**Files:**

- Modify: `frontend/src/components/Hero.spec.tsx`
- Modify: `frontend/src/components/About.spec.tsx`

**Step 1: 更新 Hero 測試以支援新架構**

```typescript
// frontend/src/components/Hero.spec.tsx
import {describe, it, expect, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {HeroClient} from './HeroClient'
import type {HeroData} from '@/lib/getHomepageData'

// Mock data
const mockHeroData: HeroData = {
    eventBadge: {
        text: 'Next Event: K8s Workshop (Oct 20)',
        link: '#event',
        enabled: true,
    },
    mainHeading: 'Architecting',
    highlightedText: 'High Availability',
    trailingText: 'Cloud Systems.',
    description:
        "I'm Steven (鄭棋文), a Senior Cloud Architect. I specialize in designing resilient cloud infrastructures.",
    ctaButtons: [
        {text: 'View My Blog', link: '#blog', variant: 'primary'},
        {text: 'Contact Me', link: '#contact', variant: 'secondary'},
    ],
    socialLinks: [
        {platform: 'github', url: 'https://github.chiwencheng.com'},
        {platform: 'threads', url: 'https://thread.chiwencheng.com'},
    ],
    carouselImages: [
        {src: '/images/ddd.webp', alt: 'Conference 1'},
        {src: '/images/2023DevOpsDays-1.webp', alt: 'Conference 2'},
    ],
    uptimeBadge: {
        enabled: true,
        percentage: '99.99%',
    },
}

describe('HeroClient', () => {
    it('renders hero heading correctly', () => {
        render(<HeroClient data = {mockHeroData}
        />)

        expect(screen.getByText('Architecting')).toBeInTheDocument()
        expect(screen.getByText('High Availability')).toBeInTheDocument()
        expect(screen.getByText('Cloud Systems.')).toBeInTheDocument()
    })

    it('renders event badge when enabled', () => {
        render(<HeroClient data = {mockHeroData}
        />)

        expect(screen.getByText('Next Event: K8s Workshop (Oct 20)')).toBeInTheDocument()
    })

    it('does not render event badge when disabled', () => {
        const dataWithoutBadge: HeroData = {
            ...mockHeroData,
            eventBadge: {
                ...mockHeroData.eventBadge!,
                enabled: false,
            },
        }

        render(<HeroClient data = {dataWithoutBadge}
        />)

        expect(screen.queryByText('Next Event: K8s Workshop (Oct 20)')).not.toBeInTheDocument()
    })

    it('renders CTA buttons', () => {
        render(<HeroClient data = {mockHeroData}
        />)

        expect(screen.getByText('View My Blog')).toBeInTheDocument()
        expect(screen.getByText('Contact Me')).toBeInTheDocument()
    })
})
```

**Step 2: 運行測試驗證**

Run: `mcp__wallaby__wallaby_failingTestsForFile({file: 'frontend/src/components/Hero.spec.tsx'})`

Expected: 測試通過（或顯示需要修復的測試）

**Step 3: 更新 About 測試（如果需要）**

暫時保留現有測試，因為 About 組件變為 async Server Component，單元測試策略需要調整（可在後續 task 中處理）。

**Step 4: Commit**

```bash
git add frontend/src/components/Hero.spec.tsx
git commit -m "test(hero): update tests for payload cms integration"
```

---

## Task 10: 創建文件記錄 Payload 使用方式

**Files:**

- Create: `docs/PAYLOAD_HOMEPAGE_GUIDE.md`

**Step 1: 創建使用指南**

```markdown
# Payload CMS 首頁內容管理指南

## 概述

本專案首頁（`src/app/page.tsx`）的所有內容現在由 **Payload CMS** 管理，無需修改程式碼即可更新網站內容。

## 存取 Admin UI

1. 啟動開發伺服器：
   ```bash
   npm run dev -w frontend
   ```

2. 開啟瀏覽器訪問：
    - Admin UI: http://localhost:3000/admin
    - 首頁預覽: http://localhost:3000

## 管理首頁內容

### Hero 區塊

**路徑**: Admin UI > 首頁內容 > Hero 區塊

**可編輯欄位**:

| 欄位名稱            | 說明                 | 範例                                                            |
|-----------------|--------------------|---------------------------------------------------------------|
| 活動標籤 - 文字       | 首頁頂部的活動通知          | `Next Event: K8s Workshop (Oct 20)`                           |
| 活動標籤 - 連結       | 點擊標籤後導向的位置         | `#event`                                                      |
| 活動標籤 - 顯示       | 是否顯示活動標籤           | ✅ / ❌                                                         |
| 主標題（第一行）        | Hero 標題第一行         | `Architecting`                                                |
| 強調文字（第二行）       | Hero 標題第二行（橘紅色漸層）  | `High Availability`                                           |
| 結尾文字（第二行）       | Hero 標題第二行結尾       | `Cloud Systems.`                                              |
| 介紹文字            | Hero 下方的個人介紹       | `I'm Steven...`                                               |
| CTA 按鈕          | 行動呼籲按鈕（最多 3 個）     | `[{text: "View My Blog", link: "#blog", variant: "primary"}]` |
| 社交媒體連結          | GitHub、Threads 等連結 | `[{platform: "github", url: "https://..."}]`                  |
| 輪播圖片            | 右側圖片輪播（最多 10 張）    | `[{src: "/images/ddd.webp", alt: "..."}]`                     |
| Uptime 標籤 - 顯示  | 是否顯示右下角 Uptime 標籤  | ✅ / ❌                                                         |
| Uptime 標籤 - 百分比 | Uptime 數值          | `99.99%`                                                      |

**範例操作：更新活動通知**

1. 進入 Admin UI > 首頁內容 > Hero 區塊
2. 找到「活動標籤 - 文字」欄位
3. 修改為：`Next Event: Cloud Summit 2026 (Mar 15)`
4. 修改「活動標籤 - 連結」為：`#event`
5. 點擊「Save」
6. 重新整理首頁，確認活動通知已更新

### About 區塊

**路徑**: Admin UI > 首頁內容 > About 區塊

**可編輯欄位**:

| 欄位名稱                   | 說明                   | 範例                                                            |
|------------------------|----------------------|---------------------------------------------------------------|
| 區塊標題                   | About 區塊標題           | `About Me`                                                    |
| 簡介文字                   | About 區塊副標題          | `I architect scalable, secure...`                             |
| 技能卡片                   | 技能類別（最多 8 個）         | `[{name: "Cloud Architecture", icon: "cloud", items: [...]}]` |
| Why work with me - 標題  | 「為何與我合作」區塊標題         | `Why work with me?`                                           |
| Why work with me - 第一段 | 第一段內容（支援富文本）         | `I don't just provision servers...`                           |
| Why work with me - 第二段 | 第二段內容（支援富文本）         | `I am passionate about DevOps...`                             |
| 顯示程式碼區塊                | 是否顯示 Terraform 程式碼範例 | ✅ / ❌                                                         |

**範例操作：新增技能卡片**

1. 進入 Admin UI > 首頁內容 > About 區塊
2. 找到「技能卡片」陣列
3. 點擊「Add Item」
4. 填入：
    - 技能名稱: `Monitoring & Observability`
    - 圖示: `server`
    - 技術項目: 新增多個項目（Prometheus, Grafana, Datadog, New Relic, Sentry）
5. 點擊「Save」
6. 重新整理首頁，確認新技能卡片出現

## 技術架構

### 資料流程

```
Payload Admin UI (編輯內容)
        ↓
PostgreSQL Database (儲存)
        ↓
Payload REST API (/api/globals/homepage)
        ↓
Server Component (getHomepageData)
        ↓
React Components (Hero, About)
        ↓
首頁渲染
```

### 檔案結構

```
frontend/src/
├── globals/
│   ├── Homepage.ts          # Payload Global 定義
│   └── index.ts
├── lib/
│   ├── getHomepageData.ts   # 資料獲取函數
│   └── serializeLexical.tsx # 富文本序列化
├── components/
│   ├── Hero.tsx             # Hero Server Component
│   ├── HeroClient.tsx       # Hero Client Component（保留交互）
│   └── About.tsx            # About Server Component
├── payload-types.ts         # 自動生成的 TypeScript 型別
└── app/
    └── page.tsx             # 首頁主檔案
```

### 型別安全

Payload 自動生成 TypeScript 型別（`payload-types.ts`），確保：

- Admin UI 欄位變更時，TypeScript 編譯會檢查型別不匹配
- 重構程式碼時有自動完成和型別檢查

**重新生成型別**:

```bash
npm run payload generate:types -w frontend
```

## 最佳實踐

### 1. 內容編輯

✅ **建議**:

- 修改內容前先備份（Export JSON）
- 使用有意義的圖片檔名和 Alt Text（SEO 友善）
- CTA 按鈕不超過 2-3 個（避免選擇過載）

❌ **避免**:

- 刪除預設欄位（會導致前端錯誤）
- 上傳過大的圖片（建議 < 500KB）
- 在富文本中使用內嵌 HTML（不安全）

### 2. 開發流程

修改 Payload Global 定義後：

1. 重新生成型別：`npm run payload generate:types -w frontend`
2. 檢查 TypeScript 錯誤：`npm run build -w frontend`
3. 更新對應的 React 組件
4. 更新測試

### 3. 部署

生產環境中，Payload Admin UI 應受到保護：

- 設定 `PAYLOAD_SECRET` 環境變數
- 啟用 Payload 內建的使用者認證
- 限制 `/admin` 路徑的存取權限（只允許 Admin 使用者）

## 疑難排解

### 問題：首頁顯示空白

**解決方案**:

1. 確認 Payload Admin UI 中已儲存首頁內容
2. 檢查瀏覽器 Console 錯誤訊息
3. 驗證 API 端點：`curl http://localhost:3000/api/globals/homepage`

### 問題：修改內容後未生效

**解決方案**:

1. 清除瀏覽器快取並重新整理
2. 確認已點擊「Save」按鈕
3. 檢查開發伺服器是否重新啟動

### 問題：型別錯誤

**解決方案**:

1. 重新生成型別：`npm run payload generate:types -w frontend`
2. 重新啟動 TypeScript 語言伺服器（VS Code: Cmd+Shift+P > TypeScript: Restart TS Server）

## API 參考

### GET /api/globals/homepage

獲取首頁內容（公開端點，無需認證）。

**回應範例**:

```json
{
  "hero": {
    "mainHeading": "Architecting",
    "highlightedText": "High Availability",
    "trailingText": "Cloud Systems.",
    "description": "I'm Steven...",
    "ctaButtons": [
      ...
    ]
  },
  "about": {
    "sectionTitle": "About Me",
    "skills": [
      ...
    ]
  }
}
```

## 下一步

- [ ] 加入使用者認證保護 Admin UI
- [ ] 實作完整的 Lexical 富文本序列化
- [ ] 將 Blog、Event、Speak 區塊遷移至 Payload Collections
- [ ] 加入圖片上傳功能（Payload Media）
- [ ] 設定 SEO 欄位（Meta Title, Description, OG Image）

```

**Step 2: Commit**

```bash
git add docs/PAYLOAD_HOMEPAGE_GUIDE.md
git commit -m "docs(payload): add homepage cms management guide"
```

---

## Task 11: 更新 README

**Files:**

- Modify: `README.md`

**Step 1: 在 README 中加入 Payload CMS 首頁管理資訊**

在 README 的適當位置（例如 "Features" 或 "Tech Stack" 之後）加入：

```markdown
## 內容管理系統 (CMS)

本專案使用 **Payload CMS** 管理首頁內容，讓非技術人員也能輕鬆更新網站。

### 功能

- ✅ **無程式碼編輯**：透過 Admin UI 直接編輯首頁 Hero 和 About 區塊
- ✅ **即時預覽**：儲存後立即在首頁看到變更
- ✅ **型別安全**：TypeScript 自動生成型別定義
- ✅ **富文本編輯器**：支援格式化文字內容（Lexical Editor）

### 快速開始

1. 啟動開發伺服器：
   ```bash
   npm run dev -w frontend
   ```

2. 存取 Payload Admin UI：
    - URL: http://localhost:3000/admin
    - 導航至「首頁內容」(Homepage) 即可編輯

3. 查看詳細指南：
    - 📖 [Payload 首頁管理指南](docs/PAYLOAD_HOMEPAGE_GUIDE.md)

### 管理的內容區塊

- **Hero**：主標題、活動標籤、CTA 按鈕、社交連結、圖片輪播
- **About**：技能卡片、個人介紹、Why work with me 區塊

> **注意**：目前 Blog、Event、Speak 區塊尚未整合至 Payload CMS（計劃中）。

```

**Step 2: 檢查檔案問題**

Run: `mcp__jetbrains__get_file_problems({filePath: 'README.md', errorsOnly: false, projectPath: '...'})`

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): add payload cms homepage management section"
```

---

## Task 12: 建立驗證清單

**Files:**

- Create: `docs/PAYLOAD_HOMEPAGE_VERIFICATION.md`

**Step 1: 建立驗證清單**

```markdown
# Payload CMS 首頁整合驗證清單

## Phase 1: Payload Global 設定

- [ ] `frontend/src/globals/Homepage.ts` 已建立並包含 Hero 和 About 欄位定義
- [ ] `frontend/payload.config.ts` 已註冊 Homepage global
- [ ] 執行 `npm run dev -w frontend` 無錯誤
- [ ] 存取 http://localhost:3000/admin 可看到「首頁內容」項目

## Phase 2: Admin UI 驗證

- [ ] **Hero 區塊所有欄位顯示正確**:
    - [ ] 活動標籤（文字、連結、顯示開關）
    - [ ] 主標題、強調文字、結尾文字
    - [ ] 介紹文字（textarea）
    - [ ] CTA 按鈕陣列（文字、連結、樣式）
    - [ ] 社交媒體連結陣列（平台、URL）
    - [ ] 輪播圖片陣列（路徑、Alt Text）
    - [ ] Uptime 標籤（顯示開關、百分比）

- [ ] **About 區塊所有欄位顯示正確**:
    - [ ] 區塊標題
    - [ ] 簡介文字
    - [ ] 技能卡片陣列（名稱、圖示、技術項目）
    - [ ] Why work with me（標題、段落 1、段落 2、程式碼區塊開關）

- [ ] **預設值正確填入**: 點擊「Save」後，所有欄位應有合理的預設值

## Phase 3: API 端點驗證

```bash
curl http://localhost:3000/api/globals/homepage | jq
```

- [ ] API 回應 200 OK
- [ ] 回應包含 `hero` 物件
- [ ] 回應包含 `about` 物件
- [ ] 所有巢狀欄位結構正確

## Phase 4: 前端渲染驗證

開啟 http://localhost:3000

### Hero 區塊

- [ ] 主標題顯示正確（三行文字：主標題 + 強調文字 + 結尾文字）
- [ ] 活動標籤顯示且可點擊（如果 `enabled: true`）
- [ ] 介紹文字顯示正確
- [ ] CTA 按鈕顯示且樣式正確（主要 vs 次要）
- [ ] 社交媒體圖示顯示且連結正確
- [ ] 圖片輪播正常運作（每 5 秒切換）
- [ ] Uptime 標籤顯示在右下角（如果 `enabled: true`）

### About 區塊

- [ ] 區塊標題和簡介顯示正確
- [ ] 技能卡片正確渲染（圖示、名稱、技術列表）
- [ ] Why work with me 區塊顯示
- [ ] 程式碼區塊顯示（如果 `showCodeBlock: true`）

## Phase 5: 內容編輯測試

### 測試 1: 修改 Hero 主標題

1. Admin UI > 首頁內容 > Hero 區塊
2. 將「主標題（第一行）」從 `Architecting` 改為 `Building`
3. 點擊「Save」
4. 重新整理首頁 http://localhost:3000
5. **預期**: 首頁標題第一行顯示「Building」

- [ ] 測試通過

### 測試 2: 新增技能卡片

1. Admin UI > 首頁內容 > About 區塊 > 技能卡片
2. 點擊「Add Item」
3. 填入：
    - 名稱: `Testing & QA`
    - 圖示: `shield`
    - 技術項目: `Vitest`, `Playwright`, `Cypress`
4. 點擊「Save」
5. 重新整理首頁
6. **預期**: About 區塊出現新的「Testing & QA」技能卡片

- [ ] 測試通過

### 測試 3: 停用活動標籤

1. Admin UI > 首頁內容 > Hero 區塊 > 活動標籤
2. 取消勾選「顯示標籤」
3. 點擊「Save」
4. 重新整理首頁
5. **預期**: 首頁 Hero 區塊不再顯示活動標籤

- [ ] 測試通過

## Phase 6: 型別安全驗證

```bash
npm run build -w frontend
```

- [ ] Build 成功，無 TypeScript 錯誤
- [ ] `frontend/src/payload-types.ts` 已生成
- [ ] 型別檔案包含 `Homepage` interface

## Phase 7: 測試套件

```bash
# 運行 Hero 測試
npm run test:unit -w frontend -- Hero.spec.tsx
```

- [ ] Hero 測試通過
- [ ] 無 console 錯誤或警告

## Phase 8: 效能檢查

開啟 http://localhost:3000

- [ ] 首頁載入時間 < 2 秒
- [ ] Lighthouse Performance 分數 > 90
- [ ] 無 React hydration 錯誤（檢查 Console）

## Phase 9: 文件完整性

- [ ] `docs/PAYLOAD_HOMEPAGE_GUIDE.md` 已建立並包含：
    - [ ] Admin UI 使用說明
    - [ ] 技術架構圖
    - [ ] 疑難排解
    - [ ] API 參考
- [ ] `README.md` 已更新，提及 Payload CMS 首頁管理功能

## Sign-off

- [ ] **所有檢查項目通過**
- [ ] **瀏覽器 Console 無錯誤**
- [ ] **內容編輯測試成功**
- [ ] **型別檢查通過**

**驗證日期**: _____________
**驗證人員**: _____________
**備註**: _____________

```

**Step 2: Commit**

```bash
git add docs/PAYLOAD_HOMEPAGE_VERIFICATION.md
git commit -m "docs(payload): add homepage integration verification checklist"
```

---

## 總結

此計劃將首頁內容遷移至 Payload CMS，透過 12 個漸進式任務完成：

1. ✅ 建立 Homepage Global (Singleton) 定義
2. ✅ 註冊 Global 到 Payload Config
3. ⏸️ 啟動 Payload 並初始化內容（需手動驗證）
4. ✅ 建立首頁數據獲取函數
5. ✅ 生成 Payload TypeScript 型別
6. ✅ 重構 Hero 組件使用 Payload 數據
7. ✅ 重構 About 組件使用 Payload 數據
8. ⏸️ 測試首頁渲染（需手動驗證）
9. ✅ 更新測試（Hero）
10. ✅ 建立 Payload 使用指南文件
11. ✅ 更新 README
12. ✅ 建立驗證清單

**主要優勢**:

- ✅ **無需修改程式碼**即可更新首頁內容
- ✅ **型別安全**：TypeScript 自動生成型別
- ✅ **保持現有 UI/UX**：只遷移數據源，不改變外觀
- ✅ **易於擴展**：未來可輕鬆加入更多內容區塊
- ✅ **API 保持獨立**：不影響現有的 Event/Ticketing API

**後續階段**（不在本計劃範圍）:

- ⏳ 將 Blog、Event、Speak 區塊遷移至 Payload Collections
- ⏳ 加入圖片上傳功能（Payload Media）
- ⏳ 實作完整的 Lexical 富文本序列化
- ⏳ 加入 SEO 欄位（Meta Title, Description, OG Image）
- ⏳ 設定使用者認證保護 Admin UI
- ⏳ 遷移後端 API 到 Payload REST API（另一個 Plan）
