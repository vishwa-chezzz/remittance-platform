// Tiny fetch wrapper: adds the JWT and throws readable errors
export async function api(path, { method = 'GET', body, params } = {}) {
  const token = localStorage.getItem('token');
  const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))) : '';
  const res = await fetch('/api' + path + qs, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) { localStorage.removeItem('token'); window.location.href = '/login'; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
