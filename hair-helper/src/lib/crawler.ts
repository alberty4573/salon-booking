import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export const crawler = async (url: string) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    const result = parse(html)
    await browser.close();
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