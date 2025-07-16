import * as cheerio from 'cheerio'
import { StandardEvent } from '../types/event'
import { createFetchConfig, addCacheBuster } from './fetchConfig'

export const crawler = async (url: string) => {
  // Add cache-busting parameter and proper headers
  const urlWithCacheBuster = addCacheBuster(url)

  const res = await fetch(urlWithCacheBuster, createFetchConfig())

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const html = await res.text()
  const result = parse(html)
  return result
}

const parse = (html: string | Buffer) => {
  const $ = cheerio.load(html)

  const results: StandardEvent[] = []
  try {
    // opera house
    $('div.card').each((index, element) => {
      const result: StandardEvent = {
        category: '',
        title: '',
        url: '',
        duration: '',
        description: '',
        location: '',
        venue: '',
        startDate: '',
        endDate: '',
      }
      result.category = $(element).find('p.card__category').text() || 'none'
      result.title = $(element).find('span.card__heading-text').text()
      result.url =
        `https://www.sydneyoperahouse.com` +
          $(element).find('a').attr('href') || ''
      // "20 Mar 2024 – 21 Mar 2024"
      const raw = $(element)
        .find('p.card__dates')
        .text()
        .trim()
        .replace(/\s*–\s*/, ' – ')
        .replace(/\s+/g, ' ')
      let match = raw.match(/(\d{1,2} \w{3} \d{4})\s*–\s*(\d{1,2} \w{3} \d{4})/)
      if (match) {
        result.startDate = match[1]
        result.endDate = match[2]
      } else {
        // Case 2: Date range with shared year: "20 Mar - 23 Mar 2025"
        match = raw.match(/(\d{1,2} \w{3})\s*–\s*(\d{1,2} \w{3} \d{4})/)
        if (match) {
          const year = match[2].match(/\d{4}$/)?.[0]
          result.startDate = `${match[1]} ${year}`
          result.endDate = match[2]
        } else {
          // Case 3: Single date: "20 Oct 2025"
          match = raw.match(/(\d{1,2} \w{3} \d{4})/)
          if (match) {
            result.startDate = match[1]
            result.endDate = match[1] // Same date for single-day events
          }
        }
      }
      result.venue = $(element).find('p.card__venue').text()

      const isEventPast = (endDate: string): boolean => {
        if (!endDate) return false

        try {
          const eventDate = new Date(endDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0) // Reset time to start of day

          return eventDate < today
        } catch (error) {
          console.log('Error parsing date:', endDate, error)
          return false // If date parsing fails, include the event
        }
      }

      if (!isEventPast(result.endDate || '')) {
        results.push(result)
      }
    })
  } catch (error) {
    console.log('Error parsing html:', error)
  }
  return results
}
