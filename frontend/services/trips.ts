import { authenticatedRequest } from "@/lib/auth/session";
import type {
  ListTripsResponse,
  GetTripResponse,
  CreateTripResponse,
  CreateItineraryItemResponse,
  GenericResponse,
  CreateTripRequest,
  CreateItineraryItemRequest,
} from "@/types/trip";

export async function listTrips() {
  const res = await authenticatedRequest<ListTripsResponse>("/trips", {
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
