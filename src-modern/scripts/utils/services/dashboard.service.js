// src-modern/scripts/utils/services/dashboard.service.js

import { apiClient } from '../api.client.js';
import { ENDPOINTS } from '../api.js';

/**
 * Dashboard Service - Xử lý tất cả API calls cho Dashboard
 */
export const DashboardService = {
    /**
     * Lấy thống kê tổng quan (4 khối đầu)
     */
    async getSummaryStats() {
        return await apiClient.get(ENDPOINTS.DASHBOARD.SUMMARY);
    },

    /**
     * Lấy dữ liệu biểu đồ doanh thu 12 tháng
     */
    async getRevenueChartData() {
        return await apiClient.get(ENDPOINTS.DASHBOARD.REVENUE);
    },

    /**
     * Lấy danh sách hoạt động gần đây
     */
    async getRecentActivities(limit = 10) {
        return await apiClient.get(ENDPOINTS.DASHBOARD.ACTIVITY, { limit });
    },

    /**
     * Lấy danh sách đơn hàng gần đây
     */
    async getRecentOrders(limit = 7) {
        return await apiClient.get(ENDPOINTS.DASHBOARD.RECENT_ORDERS, { limit });
    },

    /**
     * Lấy phân bố trạng thái đơn hàng
     */
    async getOrderStatusDistribution() {
        return await apiClient.get(ENDPOINTS.DASHBOARD.ORDER_STATUS);
    },

    /**
     * Lấy dữ liệu tăng trưởng người dùng 30 ngày
     */
    async getUserGrowthData() {
        return await apiClient.get(ENDPOINTS.DASHBOARD.USER_GROWTH);
    }
};
