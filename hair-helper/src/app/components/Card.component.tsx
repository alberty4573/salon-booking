import { Card, CardBody } from '@heroui/react'

export const EventCard = ({
  title,
  category,
  url,
  startDate,
  endDate,
  venue,
}: {
  title: string
  category: string
  url: string
  startDate?: string
  endDate?: string
  venue?: string
}) => {
  return (
    <Card style={{ width: '350px' }}>
      <CardBody>
        <h2>{title}</h2>
        <p>
          <strong>Category:</strong> {category || 'N/A'}
        </p>

        <p>
          <strong>Venue:</strong> {venue || 'N/A'}
        </p>
        <p>
          <strong>Start Date:</strong> {startDate || 'N/A'}
        </p>
        {/* <p><strong>End Date:</strong> {endDate || 'N/A'}</p>   */}
        <p>
          <strong>URL:</strong>{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </p>
      </CardBody>
    </Card>
  )
}
