export type AuthProfile = {
  email?: string;
  name?: string;
  ai_limit?: number;
  ai_used_today?: number;
  ai_remaining_today?: number;
};

const ACCESS_TOKEN_KEY = "mesodb_access_token";

export function saveAuthFromUrl() {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hashParams.get("access_token");

  if (!accessToken) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.history.replaceState(null, "", window.location.pathname);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
