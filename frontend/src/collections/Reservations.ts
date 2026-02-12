import type {CollectionConfig} from 'payload';

export const Reservations: CollectionConfig = {
    slug: 'reservations',
    labels: {
        singular: 'Reservation',
        plural: 'Reservations',
    },
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['customerEmail', 'event', 'status', 'expiresAt'],
        description: 'Ticket Reservations - 票券預訂(15分鐘過期)',
    },
    access: {
        // Temporarily allow all access - will implement proper access control in future
        // Planned: users can only read their own reservations
        read: () => true,
        create: () => true,
        update: () => true,
        // Planned: restrict delete to admin only
        delete: () => true,
    },
    fields: [
        {
            name: 'event',
            type: 'relationship',
            relationTo: 'events',
            required: true,
            label: '活動',
        },
        {
            name: 'ticketTypeName',
            type: 'text',
            required: true,
            label: '票種名稱',
            admin: {
                description: '從活動的 ticketTypes 中選擇的票種名稱',
            },
        },
        {
            name: 'quantity',
            type: 'number',
            required: true,
            min: 1,
            label: '數量',
        },
        {
            name: 'customerEmail',
            type: 'email',
            required: true,
            label: '客戶 Email',
            index: true,
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            label: '狀態',
            defaultValue: 'ACTIVE',
            options: [
                {label: 'Active', value: 'ACTIVE'},
                {label: 'Consumed', value: 'CONSUMED'},
                {label: 'Expired', value: 'EXPIRED'},
            ],
            index: true,
        },
        {
            name: 'expiresAt',
            type: 'date',
            required: true,
            label: '過期時間',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
                description: '預訂將在此時間後自動過期',
            },
            index: true,
        },
    ],
    hooks: {
        beforeChange: [
            ({data, operation}) => {
                // 創建時自動設定過期時間(15分鐘)
                if (operation === 'create' && !data.expiresAt) {
                    const now = new Date();
                    data.expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
                }
                return data;
            },
        ],
    },
    timestamps: true,
};
