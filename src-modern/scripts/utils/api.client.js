// src-modern/scripts/utils/api.client.js

import { API_CONFIG } from './api.js';

/**
 * HTTP Client để gọi API
 */
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        
        // Thêm query params nếu có
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Request Failed:', error);
            throw error;
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Request Failed:', error);
            throw error;
        }
    }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
