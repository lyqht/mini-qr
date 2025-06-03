// Base path utility for handling runtime paths
// Uses Vite's environment variable system to get BASE_PATH at build time

/**
 * Get the base path for the application
 * This reads from Vite's environment variables which are set during build time
 */
export function getBasePath(): string {
  // Vite makes BASE_PATH available at build time through import.meta.env
  // If BASE_PATH is not set, default to '/'
  return import.meta.env.BASE_PATH || '/'
}

/**
 * Resolve a relative path with the application base path
 * @param path - The path to resolve (should start with /)
 * @returns The resolved path with base path prepended
 */
export function resolvePath(path: string): string {
  const basePath = getBasePath()

  // Remove trailing slash from base path (except for root)
  const cleanBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, '')

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanBasePath}${cleanPath}`
}

/**
 * Create a fetch function that respects the base path
 * @param path - The path to fetch (should start with /)
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export function fetchWithBasePath(path: string, options?: RequestInit): Promise<Response> {
  const resolvedPath = resolvePath(path)
  return fetch(resolvedPath, options)
}
