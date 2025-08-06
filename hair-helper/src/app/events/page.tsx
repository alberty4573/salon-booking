'use client'

import useSWR, { Fetcher } from 'swr'
import { StandardEvent } from '../api/types/event'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { EventCard } from '../components/Card.component'

interface GroupedEvents {
  [key: string]: StandardEvent[]
}

const fetcher: Fetcher<{ events: StandardEvent[] }> = (
  ...args: [RequestInfo, RequestInit?]
) => fetch(...args).then((res) => res.json())

// Utility functions for date handling and grouping
const parseEventDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null

  // Handle different date formats
  const cleanDate = dateString.trim()

  // Try parsing as-is first
  const date = new Date(cleanDate)
  if (!isNaN(date.getTime())) return date

  // Handle "DD MMM YYYY" format (e.g., "16 Jul 2025")
  const dayMonthYear = cleanDate.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/)
  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const monthIndex = monthNames.indexOf(month)
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, parseInt(day))
    }
  }

  // Handle date ranges like "16 Jul - 19 Sep 2025" - extract just the first date
  const dateRange = cleanDate.match(
    /(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/,
  )
  if (dateRange) {
    const [, startPart, endPart] = dateRange
    // Extract year from end date
    const yearMatch = endPart.match(/\d{4}/)
    if (yearMatch) {
      const year = yearMatch[0]
      const startWithYear = `${startPart} ${year}`
      return parseEventDate(startWithYear)
    }
  }

  return null
}

// Parse end date from date strings that might contain ranges
const parseEventEndDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null

  const cleanDate = dateString.trim()

  // Handle date ranges like "16 Jul - 19 Sep 2025" - extract the end date
  const dateRange = cleanDate.match(
    /(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/,
  )
  if (dateRange) {
    const [, , endPart] = dateRange
    return parseEventDate(endPart)
  }

  // If it's not a range, treat it as both start and end date
  return parseEventDate(dateString)
}

const getMonthKey = (date: Date): string => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const eventMonth = date.getMonth()
  const eventYear = date.getFullYear()

  if (eventYear === currentYear && eventMonth === currentMonth) {
    return 'This month'
  } else if (eventYear === currentYear && eventMonth === currentMonth + 1) {
    return 'Next month'
  } else if (eventYear === currentYear && eventMonth === currentMonth - 1) {
    return 'Last month'
  } else {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return eventYear === currentYear
      ? monthNames[eventMonth]
      : `${monthNames[eventMonth]} ${eventYear}`
  }
}

const groupEventsByMonth = (events: StandardEvent[]): GroupedEvents => {
  const grouped: GroupedEvents = {}

  events.forEach((event) => {
    let startDate: Date | null = null
    let endDate: Date | null = null

    // Parse start date
    if (event.startDate) {
      startDate = parseEventDate(event.startDate)
    }

    // Parse end date
    if (event.endDate) {
      endDate = parseEventDate(event.endDate)
    }

    // If start date contains a range, extract the end date from it
    if (event.startDate && !endDate) {
      const endFromStart = parseEventEndDate(event.startDate)
      if (endFromStart) {
        endDate = endFromStart
      }
    }

    // If we have at least one valid date, determine which months this event should appear in
    if (startDate || endDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

      // Determine the effective start and end dates
      let effectiveStart: Date
      let effectiveEnd: Date

      if (startDate && endDate) {
        // Both dates available - use the full range, but only show future/current events
        effectiveStart = startDate
        effectiveEnd = endDate
      } else if (startDate) {
        // Only start date - assume it's a single day event
        effectiveStart = startDate
        effectiveEnd = startDate
      } else if (endDate) {
        // Only end date - show from today until end date (or start from a reasonable past date)
        effectiveStart = new Date(
          endDate.getFullYear(),
          endDate.getMonth() - 1,
          1,
        ) // Start from previous month
        effectiveEnd = endDate
      } else {
        // This shouldn't happen given our check above, but just in case
        effectiveStart = today
        effectiveEnd = today
      }

      // Skip events that have completely ended (end date is before today)
      if (effectiveEnd < today) {
        return
      }

      // For ongoing events, start from today if the event started in the past
      if (effectiveStart < today && effectiveEnd >= today) {
        effectiveStart = today
      }

      // Generate all months between start and end dates
      const monthsToInclude = getMonthsBetweenDates(
        effectiveStart,
        effectiveEnd,
      )

      monthsToInclude.forEach((monthKey) => {
        if (!grouped[monthKey]) {
          grouped[monthKey] = []
        }
        grouped[monthKey].push(event)
      })
    } else {
      // No valid dates - put in "Date TBD"
      const monthKey = 'Date TBD'
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(event)
    }
  })

  // Sort events within each group by start date
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const dateA = parseEventDate(a.startDate)
      const dateB = parseEventDate(b.startDate)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      return dateA.getTime() - dateB.getTime()
    })
  })

  return grouped
}

// Helper function to get all months between two dates
const getMonthsBetweenDates = (startDate: Date, endDate: Date): string[] => {
  const months: string[] = []
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (current <= end) {
    const monthKey = getMonthKey(current)
    if (!months.includes(monthKey)) {
      months.push(monthKey)
    }
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

const sortGroupKeys = (groups: GroupedEvents): string[] => {
  const keys = Object.keys(groups)
  const now = new Date()

  return keys.sort((a, b) => {
    // Define priority order
    const priority: { [key: string]: number } = {
      'Last month': 1,
      'This month': 2,
      'Next month': 3,
    }

    if (priority[a] && priority[b]) {
      return priority[a] - priority[b]
    }
    if (priority[a]) return -1
    if (priority[b]) return 1

    // For other months, sort by actual date
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const getDateFromKey = (key: string): Date => {
      if (key === 'Date TBD') return new Date(9999, 11, 31) // Put TBD at the end

      // Handle "Month Year" format
      const parts = key.split(' ')
      if (parts.length === 2) {
        const monthIndex = monthNames.indexOf(parts[0])
        return new Date(parseInt(parts[1]), monthIndex, 1)
      }

      // Handle just month name (current year)
      const monthIndex = monthNames.indexOf(key)
      if (monthIndex !== -1) {
        return new Date(now.getFullYear(), monthIndex, 1)
      }

      return new Date(9999, 11, 31) // Default to end if can't parse
    }

    return getDateFromKey(a).getTime() - getDateFromKey(b).getTime()
  })
}

export default function EventScreen() {
  const [categories, setCategories] = useState<string[]>([])
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({})
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  const { data, error, isLoading } = useSWR<{ events: StandardEvent[] }>(
    'api/scraper',
    fetcher,
  )

  // dropdown selected category value
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys],
  )

  const getCategories = useMemo(
    () => (events: StandardEvent[]) => {
      const tempCategories: string[] = []
      events.forEach((event) => {
        if (!tempCategories.includes(event.category)) {
          tempCategories.push(event.category)
        }
      })
      setCategories(tempCategories)
      return tempCategories
    },
    [],
  )

  const sortData = useMemo(
    () => (events: StandardEvent[]) => {
      const filteredItems = events.filter((event) =>
        selectedValue.includes(event.category),
      )

      // Group the filtered events by month
      const grouped = groupEventsByMonth(filteredItems)
      setGroupedEvents(grouped)

      return filteredItems
    },
    [selectedValue],
  )

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Check on mount
    checkMobile()

    // Add event listener for resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isLoading && data) {
      getCategories(data.events)
    }

    if (data && selectedValue) {
      sortData(data.events)
    } else if (data) {
      // Group all events by month when no filter is applied
      const grouped = groupEventsByMonth(data.events)
      setGroupedEvents(grouped)
    }
  }, [isLoading, data, selectedValue, getCategories, sortData])

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const CategoryFilter = () => {
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered">
            {selectedValue || 'All Categories'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="multiple"
          closeOnSelect={false}
          selectedKeys={selectedKeys}
          onSelectionChange={(value) => {
            setSelectedKeys(value as unknown as string[])
          }}
        >
          {categories.map((category) => {
            return <DropdownItem key={category}>{category}</DropdownItem>
          })}
        </DropdownMenu>
      </Dropdown>
    )
  }

  // Get sorted month keys for display
  const sortedMonthKeys = sortGroupKeys(groupedEvents)

  return (
    <div
      style={{
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      <div>
        <h1>{`To Customise your experience:`}</h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <p>{`I would like to see: `}</p>
          <CategoryFilter />
        </div>
      </div>
      <div style={{ paddingTop: 20 }}>
        <h1>{`Here's a list of events:`}</h1>
        {sortedMonthKeys.length > 0 ? (
          sortedMonthKeys.map((monthKey) => (
            <div key={monthKey} style={{ marginBottom: '40px' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  borderBottom: '2px solid #e0e0e0',
                  paddingBottom: '10px',
                  textAlign: 'left',
                }}
              >
                {monthKey} ({groupedEvents[monthKey].length} events)
              </h2>
              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '16px',
                  listStyle: 'none',
                  padding: 0,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                }}
              >
                {groupedEvents[monthKey].map(
                  (item: StandardEvent, index: number) => {
                    // Check if this event spans multiple months
                    const startDate = parseEventDate(item.startDate)
                    const endDate =
                      parseEventEndDate(item.startDate) ||
                      parseEventDate(item.endDate)
                    const isMultiMonth =
                      startDate &&
                      endDate &&
                      (startDate.getMonth() !== endDate.getMonth() ||
                        startDate.getFullYear() !== endDate.getFullYear())

                    return (
                      <div
                        key={`${monthKey}-${index}`}
                        style={{ position: 'relative' }}
                      >
                        {isMultiMonth && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              zIndex: 1,
                            }}
                          >
                            Multi-month
                          </div>
                        )}
                        <EventCard
                          title={item.title}
                          category={item.category}
                          url={item.url}
                          startDate={item.startDate}
                          endDate={item.endDate}
                          venue={item.venue}
                        />
                      </div>
                    )
                  },
                )}
              </ul>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
