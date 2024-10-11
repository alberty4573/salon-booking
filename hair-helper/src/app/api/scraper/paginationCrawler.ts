import * as cheerio from 'cheerio';


export const paginationCrawler = async (url: string) => {
    const res = await fetch(url)
    const html = await res.text()
    // ?page=14
    const result = parse(html)?.split('=')[1]
    return result
}

const parse = (html: string | Buffer) => {
    const $ = cheerio.load(html);
    try {
        return $('[title="Go to last page"]').attr('href')  
    } catch (error) {
        console.log('Error parsing html:', error)
    }
}