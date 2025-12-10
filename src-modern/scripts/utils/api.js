// src-modern/scripts/utils/api.js

export const API_CONFIG = {
    BASE_URL: 'http://157.66.101.113:5000/api/webadmin', 
    TIMEOUT: 10000,
};

export const ENDPOINTS = {
    DASHBOARD: {
        SUMMARY: '/dashboard/summary',
        REVENUE: '/dashboard/revenue-chart',
        ACTIVITY: '/dashboard/activities',
        RECENT_ORDERS: '/dashboard/recent-orders',
        ORDER_STATUS: '/dashboard/order-status',
        USER_GROWTH: '/dashboard/user-growth'
    },
    ANALYTICS: {
        SUMMARY: '/analytics/summary',
        REVENUE_DAILY: '/analytics/revenue-daily'
    }
};
