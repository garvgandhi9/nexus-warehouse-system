export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
    WAREHOUSES: `${API_BASE_URL}/public/warehouses`,
    FEATURED_WAREHOUSES: `${API_BASE_URL}/public/warehouses/featured`,
    CITIES: `${API_BASE_URL}/public/cities`,
    WAREHOUSE_BY_ID: (id: number | string) => `${API_BASE_URL}/public/warehouses/${id}`,
    SUBMIT: `${API_BASE_URL}/public/submit`,
    CONTACT: `${API_BASE_URL}/public/contact`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
    ADMIN_WAREHOUSES: `${API_BASE_URL}/admin/warehouses`,
    ADMIN_USERS: `${API_BASE_URL}/admin/users`,
    ADMIN_MESSAGES: `${API_BASE_URL}/admin/messages`,
    ADMIN_APPROVE: (id: number | string) => `${API_BASE_URL}/admin/approve/${id}`,
    ADMIN_DELETE: (id: number | string) => `${API_BASE_URL}/admin/delete/${id}`,
    ADMIN_DELETE_MESSAGE: (id: number | string) => `${API_BASE_URL}/admin/messages/${id}`,
    USER_WAREHOUSES: `${API_BASE_URL}/user/warehouses`,
    USER_WAREHOUSE_UPDATE: (id: number | string) => `${API_BASE_URL}/user/warehouses/${id}`,
    UPLOAD: `${API_BASE_URL}/public/upload`,
    GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
};