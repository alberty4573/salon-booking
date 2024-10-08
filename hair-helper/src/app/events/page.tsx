'use client'

import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())


export default function EventScreen() {
    const { data, error } = useSWR('http://localhost:3000/api/scraper', fetcher)

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>
        
    return (
        <div>
          <h1>{`Here's a list of events: `}</h1>
          <ul>
            {data.titles.map((item, index) => (
              <li key={index}>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      );
}