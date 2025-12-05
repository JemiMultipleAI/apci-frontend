// Frontend environment configuration
// These variables are available at build time via NEXT_PUBLIC_ prefix

export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  APP_NAME: 'CRMatIQ',
  APP_DESCRIPTION: 'Your CRM — On Auto-Pilot',
} as const;

