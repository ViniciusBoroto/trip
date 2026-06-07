export type ItineraryItem = {
  id: string;
  name: string;
  date: string;
  type: string;
};

export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  photo: string | null;
  category: string | null;
  bookingReference: string | null;
  description: string | null;
  importantNotes: string | null;
  itinerary: ItineraryItem[];
};

export type CreateTripRequest = {
  name: string;
  startDate: string;
  endDate: string;
  photo?: string | null;
  category?: string | null;
  bookingReference?: string | null;
  description?: string | null;
  importantNotes?: string | null;
};

export type CreateItineraryItemRequest = {
  name: string;
  date: string;
  type: string;
};

export type TripQuery = {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};

export type ListTripsResponse = {
  ok: boolean;
  trips: Trip[];
  total: number;
  page: number;
  pageSize: number;
  message?: string;
};

export type GetTripResponse = {
  ok: boolean;
  trip: Trip;
  message?: string;
};

export type CreateTripResponse = {
  ok: boolean;
  trip: Trip;
  message?: string;
};

export type CreateItineraryItemResponse = {
  ok: boolean;
  item: ItineraryItem;
  message?: string;
};

export type GenericResponse = {
  ok: boolean;
  message: string;
};
