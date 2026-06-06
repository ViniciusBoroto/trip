"use client";

import { useState, useEffect, type FormEvent } from "react";
import { IconPlus } from "@tabler/icons-react";
import type { CreateItineraryItemRequest } from "@/types/trip";

type ItineraryItemFormProps = {
  minDate: string;
  maxDate: string;
  onSubmit: (data: CreateItineraryItemRequest) => Promise<void>;
};

const ITINERARY_TYPES = [
  { value: "flight", label: "Flight" },
  { value: "hotel", label: "Hotel / Lodging" },
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "activity", label: "Activity" },
  { value: "transport", label: "Transport / Car" },
  { value: "other", label: "Other / Note" },
];

export function ItineraryItemForm({ minDate, maxDate, onSubmit }: ItineraryItemFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("activity");

  useEffect(() => {
    if (minDate && !date) {
      setDate(`${minDate}T12:00`);
    }
  }, [minDate, date]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        date,
        type,
      });

      // Reset form fields
      setName("");
      setDate(minDate ? `${minDate}T12:00` : "");
      setType("activity");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not add itinerary item.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow-sm border-0 bg-light-lt">
      <div className="card-body p-3">
        <h4 className="card-title h4 mb-3">Add Itinerary Item</h4>

        <form onSubmit={handleSubmit} className="row g-2 align-items-end">
          {error && (
            <div className="col-12">
              <div className="alert alert-danger py-1 px-2 mb-2 small" role="alert">
                {error}
              </div>
            </div>
          )}

          <div className="col-md-5 col-12">
            <label htmlFor="item-name" className="form-label small mb-1">
              Event / Item Name
            </label>
            <input
              id="item-name"
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g., Dinner at Osteria, Flight to Rome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="col-md-3 col-6">
            <label htmlFor="item-date" className="form-label small mb-1">
              Date & Time
            </label>
            <input
              id="item-date"
              type="datetime-local"
              className="form-control form-control-sm"
              min={minDate ? `${minDate}T00:00` : undefined}
              max={maxDate ? `${maxDate}T23:59` : undefined}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="col-md-2 col-6">
            <label htmlFor="item-type" className="form-label small mb-1">
              Type
            </label>
            <select
              id="item-type"
              className="form-select form-select-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              {ITINERARY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 col-12 text-end">
            <button
              type="submit"
              className="btn btn-sm btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1"
              disabled={loading}
            >
              <IconPlus size={14} />
              <span>{loading ? "Adding..." : "Add"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
