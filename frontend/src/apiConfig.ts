/**
 * Centralized API configuration for NEXORA AI
 * Supports environment-based configuration via VITE_API_BASE_URL
 * Development: Defaults to http://localhost:8000
 * Production: Configured via VITE_API_BASE_URL=<PUBLIC_FASTAPI_URL>
 */

const envUrl = import.meta.env.VITE_API_BASE_URL;
// In development, fallback to local dev server. In production, never fallback to localhost.
const defaultBase = import.meta.env.DEV ? 'http://localhost:8000' : '';
const rawBaseUrl = (envUrl && envUrl.trim().length > 0 ? envUrl.trim() : defaultBase).replace(/\/+$/, '');

export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
export const API_BASE = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
export const IS_PRODUCTION_BACKEND_CONFIGURED = Boolean(envUrl && envUrl.trim().length > 0);

