import axios from 'axios'

export const API = axios.create({ baseURL: 'http://127.0.0.1:8000' })

// ── Hotel Search & Import ─────────────────────────────────────────────────────
export const searchHotels = async (query: string) => {
  const res = await fetch(
    `http://127.0.0.1:8000/external/serpapi/search-hotels?query=${encodeURIComponent(query + ' Turkey')}`
  )
  return res.json()
}

export const importReviews = async (
  hotelName: string, dataId: string, googleRating?: number,
  latitude?: number, longitude?: number, placeId?: string, address?: string
) => {
  const params = new URLSearchParams({ hotel_name: hotelName, data_id: String(dataId), max_reviews: '100' })
  if (googleRating != null) params.append('google_rating', String(googleRating))
  if (latitude    != null) params.append('latitude',      String(latitude))
  if (longitude   != null) params.append('longitude',     String(longitude))
  if (placeId)             params.append('place_id',      placeId)
  if (address)             params.append('address',       address)
  const res = await fetch(`http://127.0.0.1:8000/external/serpapi/import-reviews?${params}`, { method: 'POST' })
  return res.json()
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardSummary = async (hotelId?: number) => {
  const url = hotelId ? `/dashboard/summary?hotel_id=${hotelId}` : '/dashboard/summary'
  const res = await API.get(url)
  return res.data
}

export const getTrendData = async (hotelId?: number, groupBy = 'monthly', timeRange = 'all') => {
  const params = new URLSearchParams({ group_by: groupBy, time_range: timeRange })
  if (hotelId) params.append('hotel_id', String(hotelId))
  const res = await API.get(`/dashboard/trend?${params}`)
  return res.data
}

export const getReviewsTable = async (opts: {
  hotelId?: number; search?: string; sentiment?: string; page?: number; pageSize?: number
} = {}) => {
  const { hotelId, search = '', sentiment, page = 1, pageSize = 15 } = opts
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (hotelId)  params.append('hotel_id',  String(hotelId))
  if (search)   params.append('search',    search.trim())
  if (sentiment) params.append('sentiment', sentiment)
  const res = await API.get(`/dashboard/reviews?${params}`)
  return res.data
}

export const getNlpSummary = async (hotelId?: number) => {
  const url = hotelId ? `/dashboard/nlp-summary?hotel_id=${hotelId}` : '/dashboard/nlp-summary'
  const res = await API.get(url)
  return res.data
}

export const getModelMetrics = async () => {
  const res = await API.get('/dashboard/model-metrics')
  return res.data
}

export const deleteHotel = async (hotelId: number) => {
  const res = await API.delete(`/dashboard/hotel/${hotelId}`)
  return res.data
}

// ── External Ratings ──────────────────────────────────────────────────────────
export const getExternalRatings = async (hotelId: number) => {
  const res = await API.get(`/hotels/${hotelId}/external-ratings`)
  return res.data
}

export const upsertExternalRating = async (hotelId: number, payload: any) => {
  const res = await API.post(`/hotels/${hotelId}/external-ratings`, payload)
  return res.data
}

export const deleteExternalRating = async (hotelId: number, platform: string) => {
  const res = await API.delete(`/hotels/${hotelId}/external-ratings/${platform}`)
  return res.data
}

export const autoFetchPlatformRatings = async (hotelId: number) => {
  const res = await API.post(`/hotels/${hotelId}/fetch-platform-ratings`)
  return res.data
}

// ── CSV Upload ────────────────────────────────────────────────────────────────
export const uploadCsvReviews = async (hotelId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`http://127.0.0.1:8000/reviews/upload-csv?hotel_id=${hotelId}`, {
    method: 'POST', body: form,
  })
  return res.json()
}

export const uploadMultiSourceCsv = async (hotelId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`http://127.0.0.1:8000/reviews/upload-multi-source-csv?hotel_id=${hotelId}`, {
    method: 'POST', body: form,
  })
  return res.json()
}

// ── Hotels CRUD ───────────────────────────────────────────────────────────────
export const getHotels = async () => {
  const res = await API.get('/hotels/')
  return res.data
}
