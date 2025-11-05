import { getToken, logout } from '../store/auth';

// PUBLIC_INTERFACE
export const getApiBase = () => {
  /** Returns API base URL from env with fallback. */
  const base = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
  return base.replace(/\/+$/, '');
};

// PUBLIC_INTERFACE
export async function apiRequest(path, { method = 'GET', body, headers = {}, responseType = 'json' } = {}) {
  /**
   * Generic API request with JWT token injection and 401 handling.
   * path: string - endpoint path starting with '/'
   * options: method, body (object or FormData), headers, responseType ('json'|'blob'|'text')
   */
  const url = `${getApiBase()}${path}`;
  const token = getToken();
  const finalHeaders = new Headers(headers);

  // If body is plain object, send JSON
  let requestBody = body;
  if (body && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: requestBody,
    credentials: 'include'
  });

  if (res.status === 401) {
    logout();
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  if (responseType === 'blob') return res.blob();
  if (responseType === 'text') return res.text();
  return res.json().catch(() => ({}));
}

// PUBLIC_INTERFACE
export const AuthAPI = {
  /** Login - expects {email, password} and returns {access_token, user} */
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  /** Get current user profile */
  me: () => apiRequest('/auth/me', { method: 'GET' }),
};

// PUBLIC_INTERFACE
export const ProjectsAPI = {
  list: (params = {}) => {
    const usp = new URLSearchParams(params);
    const qs = usp.toString() ? `?${usp.toString()}` : '';
    return apiRequest(`/projects${qs}`, { method: 'GET' });
  },
  get: (id) => apiRequest(`/projects/${id}`, { method: 'GET' }),
  create: (data) => apiRequest('/projects', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
};

// PUBLIC_INTERFACE
export const UploadAPI = {
  /** Upload image to local filesystem endpoint. Expects field name 'file'. */
  uploadImage: (file, extra = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return apiRequest('/uploads/images', { method: 'POST', body: fd });
  },
};

// PUBLIC_INTERFACE
export const ReportsAPI = {
  /** Download a report by key, returns Blob */
  download: (key, params = {}) => {
    const usp = new URLSearchParams(params);
    const qs = usp.toString() ? `?${usp.toString()}` : '';
    return apiRequest(`/reports/${encodeURIComponent(key)}${qs}`, { method: 'GET', responseType: 'blob' });
  }
};
