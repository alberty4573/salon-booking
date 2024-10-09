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
    $('a.event_tile-link').each((index, element) => {
        results.push($(element).text())
    })
    return results
}