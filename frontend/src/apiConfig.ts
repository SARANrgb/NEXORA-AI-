/**
 * Centralized API configuration for NEXORA AI
 * Supports environment-based configuration via VITE_API_BASE_URL
 * Development: Defaults to http://localhost:8000
 * Production: Configured via VITE_API_BASE_URL=<PUBLIC_FASTAPI_URL>
 */

const envUrl = import.meta.env.VITE_API_BASE_URL;
const rawBaseUrl = (envUrl && envUrl.trim().length > 0 ? envUrl.trim() : 'http://localhost:8000').replace(/\/+$/, '');
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
export const API_BASE = `${API_BASE_URL}/api`;

