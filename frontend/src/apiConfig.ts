/**
 * Centralized API configuration for NEXORA AI
 * Supports environment-based configuration via VITE_API_BASE_URL
 * Development: Defaults to http://localhost:8000
 * Production: Configured via VITE_API_BASE_URL=<PUBLIC_FASTAPI_URL>
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE = `${API_BASE_URL}/api`;
