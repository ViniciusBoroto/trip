import { authenticatedRequest } from "@/lib/auth/session";
import type {
  ListTripsResponse,
  GetTripResponse,
  CreateTripResponse,
  CreateItineraryItemResponse,
  GenericResponse,
  CreateTripRequest,
  CreateItineraryItemRequest,
  UpdateTripRequest,
  UpdateItineraryItemRequest,
  UpdateTripResponse,
  UpdateItineraryItemResponse,
  TripQuery,
} from "@/types/trip";

export async function listTrips(query?: TripQuery) {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.category) params.set("category", query.category);
  if (query?.page) params.set("page", String(query.page));
  if (query?.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  const url = `/trips${qs ? `?${qs}` : ""}`;
  const res = await authenticatedRequest<ListTripsResponse>(url, {
    method: "GET",
  });
  return res;
}

export async function getTrip(tripId: string) {
  const res = await authenticatedRequest<GetTripResponse>(`/trips/${tripId}`, {
    method: "GET",
  });
  return res;
}

export async function createTrip(payload: CreateTripRequest) {
  const res = await authenticatedRequest<CreateTripResponse>("/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateTrip(tripId: string, payload: UpdateTripRequest) {
  const res = await authenticatedRequest<UpdateTripResponse>(`/trips/${tripId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateItineraryItem(tripId: string, itemId: string, payload: UpdateItineraryItemRequest) {
  const res = await authenticatedRequest<UpdateItineraryItemResponse>(`/trips/${tripId}/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteTrip(tripId: string) {
  const res = await authenticatedRequest<GenericResponse>(`/trips/${tripId}`, {
    method: "DELETE",
  });
  return res;
}

export async function addItineraryItem(tripId: string, payload: CreateItineraryItemRequest) {
  const res = await authenticatedRequest<CreateItineraryItemResponse>(`/trips/${tripId}/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function removeItineraryItem(tripId: string, itemId: string) {
  const res = await authenticatedRequest<GenericResponse>(`/trips/${tripId}/items/${itemId}`, {
    method: "DELETE",
  });
  return res;
}
