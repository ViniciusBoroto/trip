"use client";

import { useEffect, useRef, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

const CATEGORIES = ["Beach", "City", "Adventure", "Cultural", "Business", "Road-trip"];

type TripFiltersProps = {
  search: string;
  category: string;
  onChange: (filters: { search: string; category: string }) => void;
};

export function TripFilters({ search, category, onChange }: TripFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      onChange({ search: searchInput, category: categoryRef.current });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function handleCategoryChange(newCategory: string) {
    onChange({ search: searchInput, category: newCategory });
  }

  function handleClear() {
    setSearchInput("");
    onChange({ search: "", category: categoryRef.current });
  }

  return (
    <div className="d-flex flex-column flex-md-row gap-3 mb-4">
      <div className="input-group flex-grow-1" style={{ maxWidth: "320px" }}>
        <span className="input-group-text bg-white">
          <IconSearch size={16} className="text-secondary" />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search trips..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <IconX size={16} />
          </button>
        )}
      </div>
      <div className="d-flex flex-wrap gap-1 align-items-center">
        <button
          type="button"
          className={`btn btn-sm ${!category ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => handleCategoryChange("")}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm text-capitalize ${category === cat.toLowerCase() ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => handleCategoryChange(cat.toLowerCase())}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
