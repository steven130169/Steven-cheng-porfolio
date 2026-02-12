import type {CollectionConfig} from 'payload';

interface TicketType {
    name: string;
    price: number;
    allocation?: number;
    enabled?: boolean;
}

export const Events: CollectionConfig = {
    slug: 'events',
    labels: {
        singular: 'Event',
        plural: 'Events',
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'status', 'eventDate', 'totalCapacity'],
        description: 'Event Ticketing System - 活動票務管理',
    },
    access: {
        // Temporarily allow all access - will implement proper access control in future
        // Planned: restrict unauthenticated users to PUBLISHED events only
        read: () => true,
        // Planned: restrict create/update/delete to admin role
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: '活動標題',
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'URL Slug',
            admin: {
                description: '用於 URL 的唯一識別碼',
            },
        },
        {
            name: 'description',
            type: 'richText',
            label: '活動描述',
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            label: '狀態',
            defaultValue: 'DRAFT',
            options: [
                {label: 'Draft', value: 'DRAFT'},
                {label: 'Published', value: 'PUBLISHED'},
                {label: 'Archived', value: 'ARCHIVED'},
            ],
            admin: {
                description: 'DRAFT: 草稿, PUBLISHED: 已發布可售票, ARCHIVED: 已封存',
            },
        },
        {
            name: 'eventDate',
            type: 'date',
            label: '活動日期時間',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'totalCapacity',
            type: 'number',
            required: true,
            label: '總容量',
            min: 1,
            admin: {
                description: '活動總人數上限',
            },
        },
        {
            name: 'ticketTypes',
            type: 'array',
            label: '票種',
            minRows: 1,
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    label: '票種名稱',
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    label: '價格',
                    min: 0,
                },
                {
                    name: 'allocation',
                    type: 'number',
                    label: '配額',
                    admin: {
                        description: '此票種的數量限制(不填則不限制)',
                    },
                },
                {
                    name: 'enabled',
                    type: 'checkbox',
                    label: '啟用',
                    defaultValue: true,
                },
            ],
        },
    ],
    hooks: {
        beforeChange: [
            ({data, operation}) => {
                // 驗證票種總配額不超過總容量
                if (data.ticketTypes && Array.isArray(data.ticketTypes)) {
                    const totalAllocation = (data.ticketTypes as TicketType[]).reduce(
                        (sum: number, ticket: TicketType) => {
                            return sum + (ticket.allocation ?? 0);
                        },
                        0
                    );

                    if (totalAllocation > 0 && totalAllocation > data.totalCapacity) {
                        throw new Error(
                            `票種總配額 (${totalAllocation}) 不能超過總容量 (${data.totalCapacity})`
                        );
                    }
                }

                // 自動設定時間戳
                if (operation === 'create') {
                    data.createdAt = new Date().toISOString();
                }
                data.updatedAt = new Date().toISOString();

                return data;
            },
        ],
    },
    timestamps: true,
};
