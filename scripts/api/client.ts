import 'dotenv/config'
import { Options } from '~scripts/api/types/query'

const baseUrl = new URL('https://api.discogs.com')

const buildQueryString = (options?: Options): string => {
  if (!options) return ''

  const string = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `?${string}`
}

export const buildUrl = (path: string, options?: Options): string => {
  const queryString = buildQueryString(options)
  return new URL(`${path}${queryString}`, baseUrl).toString()
}

export const request = async <T>(url: string): Promise<T> =>
  fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
    },
  }).then((res) => res.json() as T)
