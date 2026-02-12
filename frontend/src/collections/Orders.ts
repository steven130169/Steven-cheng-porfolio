import type {CollectionConfig} from 'payload';

interface OrderItem {
    event: string;
    ticketTypeName: string;
    quantity: number;
    price: number;
}

export const Orders: CollectionConfig = {
    slug: 'orders',
    labels: {
        singular: 'Order',
        plural: 'Orders',
    },
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['customerEmail', 'totalAmount', 'status', 'createdAt'],
        description: 'Ticket Orders - 訂單管理',
    },
    access: {
        // Temporarily allow all access - will implement proper access control in future
        // Planned: users can only read their own orders
        read: () => true,
        create: () => true,
        update: () => true,
        // Planned: restrict delete to admin only
        delete: () => true,
    },
    fields: [
        {
            name: 'customerEmail',
            type: 'email',
            required: true,
            label: '客戶 Email',
            index: true,
        },
        {
            name: 'items',
            type: 'array',
            required: true,
            label: '訂單項目',
            minRows: 1,
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
                    label: '票種',
                },
                {
                    name: 'quantity',
                    type: 'number',
                    required: true,
                    min: 1,
                    label: '數量',
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    label: '單價',
                },
            ],
        },
        {
            name: 'totalAmount',
            type: 'number',
            required: true,
            label: '總金額',
            admin: {
                description: '自動計算',
                readOnly: true,
            },
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            label: '訂單狀態',
            defaultValue: 'pending',
            options: [
                {label: 'Pending', value: 'pending'},
                {label: 'Paid', value: 'paid'},
                {label: 'Cancelled', value: 'cancelled'},
            ],
            index: true,
        },
    ],
    hooks: {
        beforeChange: [
            ({data}) => {
                // 自動計算總金額
                if (data.items && Array.isArray(data.items)) {
                    data.totalAmount = (data.items as OrderItem[]).reduce(
                        (sum: number, item: OrderItem) => sum + (item.quantity * item.price),
                        0
                    );
                }
                return data;
            },
        ],
    },
    timestamps: true,
};
