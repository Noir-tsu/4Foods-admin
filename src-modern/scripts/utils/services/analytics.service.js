// src-modern/scripts/utils/services/analytics.service.js
import { apiClient } from '../api.client.js';
import { ENDPOINTS } from '../api.js';

/**
 * Analytics Service - Xử lý tất cả API calls cho Analytics
 */
export const AnalyticsService = {
    /**
     * Lấy tổng quan analytics (tổng doanh thu, hôm nay, đơn hàng, etc.)
     */
    async getSummary() {
        return await apiClient.get(ENDPOINTS.ANALYTICS.SUMMARY);
    },

    /**
     * Lấy doanh thu theo ngày (30 ngày gần nhất)
     */
    async getRevenueDailyData(days = 30) {
        return await apiClient.get(ENDPOINTS.ANALYTICS.REVENUE_DAILY, { days });
    }
};
