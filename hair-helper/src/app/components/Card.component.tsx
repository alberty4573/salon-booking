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
  const handleCardClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card 
      style={{ 
        width: '350px', 
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onPress={handleCardClick}
      isPressable
    >
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
        <p>
          <strong>End Date:</strong> {endDate || 'N/A'}
        </p>
      </CardBody>
    </Card>
  )
}
