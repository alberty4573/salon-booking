import { NextResponse } from 'next/server'
import { addCacheBuster, createFetchConfig } from '../scraper/fetchConfig'

export async function GET() {
  try {
    const testUrl = 'https://www.sydneyoperahouse.com/whats-on?page=0'
    const urlWithCacheBuster = addCacheBuster(testUrl)

    const res = await fetch(urlWithCacheBuster, createFetchConfig())

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const html = await res.text()

    // Extract some key information to verify freshness
    const currentTime = new Date().toISOString()
    const htmlLength = html.length
    const contentHash = html.substring(0, 200) // First 200 chars as a simple hash

    return NextResponse.json({
      success: true,
      timestamp: currentTime,
      url: urlWithCacheBuster,
      htmlLength,
      contentPreview: contentHash,
      headers: Object.fromEntries(res.headers.entries()),
      status: res.status,
      message: 'Successfully fetched fresh content',
    })
  } catch (error) {
    console.error('Test fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch test content',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
