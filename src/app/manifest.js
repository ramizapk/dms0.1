
export default function manifest() {
    return {
        name: 'نظام إدارة المستندات | DMS',
        short_name: 'DMS',
        description: 'نظام إدارة المستندات للمشاريع',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
