import { NextResponse} from 'next/server'
import { crawler } from './crawler';

export async function GET(
) {


  const  url  = 'https://whatson.cityofsydney.nsw.gov.au/venues/sydney-opera-house';

  try {
    const titles = await crawler(url);
    return NextResponse.json({ titles });
  } catch (error) {
    console.error('Error in API:', error);  }
}


