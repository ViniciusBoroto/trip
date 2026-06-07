"use client";

import { useState, type FormEvent } from "react";
import { IconCalendar, IconPlus, IconX } from "@tabler/icons-react";
import type { CreateTripRequest, Trip } from "@/types/trip";

type TripFormProps = {
  onSubmit: (data: CreateTripRequest) => Promise<void>;
  onClose: () => void;
  trip?: Trip;
};

const CATEGORIES = [
  { value: "beach", label: "Beach" },
  { value: "city", label: "City Break" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural & Heritage" },
  { value: "business", label: "Business" },
  { value: "road-trip", label: "Road Trip" },
  { value: "other", label: "Other" },
];

export function TripForm({ onSubmit, onClose, trip }: TripFormProps) {
  const isEdit = !!trip;
  const [name, setName] = useState(trip?.name ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [photo, setPhoto] = useState(trip?.photo ?? "");
  const [category, setCategory] = useState(trip?.category ?? "other");
  const [bookingReference, setBookingReference] = useState(trip?.bookingReference ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [importantNotes, setImportantNotes] = useState(trip?.importantNotes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Trip name is required.");
      return;
    }
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (!endDate) {
      setError("End date is required.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before or equal to end date.");
      return;
    }
    if (!isEdit && new Date(startDate) < new Date(today)) {
      setError("Start date cannot be in the past.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        startDate,
        endDate,
        photo: photo.trim() || null,
        category,
        bookingReference: bookingReference.trim() || null,
        description: description.trim() || null,
        importantNotes: importantNotes.trim() || null,
      });

      if (!isEdit) {
        setName("");
        setStartDate("");
        setEndDate("");
        setPhoto("");
        setCategory("other");
        setBookingReference("");
        setDescription("");
        setImportantNotes("");
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the trip.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header d-flex align-items-center justify-content-between p-3">
        <h3 className="card-title h3 mb-0">{isEdit ? "Edit Trip" : "Plan a New Trip"}</h3>
        <button
          type="button"
          className="btn btn-icon btn-sm btn-ghost-secondary"
          onClick={onClose}
          aria-label="Close form"
        >
          <IconX size={18} />
        </button>
      </div>

      <div className="card-body p-3">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger p-2 mb-3 small" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="trip-name" className="form-label required small">
              Trip Name
            </label>
            <input
              id="trip-name"
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g., Summer Holiday in Rome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label htmlFor="start-date" className="form-label required small">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                className="form-control form-control-sm"
                min={isEdit ? undefined : today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="col-6">
              <label htmlFor="end-date" className="form-label required small">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                className="form-control form-control-sm"
                min={isEdit ? undefined : today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label htmlFor="category" className="form-label small">
                Category
              </label>
              <select
                id="category"
                className="form-select form-select-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label htmlFor="booking-ref" className="form-label small">
                Booking Reference
              </label>
              <input
                id="booking-ref"
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g., LH12345, HTL-99"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="photo-url" className="form-label small">
              Photo URL
            </label>
            <input
              id="photo-url"
              type="url"
              className="form-control form-control-sm"
              placeholder="e.g., https://images.unsplash.com/photo-..."
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label small">
              Description
            </label>
            <textarea
              id="description"
              className="form-control form-control-sm"
              rows={2}
              placeholder="A brief overview of the trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="important-notes" className="form-label small">
              Important Notes
            </label>
            <textarea
              id="important-notes"
              className="form-control form-control-sm"
              rows={2}
              placeholder="Packing lists, emergency contacts, reminders..."
              value={importantNotes}
              onChange={(e) => setImportantNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
              disabled={loading}
            >
              <IconPlus size={14} />
              <span>{loading ? "Saving..." : isEdit ? "Save Changes" : "Add Trip"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
