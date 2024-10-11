import { NextResponse} from 'next/server'
import { crawler } from './crawler';
import { paginationCrawler } from './paginationCrawler';

function getOpUrl(page: number) {
  const operaUlr = `https://www.sydneyoperahouse.com/whats-on?page=${page}`;
  return operaUlr;
}

export async function GET(
) {

  const url = 'https://whatson.cityofsydney.nsw.gov.au/venues/sydney-opera-house';


  const page = 0
  const operaHouseUrl = `https://www.sydneyoperahouse.com/whats-on?page=${page}`


  try {
    const lastPage = await paginationCrawler(operaHouseUrl)
    const lastPageNumber = Number(lastPage)
    const titles: string[] = []
    for (let index = 0; index < lastPageNumber; index++) {
      const titlesFromOperaHouse = await crawler(getOpUrl(index));
      titles.push(...titlesFromOperaHouse);
    }

    const titlesFromCityOfSydney = await crawler(url);
    titles.push(...titlesFromCityOfSydney)

    return NextResponse.json({ titles });
  } catch (error) {
    console.error('Error in API:', error);  }
}


