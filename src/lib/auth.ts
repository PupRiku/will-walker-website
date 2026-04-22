// Used by API write routes (POST, PUT, DELETE) only.
// /admin UI routes are protected separately by src/middleware.ts.
export function requireAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Basic ')) return false
  const base64 = authHeader.slice(6)
  const decoded = Buffer.from(base64, 'base64').toString('utf-8')
  const colonIndex = decoded.indexOf(':')
  if (colonIndex === -1) return false
  const user = decoded.slice(0, colonIndex)
  const password = decoded.slice(colonIndex + 1)
  return user === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD
}
