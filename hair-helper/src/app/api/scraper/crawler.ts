import * as cheerio from 'cheerio';
import { StandardEvent } from '../types/event';

export const crawler = async (url: string) => {
    const res = await fetch(url)
    const html = await res.text()
    const result = parse(html)
    return result
}

const parse = (html: string | Buffer) => {
    const $ = cheerio.load(html);

    const results: StandardEvent[] = []
    try {
        // city of sydney
        // $('a.event_tile-link').each((index, element) => {
        //     results.push($(element).text())
        // })

        // opera house
        $('div.card').each((index, element) => {
            const result: StandardEvent = {
                category: '',
                title: '',
                url: '',
                duration: '',
                description: '',
                location: '',
            }
            result.category = $(element).find('p.card__category').text() || 'none';
            result.title = $(element).find('span.card__heading-text').text();
            result.url = `https://www.sydneyoperahouse.com` + $(element).find('a').attr('href') || '';

            results.push(result)
        })


        
    } catch (error) {
        console.log('Error parsing html:', error)
    }
    return results
}