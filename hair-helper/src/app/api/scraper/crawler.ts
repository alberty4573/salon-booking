import * as cheerio from 'cheerio';

export const crawler = async (url: string) => {
    const res = await fetch(url)
    const html = await res.text()
    const result = parse(html)
    return result
}

const parse = (html: string | Buffer) => {
    const $ = cheerio.load(html);

    const results: string[] = []
    try {
        $('a.event_tile-link').each((index, element) => {
            results.push($(element).text())
        })

        $('span.card__heading-text').each((index, element) => {
            results.push($(element).text())
        })
        
    } catch (error) {
        console.log('Error parsing html:', error)
    }
    return results
}