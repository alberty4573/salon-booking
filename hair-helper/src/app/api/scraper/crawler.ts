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
                venue: '',
                startDate: '',
                endDate: '',
            }
            result.category = $(element).find('p.card__category').text() || 'none';
            result.title = $(element).find('span.card__heading-text').text();
            result.url = `https://www.sydneyoperahouse.com` + $(element).find('a').attr('href') || '';
            // "20 Mar 2024 – 21 Mar 2024"
            const raw = $(element).find('p.card__dates').text().trim().replace(/\s*–\s*/, ' – ').replace(/\s+/g, ' ')
            const match = raw.match(/(\d{1,2} \w{3} \d{4})\s*–\s*(\d{1,2} \w{3} \d{4})/);
            if (match) {
                result.startDate = match[1];
                result.endDate = match[2];
            }
            result.venue = $(element).find('p.card__venue').text();

            results.push(result)
        })


        
    } catch (error) {
        console.log('Error parsing html:', error)
    }
    return results
}