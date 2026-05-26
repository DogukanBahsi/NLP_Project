import { useEffect, useState, useRef, Component } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  searchHotels,
  importReviews,
  getDashboardSummary,
  getTrendData,
  getReviewsTable,
  getModelMetrics,
  deleteHotel
} from "./api";

// --- SVG Icons ---
const SearchIcon = () => (
  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
);
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const MessageSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

// --- Trend Chart Helpers ---
const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function formatPeriod(period) {
  if (!period) return period;
  if (period.includes("W")) {
    const [year, week] = period.split("-W");
    return `H${parseInt(week)} '${year.slice(2)}`;
  }
  if (period.length === 7) {
    const [year, month] = period.split("-");
    return `${TR_MONTHS[parseInt(month) - 1]} ${year}`;
  }
  if (period.length === 10) {
    const [, month, day] = period.split("-");
    return `${parseInt(day)} ${TR_MONTHS[parseInt(month) - 1]}`;
  }
  return period;
}

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", padding: "12px", borderRadius: "8px", color: "#F8FAFC", minWidth: 160 }}>
      <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{formatPeriod(label)}</p>
      {payload.map((p) => p.value != null && (
        <p key={p.dataKey} style={{ margin: "2px 0", color: p.stroke || p.color }}>
          {p.name}: {p.dataKey === "avg_score" ? `${p.value} / 10` : p.value}
        </p>
      ))}
    </div>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ color: "#EF4444", marginBottom: 12 }}>Bir hata oluştu.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: "8px 20px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [bertStatus, setBertStatus] = useState(null);
  const [hotelQuery, setHotelQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const [trendData, setTrendData] = useState([]);
  const [trendGroupBy, setTrendGroupBy] = useState("monthly");
  const [currentHotelId, setCurrentHotelId] = useState(null);
  const [reviewsData, setReviewsData] = useState({ total: 0, page: 1, page_size: 15, total_pages: 1, items: [] });
  const [reviewSearchInput, setReviewSearchInput] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewSentimentFilter, setReviewSentimentFilter] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const searchDropdownRef = useRef(null);

  const loadDashboard = async (hotelId = null) => {
    setCurrentHotelId(hotelId);
    setSentimentFilter(null);
    setReviewSentimentFilter(null);
    setReviewSearchInput("");
    setReviewSearch("");
    setReviewPage(1);
    try {
      const dashboardData = await getDashboardSummary(hotelId);
      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard hatası:", err);
    }
  };

  const loadTrendData = async (hotelId, groupBy, timeRangeKey) => {
    const timeRangeMap = { all: "all", weekly: "last_week", monthly: "last_month", yearly: "last_year" };
    try {
      const result = await getTrendData(hotelId, groupBy, timeRangeMap[timeRangeKey] || "all");
      setTrendData(result);
    } catch (err) {
      console.error("Trend verisi hatası:", err);
    }
  };

  const loadReviewsTable = async (hotelId, search, sentiment, page) => {
    setIsTableLoading(true);
    try {
      const result = await getReviewsTable({ hotelId, search, sentiment, page, pageSize: 15 });
      setReviewsData(result);
    } catch (err) {
      console.error("Yorum tablosu hatası:", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await getModelMetrics();
      setMetrics(metricsData);
    } catch (err) {
      setMetrics(null);
    }
  };

  const handleSearch = async () => {
    if (!hotelQuery.trim()) { alert("Lütfen otel adı giriniz"); return; }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const result = await searchHotels(hotelQuery);
      setSearchResults(result.results || []);
    } catch (err) {
      console.error(err);
      alert("Arama sırasında hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportReviews = async (hotel) => {
    setShowDropdown(false);
    setLoadingImport(true);
    try {
      const result = await importReviews(hotel.title, hotel.data_id, hotel.rating);
      alert(result.message);
      if (result.hotel_id) {
        await loadDashboard(result.hotel_id);
      } else {
        await loadDashboard();
      }
    } catch (err) {
      console.error("Yorum çekme hatası:", err);
      alert("Yorumlar çekilirken hata oluştu.");
    } finally {
      setLoadingImport(false);
    }
  };

  const handleDeleteHotel = async (e, hotelId) => {
    e.stopPropagation();
    if (window.confirm("Bu oteli ve tüm yorumlarını silmek istediğinize emin misiniz?")) {
      try {
        await deleteHotel(hotelId);
        loadDashboard(null);
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Otel silinirken hata oluştu.");
      }
    }
  };

  useEffect(() => { loadDashboard(); loadMetrics(); }, []);

  // BERT readiness badge
  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(r => r.json())
      .then(d => setBertStatus(d.bert_ready ? "ready" : "loading"))
      .catch(() => setBertStatus("loading"));
  }, []);

  // Click-outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadTrendData(currentHotelId, trendGroupBy, timeFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHotelId, trendGroupBy, timeFrame]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReviewSearch(reviewSearchInput);
      setReviewPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [reviewSearchInput]);

  useEffect(() => {
    loadReviewsTable(currentHotelId, reviewSearch, reviewSentimentFilter, reviewPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHotelId, reviewSearch, reviewSentimentFilter, reviewPage]);

  if (!data) return (
    <div className="app-container" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="loader" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
    </div>
  );

  const ALL_SENTIMENT = [
    { name: "Pozitif", key: "pozitif", value: data.sentiment_distribution?.pozitif || 0,      color: "#10B981" },
    { name: "Negatif", key: "negatif", value: data.sentiment_distribution?.negatif || 0,      color: "#EF4444" },
    { name: "Nötr",   key: "nötr",    value: data.sentiment_distribution?.["nötr"] || 0, color: "#F59E0B" },
  ];
  const sentimentData = ALL_SENTIMENT.filter(d => d.value > 0);
  const BAR_COLOR = "#3B82F6";

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const total = sentimentData.reduce((s, d) => s + d.value, 0);
    const pct = total > 0 ? Math.round((payload[0].value / total) * 100) : 0;
    return (
      <div style={{ background: "#1E293B", border: "1px solid #334155", padding: "12px", borderRadius: "8px", color: "#F8FAFC" }}>
        <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].payload.color }}>{payload[0].value} yorum — %{pct}</p>
      </div>
    );
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1E293B", border: "1px solid #334155", padding: "12px", borderRadius: "8px", color: "#F8FAFC" }}>
        <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, color: BAR_COLOR }}>{payload[0].value} şikayet</p>
      </div>
    );
  };

  const handlePieClick = (entry) =>
    setSentimentFilter(prev => prev === entry.key ? null : entry.key);

  const filteredRiskReviews = sentimentFilter
    ? (data.high_risk_reviews || []).filter(r => r.sentiment === sentimentFilter)
    : (data.high_risk_reviews || []);

  const PRIORITY_CONFIG = {
    acil:   { label: "ACİL",   bg: "rgba(239,68,68,0.15)",   border: "#EF4444", color: "#EF4444",  dot: "#EF4444" },
    yüksek: { label: "YÜKSEK", bg: "rgba(245,158,11,0.15)",  border: "#F59E0B", color: "#F59E0B",  dot: "#F59E0B" },
    normal: { label: "NORMAL", bg: "rgba(59,130,246,0.12)",  border: "#3B82F6", color: "#60A5FA",  dot: "#3B82F6" },
  };

  // Trend: convert avg_score 0 → null so the line shows gaps instead of zeros
  const processedTrendData = trendData.map(d => ({
    ...d,
    avg_score: d.avg_score > 0 ? d.avg_score : null,
  }));
  const validScoreEntries = trendData.filter(d => d.avg_score > 0);
  const avgTrend = validScoreEntries.length > 0
    ? (validScoreEntries.reduce((s, d) => s + d.avg_score, 0) / validScoreEntries.length).toFixed(2)
    : "—";

  return (
    <ErrorBoundary>
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", padding: 8, borderRadius: 12 }}>
            <ActivityIcon />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
            HotelReview<span className="text-accent">AI</span>
          </h2>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p className="kpi-title" style={{ marginBottom: 16 }}>ANALİZ EDİLEN OTEL</p>
          {data.analyzed_hotels && data.analyzed_hotels.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                className="glass-panel"
                style={{ padding: 12, cursor: "pointer", borderLeft: !data.selected_hotel ? "4px solid var(--accent-primary)" : "4px solid transparent", transition: "all 0.2s" }}
                onClick={() => loadDashboard(null)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BuildingIcon />
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Tüm Oteller (Genel Özet)</span>
                </div>
              </div>
              {data.analyzed_hotels.map((h, i) => (
                <div
                  key={i}
                  className="glass-panel"
                  style={{ padding: 12, cursor: "pointer", borderLeft: data.selected_hotel?.id === h.id ? "4px solid var(--accent-primary)" : "4px solid transparent", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onClick={() => loadDashboard(h.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <BuildingIcon />
                    <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{h.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHotel(e, h.id)}
                    style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px" }}
                    title="Oteli Sil"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Henüz analiz edilmiş bir otel bulunmuyor.</p>
          )}
        </div>

        {/* Bottom: BERT status + Model metrics */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: bertStatus === "ready" ? "#10B981" : "#F59E0B",
              boxShadow: bertStatus === "ready" ? "0 0 6px #10B981, 0 0 12px #10B98170" : "0 0 6px #F59E0B, 0 0 12px #F59E0B70",
              animation: "neonPulse 2s ease-in-out infinite",
            }}></div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              BERT&nbsp;
              {bertStatus === null
                ? "kontrol ediliyor..."
                : bertStatus === "ready"
                ? <span style={{ color: "#10B981", fontWeight: 600 }}>✓ Hazır</span>
                : <span style={{ color: "#F59E0B", fontWeight: 600 }}>⏳ Yükleniyor</span>}
            </span>
          </div>

          {metrics && (
            <div>
              <p className="kpi-title" style={{ marginBottom: 12 }}>MODEL BAŞARISI</p>
              <div className="glass-panel" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Accuracy</span>
                  <span style={{ fontWeight: 600, color: "var(--positive)" }}>{metrics.accuracy}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>F1 Score</span>
                  <span style={{ fontWeight: 600, color: "var(--positive)" }}>{metrics.f1_score}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header / Search */}
        <header className="search-container animate-fade-in delay-1">
          <div className="search-input-wrapper" ref={searchDropdownRef}>
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              placeholder="Otel adı girin (Örn: Rixos Antalya)..."
              value={hotelQuery}
              onChange={(e) => setHotelQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showDropdown && (
              <div className="search-results">
                {isSearching ? (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Aranıyor...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((hotel, index) => (
                    <div key={index} className="search-result-item" onClick={() => handleImportReviews(hotel)}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{hotel.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          ⭐ {hotel.rating || "-"} | {hotel.reviews || 0} yorum
                        </div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                        İçe Aktar
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Sonuç bulunamadı.</div>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            Ara
          </button>
        </header>

        {loadingImport && (
          <div className="glass-panel animate-fade-in" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, background: "rgba(59, 130, 246, 0.1)", borderColor: "var(--accent-primary)" }}>
            <div className="loader"></div>
            <span style={{ color: "var(--accent-secondary)", fontWeight: 500 }}>Yorumlar çekiliyor ve NLP modeliyle analiz ediliyor. Lütfen bekleyin...</span>
          </div>
        )}

        {/* Hero — Genel Memnuniyet Skoru */}
        {data.total_reviews > 0 && (() => {
          const score = data.average_satisfaction_score;
          const G =
            score >= 8   ? { grade: "A", label: "Mükemmel",  desc: "Misafir memnuniyeti üst düzeyde",         color: "#10B981", gradEnd: "#059669", bg: "rgba(16,185,129,0.07)"  } :
            score >= 6.5 ? { grade: "B", label: "İyi",        desc: "Genel memnuniyet tatmin edici",           color: "#06B6D4", gradEnd: "#0891B2", bg: "rgba(6,182,212,0.07)"   } :
            score >= 5   ? { grade: "C", label: "Orta",       desc: "İyileştirme alanları mevcut",             color: "#F59E0B", gradEnd: "#D97706", bg: "rgba(245,158,11,0.07)"  } :
            score >= 3   ? { grade: "D", label: "Zayıf",      desc: "Öncelikli aksiyon gerekmektedir",         color: "#F97316", gradEnd: "#EA580C", bg: "rgba(249,115,22,0.07)"  } :
                           { grade: "F", label: "Kritik",     desc: "Kapsamlı yeniden yapılanma gerekli",      color: "#EF4444", gradEnd: "#DC2626", bg: "rgba(239,68,68,0.07)"   };
          const tot = data.total_reviews;
          const pos = data.sentiment_distribution?.pozitif || 0;
          const neg = data.sentiment_distribution?.negatif || 0;
          const neu = data.sentiment_distribution?.["nötr"] || 0;
          return (
            <div className="glass-panel animate-fade-in delay-2" style={{ padding: "22px 28px", marginBottom: 20, background: G.bg, border: `1px solid ${G.color}28` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>

                {/* Score number */}
                <div style={{ textAlign: "center", minWidth: 88 }}>
                  <div style={{ fontSize: "3rem", fontWeight: 800, color: G.color, lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>/ 10</div>
                </div>

                <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.1)", flexShrink: 0 }}></div>

                {/* Grade + progress */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontSize: "1rem", fontWeight: 800, background: G.color, color: "#fff",
                      padding: "2px 12px", borderRadius: 7,
                      boxShadow: `0 0 12px ${G.color}90, 0 0 24px ${G.color}40`
                    }}>{G.grade}</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{G.label}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>— {G.desc}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(100, score * 10)}%`, height: "100%",
                      background: `linear-gradient(90deg, ${G.color}, ${G.gradEnd})`,
                      borderRadius: 99, transition: "width 0.7s ease"
                    }}></div>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>
                    {data.selected_hotel ? data.selected_hotel.name : "Tüm Oteller"} • {tot} yorum analiz edildi
                  </div>
                </div>

                <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.08)", flexShrink: 0 }}></div>

                {/* Sentiment breakdown */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[{ label: "Pozitif", v: pos, c: "#10B981" }, { label: "Negatif", v: neg, c: "#EF4444" }, { label: "Nötr", v: neu, c: "#F59E0B" }].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.c }}>{tot > 0 ? Math.round(s.v / tot * 100) : 0}%</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>({s.v})</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          );
        })()}

        {/* Dashboard Grid */}
        <section className="dashboard-grid animate-fade-in delay-2">
          <div className="kpi-card glass-panel">
            <div className="kpi-icon"><MessageSquareIcon /></div>
            <div>
              <div className="kpi-title">Toplam Yorum</div>
              <div className="kpi-value">{data.total_reviews}</div>
            </div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--positive)" }}><StarIcon /></div>
            <div>
              <div className="kpi-title">Ortalama Memnuniyet</div>
              <div className="kpi-value">{data.average_satisfaction_score} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 10</span></div>
            </div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}><AlertCircleIcon /></div>
            <div>
              <div className="kpi-title">Riskli Yorum Oranı</div>
              <div className="kpi-value">
                {data.total_reviews > 0 ? Math.round(((data.sentiment_distribution?.negatif || 0) / data.total_reviews) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="kpi-card glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>RAPOR ZAMAN ARALIĞI</label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}
              >
                <option value="all" style={{ background: "#1e293b" }}>Tüm Zamanlar</option>
                <option value="weekly" style={{ background: "#1e293b" }}>Son 1 Hafta</option>
                <option value="monthly" style={{ background: "#1e293b" }}>Son 1 Ay</option>
                <option value="yearly" style={{ background: "#1e293b" }}>Son 1 Yıl</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => window.open(`http://127.0.0.1:8000/reports/pdf?time_frame=${timeFrame}${data.selected_hotel ? '&hotel_id=' + data.selected_hotel.id : ''}`)}>
              <DownloadIcon /> Rapor İndir (PDF)
            </button>
          </div>

          {/* Charts */}
          <div className="chart-card glass-panel">
            <h3 className="chart-title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              Duygu Dağılımı
              {sentimentFilter && (
                <button
                  onClick={() => setSentimentFilter(null)}
                  style={{ fontSize: "0.78rem", background: "rgba(239,68,68,0.15)", border: "1px solid #EF4444", color: "#EF4444", padding: "2px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
                >
                  ✕ {sentimentFilter} filtresi kaldır
                </button>
              )}
            </h3>
            <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    onClick={handlePieClick}
                    style={{ cursor: "pointer" }}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={sentimentFilter && sentimentFilter !== entry.key ? 0.3 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
              {ALL_SENTIMENT.filter(s => s.value > 0).map((item) => (
                <div
                  key={item.key}
                  onClick={() => handlePieClick(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    opacity: sentimentFilter && sentimentFilter !== item.key ? 0.4 : 1,
                    transition: "opacity 0.2s"
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color }}></div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card glass-panel">
            <h3 className="chart-title">En Çok Şikayet Edilen Konular</h3>
            <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_issue_categories || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="category" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart — ComposedChart with avg_score secondary axis */}
          <div className="list-card glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <h3 className="chart-title" style={{ margin: 0 }}>Yorum Trendi</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {[["daily", "Günlük"], ["weekly", "Haftalık"], ["monthly", "Aylık"]].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTrendGroupBy(key)}
                    style={{
                      padding: "5px 14px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                      background: trendGroupBy === key ? "var(--accent-primary)" : "rgba(255,255,255,0.07)",
                      color: trendGroupBy === key ? "white" : "var(--text-secondary)",
                      border: trendGroupBy === key ? "1px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.1)",
                      transition: "all 0.2s"
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {processedTrendData.length > 1 ? (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedTrendData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="gradNeu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="period" tickFormatter={formatPeriod} stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} stroke="var(--text-muted)" tick={{ fill: "#60A5FA", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<TrendTooltip />} />
                    <Legend formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{value}</span>} />
                    <Area yAxisId="left" type="monotone" dataKey="positive" name="Pozitif" stroke="#10B981" fill="url(#gradPos)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Area yAxisId="left" type="monotone" dataKey="negative" name="Negatif" stroke="#EF4444" fill="url(#gradNeg)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Area yAxisId="left" type="monotone" dataKey="neutral" name="Nötr" stroke="#F59E0B" fill="url(#gradNeu)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Line yAxisId="right" type="monotone" dataKey="avg_score" name="Ort. Memnuniyet" stroke="#60A5FA" strokeDasharray="5 3" strokeWidth={2} dot={false} connectNulls={true} activeDot={{ r: 4, strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {trendData.length === 0
                  ? "Grafik için yorum tarihi bulunamadı."
                  : "Grafik için en az 2 farklı dönem gerekiyor."}
              </div>
            )}

            {trendData.length > 0 && (
              <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Dönem: <strong style={{ color: "var(--text-secondary)" }}>
                    {trendData.length} {trendGroupBy === "daily" ? "gün" : trendGroupBy === "weekly" ? "hafta" : "ay"}
                  </strong>
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Toplam: <strong style={{ color: "var(--text-secondary)" }}>
                    {trendData.reduce((s, d) => s + d.total, 0)} yorum
                  </strong>
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Ort. Memnuniyet: <strong style={{ color: "#10B981" }}>
                    {avgTrend}{avgTrend !== "—" ? " / 10" : ""}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Kaynak Bazlı Memnuniyet Dağılımı */}
          {data.source_analysis && data.source_analysis.length > 0 && (
            <div className="list-card glass-panel">
              <h3 className="chart-title">Kaynak Bazlı Memnuniyet Dağılımı</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.source_analysis} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="source" stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    <Legend formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{value}</span>} />
                    <Bar dataKey="positive" name="Pozitif" stackId="a" fill="#10B981" />
                    <Bar dataKey="negative" name="Negatif" stackId="a" fill="#EF4444" />
                    <Bar dataKey="neutral" name="Nötr" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
                {data.source_analysis.map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>{s.source}</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.total_reviews} yorum · {s.average_score}/10 ort.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div className="list-card glass-panel">
            <h3 className="chart-title">Kurumsal Aksiyon Planı</h3>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "rgba(59,130,246,0.08)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.2)", marginBottom: 20 }}>
              <span style={{ marginTop: 1, flexShrink: 0, color: "#60A5FA" }}><AlertCircleIcon /></span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>{data.weekly_action_plan}</span>
            </div>

            {data.action_plan && data.action_plan.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {data.action_plan.map((item, i) => {
                  const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.normal;
                  return (
                    <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: cfg.color, background: `rgba(0,0,0,0.25)`, border: `1px solid ${cfg.border}`, padding: "3px 10px", borderRadius: 6 }}>
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {item.category}
                        </span>
                        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {item.complaint_count} şikayet
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: "0.97rem", color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
                        {item.description}
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px 0", display: "flex", flexDirection: "column", gap: 6 }}>
                        {item.steps.map((step, si) => (
                          <li key={si} style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: 7 }}></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Sorumlu: <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{item.department}</span>
                        </span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: cfg.color }}>
                          ⏱ {item.timeframe}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Aksiyon planı oluşturmak için yeterli şikayet verisi bulunmuyor.
              </p>
            )}
          </div>

          {/* Risk Reviews */}
          <div className="list-card glass-panel" style={{ marginBottom: 40 }}>
            <h3 className="chart-title" style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <AlertCircleIcon /> En Riskli Yorumlar
              {sentimentFilter && (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>
                  — {sentimentFilter} filtresi aktif
                </span>
              )}
            </h3>
            {filteredRiskReviews.length > 0 ? (
              filteredRiskReviews.map((r, i) => (
                <div key={i} className="risk-item">
                  <div className="risk-item-header">
                    <span className="risk-category">{r.issue_category ? r.issue_category.toUpperCase() : "GENEL"}</span>
                    <span className="risk-score">Risk Skoru: {r.risk_score}</span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 12 }}>
                    "{r.comment}"
                  </p>
                  {r.action_suggestion && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--warning)" }}>Öneri:</span> {r.action_suggestion}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)" }}>
                {sentimentFilter
                  ? `"${sentimentFilter}" kategorisinde riskli yorum bulunamadı.`
                  : "Analiz edilmiş riskli yorum bulunamadı."}
              </p>
            )}
          </div>

          {/* Tüm Yorumlar Tablosu */}
          <div className="list-card glass-panel" style={{ marginBottom: 40 }}>
            <h3 className="chart-title">Tüm Yorumlar</h3>

            {/* Arama + Filtre */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                value={reviewSearchInput}
                onChange={e => setReviewSearchInput(e.target.value)}
                placeholder="Yorumlarda ara..."
                style={{
                  flex: 1, minWidth: 200, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "8px 14px", color: "var(--text-primary)", fontSize: "0.88rem", outline: "none"
                }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[null, "pozitif", "negatif", "nötr"].map(key => (
                  <button
                    key={key ?? "all"}
                    onClick={() => { setReviewSentimentFilter(key); setReviewPage(1); }}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                      transition: "all 0.2s",
                      background: reviewSentimentFilter === key
                        ? (key === "pozitif" ? "rgba(16,185,129,0.25)" : key === "negatif" ? "rgba(239,68,68,0.25)" : key === "nötr" ? "rgba(245,158,11,0.25)" : "rgba(59,130,246,0.25)")
                        : "rgba(255,255,255,0.06)",
                      color: reviewSentimentFilter === key
                        ? (key === "pozitif" ? "#10B981" : key === "negatif" ? "#EF4444" : key === "nötr" ? "#F59E0B" : "#60A5FA")
                        : "var(--text-secondary)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    {key === null ? "Tümü" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tablo */}
            {isTableLoading ? (
              <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
                <div className="loader"></div>
              </div>
            ) : reviewsData.items.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.87rem" }}>
                  <thead>
                    <tr>
                      {["Otel", "Yorum", "Duygu", "Kategori", "Risk", "Kaynak", "Tarih"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.76rem", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsData.items.map((r, i) => {
                      const sentColor = r.sentiment === "pozitif" ? "#10B981" : r.sentiment === "negatif" ? "#EF4444" : "#F59E0B";
                      const sentBg   = r.sentiment === "pozitif" ? "rgba(16,185,129,0.12)" : r.sentiment === "negatif" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)";
                      const riskColor = (r.risk_score || 0) >= 6 ? "#EF4444" : (r.risk_score || 0) >= 4 ? "#F59E0B" : "#10B981";
                      const srcLabel = r.source === "serpapi" ? "SerpAPI" : r.source === "csv" ? "CSV" : "Manuel";
                      const srcColor = r.source === "serpapi" ? "#8B5CF6" : r.source === "csv" ? "#06B6D4" : "#64748B";
                      const srcBg    = r.source === "serpapi" ? "rgba(139,92,246,0.15)" : r.source === "csv" ? "rgba(6,182,212,0.15)" : "rgba(100,116,139,0.15)";
                      return (
                        <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                          <td style={{ padding: "9px 12px", color: "var(--text-muted)", fontSize: "0.83rem", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }} title={r.hotel_name}>{r.hotel_name}</td>
                          <td style={{ padding: "9px 12px", color: "var(--text-secondary)", maxWidth: 320 }} title={r.comment}>
                            {r.comment.length > 110 ? r.comment.slice(0, 110) + "…" : r.comment}
                          </td>
                          <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, background: sentBg, color: sentColor }}>{r.sentiment}</span>
                          </td>
                          <td style={{ padding: "9px 12px", color: "var(--text-muted)", fontSize: "0.83rem", whiteSpace: "nowrap" }}>{r.issue_category}</td>
                          <td style={{ padding: "9px 12px", fontWeight: 700, color: riskColor, whiteSpace: "nowrap" }}>{r.risk_score ?? "—"}</td>
                          <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: "0.75rem", fontWeight: 600, background: srcBg, color: srcColor }}>{srcLabel}</span>
                          </td>
                          <td style={{ padding: "9px 12px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{r.review_date || r.created_at || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "20px 0", textAlign: "center" }}>
                {reviewSearch ? `"${reviewSearch}" için yorum bulunamadı.` : "Henüz yorum bulunmuyor."}
              </p>
            )}

            {/* Sayfalama */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                Toplam <strong style={{ color: "var(--text-secondary)" }}>{reviewsData.total}</strong> yorum
                {reviewsData.total_pages > 1 && ` — Sayfa ${reviewsData.page} / ${reviewsData.total_pages}`}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {[["← Önceki", -1], ["Sonraki →", 1]].map(([lbl, dir]) => {
                  const disabled = dir === -1 ? reviewPage <= 1 : reviewPage >= (reviewsData.total_pages || 1);
                  return (
                    <button
                      key={lbl}
                      disabled={disabled}
                      onClick={() => setReviewPage(p => p + dir)}
                      style={{
                        padding: "6px 16px", borderRadius: 8, fontSize: "0.83rem", cursor: disabled ? "default" : "pointer",
                        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                        color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
                        border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s"
                      }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
    </ErrorBoundary>
  );
}
