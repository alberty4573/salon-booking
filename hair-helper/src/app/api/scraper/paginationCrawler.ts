import * as cheerio from 'cheerio'
import { createFetchConfig, addCacheBuster } from './fetchConfig'

export const paginationCrawler = async (url: string) => {
  try {
    // Add cache-busting parameter and proper headers
    const urlWithCacheBuster = addCacheBuster(url)

    const res = await fetch(urlWithCacheBuster, createFetchConfig())

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const html = await res.text()

    const lastPageUrl = parseHtml(html)

    if (!lastPageUrl) {
      console.log('No pagination found, assuming single page')
      return '1'
    }

    // Extract page number from URL like "?page=11"
    const pageMatch = lastPageUrl.match(/page=(\d+)/)
    const result = pageMatch ? pageMatch[1] : null

    console.log('result', result)
    return result
  } catch (error) {
    console.error('Error in paginationCrawler:', error)
    return null
  }
}

const parseHtml = (html: string | Buffer) => {
  const $ = cheerio.load(html)
  try {
    const lastPage = $('[title="Go to last page"]').attr('href')
    console.log('lastPage', lastPage)

    if (!lastPage) {
      // Fallback: try to find the highest page number in pagination
      const pageNumbers: number[] = []
      $('.pager__item a').each((_, element) => {
        const href = $(element).attr('href')
        if (href && href.includes('page=')) {
          const pageMatch = href.match(/page=(\d+)/)
          if (pageMatch) {
            pageNumbers.push(parseInt(pageMatch[1], 10))
          }
        }
      })

      if (pageNumbers.length > 0) {
        const maxPage = Math.max(...pageNumbers)
        console.log('Fallback: found max page', maxPage)
        return `?page=${maxPage}`
      }
    }

    return lastPage
  } catch (error) {
    console.log('Error parsing html:', error)
    return null
  }
}
