/**
 * Cookie utility functions for managing authentication tokens
 * Works both client-side and can be read by Next.js middleware
 */

const COOKIE_OPTIONS = {
  // 7 days for refresh token, 15 minutes for access token
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
};

/**
 * Set a cookie (client-side only)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') {
    console.warn('setCookie called on server-side, this should only be called client-side');
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const cookieValue = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${COOKIE_OPTIONS.path};SameSite=${COOKIE_OPTIONS.sameSite}${COOKIE_OPTIONS.secure ? ';Secure' : ''}`;
  
  document.cookie = cookieValue;
}

/**
 * Get a cookie value (client-side only)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Remove a cookie (client-side only)
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${COOKIE_OPTIONS.path};`;
}

/**
 * Set access token cookie (15 minutes)
 */
export function setAccessToken(token: string): void {
  setCookie('accessToken', token, 15 / (24 * 60)); // 15 minutes
}

/**
 * Set refresh token cookie (7 days)
 */
export function setRefreshToken(token: string): void {
  setCookie('refreshToken', token, 7); // 7 days
}

/**
 * Get access token from cookie
 */
export function getAccessToken(): string | null {
  return getCookie('accessToken');
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | null {
  return getCookie('refreshToken');
}

/**
 * Remove both token cookies
 */
export function clearTokens(): void {
  removeCookie('accessToken');
  removeCookie('refreshToken');
  removeCookie('companyId');
}

/**
 * Set company ID cookie
 */
export function setCompanyId(companyId: string | null): void {
  if (companyId === null) {
    removeCookie('companyId');
  } else {
    setCookie('companyId', companyId, 7); // 7 days, same as refresh token
  }
}

/**
 * Get company ID from cookie
 */
export function getCompanyId(): string | null {
  return getCookie('companyId');
}

/**
 * Clear company ID cookie
 */
export function clearCompanyId(): void {
  removeCookie('companyId');
}

