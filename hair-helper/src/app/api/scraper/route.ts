import { NextResponse } from 'next/server'
import { crawler } from './crawler'
import { paginationCrawler } from './paginationCrawler'
import { StandardEvent } from '../types/event'

// Configuration constants
const MAX_PAGES = 100
const CONCURRENCY_LIMIT = 3
const BATCH_DELAY_MS = 200 // Increased delay to be more respectful

function getOpUrl(page: number): string {
  const baseUrl = 'https://www.sydneyoperahouse.com/whats-on'
  return `${baseUrl}?page=${page}`
}

function validatePageNumber(pageNumber: number): boolean {
  return !isNaN(pageNumber) && pageNumber > 0 && pageNumber <= MAX_PAGES
}

async function scrapeWithConcurrencyLimit(
  urls: string[],
  concurrencyLimit: number = 5,
): Promise<StandardEvent[]> {
  const results: StandardEvent[] = []

  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit)
    const batchPromises = batch.map(async (url, index) => {
      try {
        // Add random delay between 100-300ms for each request
        const randomDelay = Math.floor(Math.random() * 200) + 100
        await new Promise((resolve) => setTimeout(resolve, randomDelay))

        return await crawler(url)
      } catch (error) {
        console.error(`Error scraping page ${i + index}:`, error)
        return [] // Return empty array for failed pages
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults.flat())

    // Longer delay between batches
    if (i + concurrencyLimit < urls.length) {
      const batchDelay = BATCH_DELAY_MS + Math.floor(Math.random() * 100)
      await new Promise((resolve) => setTimeout(resolve, batchDelay))
    }

    console.log(
      `Completed batch ${Math.floor(i / concurrencyLimit) + 1}/${Math.ceil(urls.length / concurrencyLimit)}`,
    )
  }

  return results
}

export async function GET() {
  const startTime = Date.now()
  const page = 0
  const operaHouseUrl = `https://www.sydneyoperahouse.com/whats-on?page=${page}`

  try {
    console.log('Starting scraping process...')
    console.log('Target URL:', operaHouseUrl)
    console.log('Timestamp:', new Date().toISOString())

    // Get the total number of pages
    const lastPage = await paginationCrawler(operaHouseUrl)

    if (!lastPage) {
      console.error('Failed to get pagination info')
      return NextResponse.json(
        { error: 'Failed to get pagination information' },
        { status: 500 },
      )
    }

    const lastPageNumber = Number(lastPage)

    if (!validatePageNumber(lastPageNumber)) {
      console.error('Invalid page number:', lastPage)
      return NextResponse.json(
        { error: 'Invalid pagination data' },
        { status: 500 },
      )
    }

    console.log(`Found ${lastPageNumber} pages to scrape`)

    // Generate URLs for all pages
    const urls = Array.from({ length: lastPageNumber }, (_, index) =>
      getOpUrl(index),
    )

    // Use concurrency-limited scraping for better performance and server respect
    const events = await scrapeWithConcurrencyLimit(urls, CONCURRENCY_LIMIT)

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(
      `Scraping completed: ${events.length} events from ${lastPageNumber} pages in ${duration}ms`,
    )

    return NextResponse.json({
      events,
      metadata: {
        totalEvents: events.length,
        totalPages: lastPageNumber,
        scrapingTimeMs: duration,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error in API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during scraping',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
