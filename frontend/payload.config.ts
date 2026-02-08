import sharp from 'sharp'
import {lexicalEditor} from '@payloadcms/richtext-lexical'
import {postgresAdapter} from '@payloadcms/db-postgres'
import {buildConfig} from 'payload'
import type {GlobalConfig} from 'payload'

// Homepage Global definition (inline to avoid ESM import issues with Payload CLI)
const Homepage: GlobalConfig = {
    slug: 'homepage',
    label: '首頁內容',
    access: {
        read: () => true, // Public read
        update: () => true, // NOTE: 未來應加上 admin 權限驗證
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

export default buildConfig({
    // If you'd like to use Rich Text, pass your editor here
    editor: lexicalEditor(),

    // Define and configure your collections in this array
    collections: [], // 暫時保持為空，不影響現有 API
    globals: [Homepage],

    // Your Payload secret - should be a complex and secure string, unguessable
    secret: process.env.PAYLOAD_SECRET || '',
    // Whichever Database Adapter you're using should go here
    // Mongoose is shown as an example, but you can also use Postgres
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL!,
        }

    }),
    // If you want to resize images, crop, set focal point, etc.
    // make sure to install it and pass it to the config.
    // This is optional - if you don't need to do these things,
    // you don't need it!
    sharp,

    // TypeScript configuration
    typescript: {
        outputFile: './src/payload-types.ts',
    },
})
