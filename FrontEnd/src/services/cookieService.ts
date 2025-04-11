// src/services/cookieService.ts
// A unified service for cookie management

/**
 * Sets a cookie with the specified name, value, and options
 */
export const setCookie = (
  name: string,
  value: string,
  options: { days?: number; path?: string; sameSite?: string } = {}
) => {
  const { days = 1, path = "/", sameSite = "Lax" } = options;

  // Calculate expiration
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);

  // Build cookie string
  let cookieString = `${name}=${encodeURIComponent(
    value
  )}; path=${path}; SameSite=${sameSite}`;

  // Add expiration if not a session cookie
  if (days > 0) {
    cookieString += `; expires=${expirationDate.toUTCString()}`;
  }

  // Set the cookie
  document.cookie = cookieString;
};

/**
 * Gets a cookie by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Removes a cookie by name
 */
export const removeCookie = (name: string, path = "/") => {
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

/**
 * Synchronizes a token between localStorage and cookies
 * Useful for making tokens available to both client-side code and middleware
 */
export const syncTokenBetweenStorages = (token: string | null) => {
  if (token) {
    // Set in localStorage
    localStorage.setItem("token", token);
    // Set in cookie
    setCookie("token", token, { days: 1 });
  } else {
    // Remove from localStorage
    localStorage.removeItem("token");
    // Remove from cookie
    removeCookie("token");
  }
};

/**
 * Gets the auth token from localStorage or cookie
 */
export const getAuthToken = (): string | null => {
  // First try localStorage
  const localToken = localStorage.getItem("token");
  if (localToken) {
    return localToken;
  }

  // Then try cookie
  return getCookie("token");
};

/**
 * Checks if user is authenticated by verifying token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

const cookieService = {
  setCookie,
  getCookie,
  removeCookie,
  syncTokenBetweenStorages,
  getAuthToken,
  isAuthenticated,
};

export default cookieService;
