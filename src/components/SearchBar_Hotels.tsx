import React, { useState } from "react";
import { DatePicker, Input, InputNumber, Button, Space } from "antd";
import dayjs from "dayjs";
import SearchResults_Hotels from "./SearchResults_Hotels";

const { RangePicker } = DatePicker;

const SearchBar_Hotels: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [personNumber, setPersonNumber] = useState<number>(1);
  const [roomNumber, setRoomNumber] = useState<number>(1);
  type SearchParams = {
    country: string;
    city: string;
    startDate: string | null;
    endDate: string | null;
    personNumber: number;
    roomNumber: number;
  };

  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = () => {
    setSearchParams({
      country,
      city,
      startDate: dates ? dates[0].format("YYYY-MM-DD") : null,
      endDate: dates ? dates[1].format("YYYY-MM-DD") : null,
      personNumber,
      roomNumber,
    });
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Input
          placeholder="Enter Country"
          style={{ width: "100%" }}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <Input
          placeholder="Enter City"
          style={{ width: "100%" }}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <RangePicker
          style={{ width: "100%" }}
          onChange={(values) => setDates(values as [dayjs.Dayjs, dayjs.Dayjs])}
        />

        <InputNumber
          min={1}
          max={10}
          defaultValue={1}
          style={{ width: "100%" }}
          placeholder="Number of Persons"
          onChange={(value) => setPersonNumber(value as number)}
        />

        <InputNumber
          min={1}
          max={10}
          defaultValue={1}
          style={{ width: "100%" }}
          placeholder="Number of Rooms"
          onChange={(value) => setRoomNumber(value as number)}
        />

        <Button type="primary" block onClick={handleSearch}>
          Search Hotels
        </Button>
      </Space>

      {searchParams && <SearchResults_Hotels searchParams={searchParams} />}
    </div>
  );
};

export default SearchBar_Hotels;
