/**
 * Centralized API configuration for deployment.
 * Defaults to localhost:3001 in development.
 * In production, this should be set to your Render/backend URL via VITE_API_URL.
 */
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
    WAREHOUSES: `${API_BASE_URL}/public/warehouses`,
    SUBMIT: `${API_BASE_URL}/public/submit`,
    CONTACT: `${API_BASE_URL}/public/contact`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
    ADMIN_WAREHOUSES: `${API_BASE_URL}/admin/warehouses`,
    ADMIN_USERS: `${API_BASE_URL}/admin/users`,
    ADMIN_MESSAGES: `${API_BASE_URL}/admin/messages`,
};
