import { crawler } from '../../../lib/crawler';
import type { NextApiRequest, NextApiResponse } from 'next';

import { NextResponse } from "next/server";

type Data = {
  titles?: string[];
  error?: string;
};

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {

  const url  = 'https://whatson.cityofsydney.nsw.gov.au/venues/sydney-opera-house';

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'URL parameter is required and must be a string.' });
    return;
  }

  try {
    const titles = await crawler(url);
    return NextResponse.json({ titles });
  } catch (error: any) {
    console.error('Error in API:', error.message);
    res.status(500).json({ error: error.message });
  }
}

