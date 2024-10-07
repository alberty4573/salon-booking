

export default async function EventScreen() {

    fetch('https://api.vercel.app/blog').then((res) => console.log
    ("data", res.json()) );

    
    
    return (
        <div>
          <h1>Scraped Quotes</h1>
          <ul>
            {/* {data.map((item, index) => (
              <li key={index}>
                <p>"{item.text}"</p>
                <p>— {item.author}</p>
              </li>
            ))} */}
          </ul>
        </div>
      );
}