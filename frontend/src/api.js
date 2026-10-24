// Thin fetch wrapper. In development, Vite proxies /api to the .NET API.
async function request(method, path, body) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response))
  }
  return response.status === 204 ? null : response.json()
}

// ASP.NET sends validation errors as JSON and our own errors as plain text.
async function errorMessage(response) {
  const text = await response.text()
  try {
    const problem = JSON.parse(text)
    return problem.errors ? Object.values(problem.errors).flat().join(' ') : problem.title
  } catch {
    return text || `Request failed (${response.status})`
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
