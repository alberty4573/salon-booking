"use client";

import useSWR, { Fetcher } from "swr";
import { StandardEvent } from "../api/types/event";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";

const fetcher: Fetcher<{ events: StandardEvent[] }> = (
  ...args: [RequestInfo, RequestInit?]
) => fetch(...args).then((res) => res.json());

export default function EventScreen() {
  const [categories, setCategories] = useState<string[]>([])

  const [sortedData, setSortedData] = useState<StandardEvent[]>([])

  const [selectedKeys, setSelectedKeys] = useState([]);

  const { data, error, isLoading } = useSWR<{ events: StandardEvent[] }>(
    "api/scraper",
    fetcher
  );

    // dropdown selected category value
    const selectedValue = useMemo(
      () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
      [selectedKeys]
    );

    const sortData = (events: StandardEvent[]) => {
      const filteredItems = events.filter(event => selectedValue.includes(event.category));
      setSortedData(filteredItems)
      return filteredItems
    }

  useEffect(() => {
    if (!isLoading && data) {
      getCategories(data.events)
    }

    if (data && selectedValue) {
      sortData(data.events)
    } else if (data) {
      setSortedData(data?.events)
    }
  }, [isLoading, data, selectedValue])


  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;


  const getCategories = (events: StandardEvent[]) => {
    const tempCategories: string[] = []
    events.forEach((event) => {
      if (!tempCategories.includes(event.category)) {
        tempCategories.push(event.category);
      }
    })
    setCategories(tempCategories)
    return categories
  }



  const CategoryFilter = () => {
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered">{selectedValue}</Button>
        </DropdownTrigger>
        <DropdownMenu 
          selectionMode="multiple"
          closeOnSelect= {false}
          selectedKeys= {selectedKeys}
          onSelectionChange={(value) => {
            setSelectedKeys(value)
          }}
          >
          {categories.map((category) => {
          return <DropdownItem key={category}>{category}</DropdownItem>
          })
          }
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <div
      style={{
        alignItems: "center",
        alignContent: "center",
        textAlign: "center",
      }}
    >
      <div>
        <h1>{`To Customise your experience:`}</h1>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <p>{`I would like to see: `}</p>
          <CategoryFilter />
        </div>
      </div>
      <div style={{paddingTop: 20}}>
        <h1>{`Here's a list of events:`}</h1>
        <ul>
          {sortedData.map((item: StandardEvent, index: number) => (
            <li key={index}>
              <a target="_blank" href={item.url}>
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
