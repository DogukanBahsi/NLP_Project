import axios from "axios";

export const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

export const searchHotels = async (query) => {
  // "Turkey hotel" suffix yerine sadece "Turkey" — "hotel" kelimesi Google Maps'te
  // filtreyi bozabiliyor; hl/gl backend'de ayarlandığından konum yeterli.
  const fixedQuery = `${query} Turkey`;
  const res = await fetch(
    `http://127.0.0.1:8000/external/serpapi/search-hotels?query=${encodeURIComponent(fixedQuery)}`
  );
  return res.json();
};

export const importReviews = async (hotelName, dataId, googleRating, latitude, longitude, placeId, address) => {
  const params = new URLSearchParams({ hotel_name: hotelName, data_id: String(dataId), max_reviews: 100 });
  if (googleRating != null)  params.append("google_rating", googleRating);
  if (latitude != null)      params.append("latitude",      latitude);
  if (longitude != null)     params.append("longitude",     longitude);
  if (placeId)               params.append("place_id",      placeId);
  if (address)               params.append("address",       address);
  const res = await fetch(`http://127.0.0.1:8000/external/serpapi/import-reviews?${params}`, { method: "POST" });
  return res.json();
};

export const getDashboardSummary = async (hotelId = null) => {
  const url =
    hotelId === null ? "/dashboard/summary" : `/dashboard/summary?hotel_id=${hotelId}`;
  const res = await API.get(url);
  return res.data;
};

export const getModelMetrics = async () => {
  const res = await API.get("/dashboard/model-metrics");
  return res.data;
};

export const deleteHotel = async (hotelId) => {
  const res = await API.delete(`/dashboard/hotel/${hotelId}`);
  return res.data;
};

export const getTrendData = async (hotelId = null, groupBy = "monthly", timeRange = "all") => {
  const params = new URLSearchParams({ group_by: groupBy, time_range: timeRange });
  if (hotelId !== null) params.append("hotel_id", hotelId);
  const res = await API.get(`/dashboard/trend?${params.toString()}`);
  return res.data;
};

export const getReviewsTable = async ({
  hotelId = null,
  search = "",
  sentiment = null,
  page = 1,
  pageSize = 15,
} = {}) => {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (hotelId !== null) params.append("hotel_id", hotelId);
  if (search && search.trim()) params.append("search", search.trim());
  if (sentiment) params.append("sentiment", sentiment);
  const res = await API.get(`/dashboard/reviews?${params.toString()}`);
  return res.data;
};

export const getNlpSummary = async (hotelId = null) => {
  const params = hotelId !== null ? `?hotel_id=${hotelId}` : "";
  const res = await API.get(`/dashboard/nlp-summary${params}`);
  return res.data;
};

export const uploadCsvReviews = async (hotelId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `http://127.0.0.1:8000/reviews/upload-csv?hotel_id=${hotelId}`,
    { method: "POST", body: formData }
  );
  return res.json();
};

export const uploadMultiSourceCsv = async (hotelId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `http://127.0.0.1:8000/reviews/upload-multi-source-csv?hotel_id=${hotelId}`,
    { method: "POST", body: formData }
  );
  return res.json();
};

export const getAvailableSources = async () => {
  const res = await API.get("/dashboard/sources");
  return res.data;
};

// ── Dış Platform Puanları ──────────────────────────────────────────────────
export const getExternalRatings = async (hotelId) => {
  const res = await API.get(`/hotels/${hotelId}/external-ratings`);
  return res.data;
};

export const upsertExternalRating = async (hotelId, payload) => {
  const res = await API.post(`/hotels/${hotelId}/external-ratings`, payload);
  return res.data;
};

export const deleteExternalRating = async (hotelId, platform) => {
  const res = await API.delete(`/hotels/${hotelId}/external-ratings/${platform}`);
  return res.data;
};

export const getPlatformList = async () => {
  const res = await API.get("/hotels/external-ratings/platforms");
  return res.data;
};

export const autoFetchPlatformRatings = async (hotelId) => {
  const res = await API.post(`/hotels/${hotelId}/fetch-platform-ratings`);
  return res.data;
};
