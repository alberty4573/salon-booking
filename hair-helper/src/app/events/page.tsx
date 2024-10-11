'use client'

import useSWR, { Fetcher } from 'swr'
import { StandardEvent } from '../api/types/event'

const fetcher: Fetcher<StandardEvent[]> = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then((res) => res.json())

export default function EventScreen() {

    const { data, error } = useSWR<StandardEvent[]>('api/scraper', fetcher)

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div>
          <h1>{`Here's a list of events: `}</h1>
          <ul>
            {data.events.map((item: StandardEvent, index: number) => (
              <li key={index}>
                <a target="_blank" href={item.url}>{item.title}</a>
              </li>
            ))}
          </ul>
        </div>
      );
}