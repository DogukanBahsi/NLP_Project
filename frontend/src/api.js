import axios from "axios";

export const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

export const searchHotels = async (query) => {
  const fixedQuery = `${query} Turkey hotel`;
  const res = await fetch(
    `http://127.0.0.1:8000/external/serpapi/search-hotels?query=${encodeURIComponent(fixedQuery)}`
  );
  return res.json();
};

export const importReviews = async (hotelName, dataId, googleRating) => {
  const url = `http://127.0.0.1:8000/external/serpapi/import-reviews?hotel_name=${encodeURIComponent(
    hotelName
  )}&data_id=${encodeURIComponent(dataId)}&max_reviews=100${googleRating ? `&google_rating=${googleRating}` : ""}`;
  const res = await fetch(url, { method: "POST" });
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
