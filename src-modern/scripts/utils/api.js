const API_BASE = import.meta.env.VITE_API_BASE || '';

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return await res.json();
}

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return await res.json();
}

async function putJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return await res.json();
}

export { getJSON, postJSON, putJSON };
