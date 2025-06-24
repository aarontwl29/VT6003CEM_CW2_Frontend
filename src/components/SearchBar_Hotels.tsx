import React, { useState } from "react";
import { DatePicker, Input, InputNumber, Button, Spin } from "antd";
import dayjs from "dayjs";
import SearchResults_Hotels from "./SearchResults_Hotels";
import type { SearchResultsProps } from "./SearchResults_Hotels";

const { RangePicker } = DatePicker;

const SearchBar_Hotels: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [personNumber, setPersonNumber] = useState<number | undefined>(
    undefined
  );
  const [roomNumber, setRoomNumber] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  type SearchParams = {
    country: string | undefined;
    city: string | undefined;
    startDate: string | null;
    endDate: string | null;
    personNumber: number | undefined;
    roomNumber: number | undefined;
  };

  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = () => {
    console.log("Search Parameters:", {
      country,
      city,
      dates,
      personNumber,
      roomNumber,
    });

    setSearchParams({
      country: country || undefined,
      city: city || undefined,
      startDate: dates ? dates[0].format("YYYY-MM-DD") : null,
      endDate: dates ? dates[1].format("YYYY-MM-DD") : null,
      personNumber: personNumber || undefined,
      roomNumber: roomNumber || undefined,
    });

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        border: "2px solid orange",
        borderRadius: "6px",
        padding: "10px",
        background: "#fff",
      }}
    >
      <Input
        placeholder="Country"
        style={{ width: "150px" }}
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      <Input
        placeholder="City"
        style={{ width: "150px" }}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <RangePicker
        style={{ width: "250px" }}
        onChange={(values) => setDates(values as [dayjs.Dayjs, dayjs.Dayjs])}
      />

      <InputNumber
        min={1}
        max={10}
        value={personNumber}
        style={{ width: "120px" }}
        placeholder="Persons"
        onChange={(value) => setPersonNumber(value as number)}
      />

      <InputNumber
        min={1}
        max={10}
        value={roomNumber}
        style={{ width: "120px" }}
        placeholder="Rooms"
        onChange={(value) => setRoomNumber(value as number)}
      />

      <Button type="primary" onClick={handleSearch}>
        Search Hotels
      </Button>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin tip="Loading results..." />
        </div>
      )}

      {searchParams && !loading && (
        <div style={{ width: "100%", marginTop: "20px" }}>
          {}
          <SearchResults_Hotels
            searchParams={searchParams as SearchResultsProps["searchParams"]}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar_Hotels;
