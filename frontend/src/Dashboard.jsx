import { useEffect, useState, useRef, Component } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  ComposedChart, Area, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from "recharts";
import {
  searchHotels, importReviews, getDashboardSummary,
  getTrendData, getReviewsTable, getModelMetrics,
  deleteHotel, getNlpSummary, uploadMultiSourceCsv,
  getAvailableSources,
  getExternalRatings, upsertExternalRating, deleteExternalRating, getPlatformList,
  autoFetchPlatformRatings,
} from "./api";

// ─── SVG Icons ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>
);
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const MessageSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

// ─── Trend helpers ────────────────────────────────────────────────────────────
const TR_MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
function formatPeriod(p) {
  if (!p) return p;
  if (p.includes("W")) { const [y,w]=p.split("-W"); return `H${parseInt(w)} '${y.slice(2)}`; }
  if (p.length===7) { const [y,m]=p.split("-"); return `${TR_MONTHS[parseInt(m)-1]} ${y}`; }
  if (p.length===10) { const [,m,d]=p.split("-"); return `${parseInt(d)} ${TR_MONTHS[parseInt(m)-1]}`; }
  return p;
}
const TrendTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#1E293B",border:"1px solid #334155",padding:"12px",borderRadius:"8px",color:"#F8FAFC",minWidth:160}}>
      <p style={{margin:"0 0 8px",fontWeight:600}}>{formatPeriod(label)}</p>
      {payload.map(p => p.value!=null && (
        <p key={p.dataKey} style={{margin:"2px 0",color:p.stroke||p.color}}>
          {p.name}: {p.dataKey==="avg_score"?`${p.value}/10`:p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props){super(props);this.state={hasError:false};}
  static getDerivedStateFromError(){return{hasError:true};}
  render(){
    if(this.state.hasError) return (
      <div style={{padding:40,textAlign:"center"}}>
        <h2 style={{color:"#EF4444",marginBottom:12}}>Bir hata oluştu.</h2>
        <button onClick={()=>this.setState({hasError:false})} style={{padding:"8px 20px",borderRadius:8,background:"#EF4444",color:"#fff",border:"none",cursor:"pointer",fontWeight:600}}>
          Tekrar Dene
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Score grade config ────────────────────────────────────────────────────────
function gradeConfig(score) {
  if (score>=8)   return {grade:"A",label:"Mükemmel", desc:"Misafir memnuniyeti üst düzeyde",         color:"#10B981",gradEnd:"#059669",bg:"rgba(16,185,129,0.07)"};
  if (score>=6.5) return {grade:"B",label:"İyi",       desc:"Genel memnuniyet tatmin edici",           color:"#06B6D4",gradEnd:"#0891B2",bg:"rgba(6,182,212,0.07)"};
  if (score>=5)   return {grade:"C",label:"Orta",      desc:"İyileştirme alanları mevcut",             color:"#F59E0B",gradEnd:"#D97706",bg:"rgba(245,158,11,0.07)"};
  if (score>=3)   return {grade:"D",label:"Zayıf",     desc:"Öncelikli aksiyon gerekmektedir",         color:"#F97316",gradEnd:"#EA580C",bg:"rgba(249,115,22,0.07)"};
  return              {grade:"F",label:"Kritik",    desc:"Kapsamlı yeniden yapılanma gerekli",      color:"#EF4444",gradEnd:"#DC2626",bg:"rgba(239,68,68,0.07)"};
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  // Core state
  const [data, setData]         = useState(null);
  const [metrics, setMetrics]   = useState(null);
  const [bertStatus, setBertStatus] = useState(null);
  const [activeTab, setActiveTab]   = useState("overview"); // overview | compare | deep

  // Search / import
  const [hotelQuery, setHotelQuery]       = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [isSearching, setIsSearching]     = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [importMode, setImportMode]       = useState("serpapi"); // serpapi | csv
  const [csvFile, setCsvFile]             = useState(null);
  const [csvHotelId, setCsvHotelId]       = useState("");
  const searchDropdownRef = useRef(null);
  const csvInputRef       = useRef(null);

  // Available sources (SourceSelector'dan çekilir)
  const [availableSources, setAvailableSources] = useState([
    {id:"serpapi", label:"Google Maps"},
    {id:"csv",     label:"CSV Yükle"},
  ]);

  // Dashboard filters
  const [sentimentFilter, setSentimentFilter] = useState(null);
  const [timeFrame, setTimeFrame]             = useState("all");
  const [currentHotelId, setCurrentHotelId]   = useState(null);

  // Trend
  const [trendData, setTrendData]     = useState([]);
  const [trendGroupBy, setTrendGroupBy] = useState("monthly");

  // Dış Platform Puanları
  const [extRatings, setExtRatings]         = useState([]);
  const [platformList, setPlatformList]     = useState([]);
  const [extModal, setExtModal]             = useState(null); // null | "add" | {edit: rowObj}
  const [extForm, setExtForm]               = useState({platform:"", rating:"", review_count:"", url:""});
  const [extFetching, setExtFetching]       = useState(false);

  // Reviews table
  const [reviewsData, setReviewsData]               = useState({total:0,page:1,page_size:15,total_pages:1,items:[]});
  const [reviewSearchInput, setReviewSearchInput]   = useState("");
  const [reviewSearch, setReviewSearch]             = useState("");
  const [reviewSentimentFilter, setReviewSentimentFilter] = useState(null);
  const [reviewPage, setReviewPage]     = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Drawer
  const [drawerReview, setDrawerReview] = useState(null);

  // Comparison tab
  const [compareHotelA, setCompareHotelA]   = useState(null);
  const [compareHotelB, setCompareHotelB]   = useState(null);
  const [compareDataA, setCompareDataA]     = useState(null);
  const [compareDataB, setCompareDataB]     = useState(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  // Deep analysis tab
  const [nlpSummary, setNlpSummary]         = useState(null);
  const [isLoadingNlp, setIsLoadingNlp]     = useState(false);

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const loadDashboard = async (hotelId = null) => {
    setCurrentHotelId(hotelId);
    setSentimentFilter(null);
    setReviewSentimentFilter(null);
    setReviewSearchInput("");
    setReviewSearch("");
    setReviewPage(1);
    try {
      const d = await getDashboardSummary(hotelId);
      setData(d);
    } catch (err) {
      console.error("Dashboard hatası:", err);
      // API başarısız olsa bile spinner'ın sonsuz dönmesini engelle
      setData({
        selected_hotel: null,
        analyzed_hotels: [],
        total_reviews: 0,
        average_satisfaction_score: 0,
        sentiment_distribution: { pozitif: 0, negatif: 0, "nötr": 0 },
        top_issue_categories: [],
        high_risk_reviews: [],
        weekly_action_plan: "Backend bağlantısı kurulamadı. Sunucunun çalıştığını kontrol edin.",
        action_plan: [],
        source_analysis: [],
      });
    }
    loadExtRatings(hotelId);
  };

  const loadExtRatings = async (hotelId) => {
    if (!hotelId) { setExtRatings([]); return; }
    try { setExtRatings(await getExternalRatings(hotelId)); } catch {}
  };

  const loadTrendData = async (hotelId, groupBy, timeRangeKey) => {
    const map = {all:"all",weekly:"last_week",monthly:"last_month",yearly:"last_year"};
    // Günlük mod → her zaman son 1 ay (30 gün); "all" seçilse bile too many points olur
    const effectiveRange = groupBy === "daily" ? "last_month" : (map[timeRangeKey] || "all");
    try {
      const r = await getTrendData(hotelId, groupBy, effectiveRange);
      setTrendData(r);
    } catch (err) { console.error("Trend hatası:", err); }
  };

  const loadReviewsTable = async (hotelId, search, sentiment, page) => {
    setIsTableLoading(true);
    try {
      const r = await getReviewsTable({hotelId,search,sentiment,page,pageSize:15});
      setReviewsData(r);
    } catch (err) { console.error("Tablo hatası:", err); }
    finally { setIsTableLoading(false); }
  };

  const loadNlpSummary = async (hotelId) => {
    setIsLoadingNlp(true);
    try {
      const s = await getNlpSummary(hotelId);
      setNlpSummary(s);
    } catch (err) { console.error("NLP özet hatası:", err); }
    finally { setIsLoadingNlp(false); }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDashboard();
    getDashboardMetrics();
    // SourceSelector'dan etkin kaynak listesini çek
    getAvailableSources()
      .then(d => {
        const srcs = (d.available || []).filter(s => ["serpapi","csv"].includes(s.id));
        if (srcs.length > 0) setAvailableSources(srcs);
      })
      .catch(() => {}); // fallback → varsayılan liste korunur
    // Dış platform metadata listesi
    getPlatformList().then(setPlatformList).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getDashboardMetrics() {
    try { setMetrics(await (await import("./api")).getModelMetrics()); } catch {}
  }

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(r=>r.json())
      .then(d=>setBertStatus(d.bert_ready?"ready":"loading"))
      .catch(()=>setBertStatus("loading"));
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    loadTrendData(currentHotelId, trendGroupBy, timeFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHotelId, trendGroupBy, timeFrame]);

  useEffect(() => {
    const t = setTimeout(() => { setReviewSearch(reviewSearchInput); setReviewPage(1); }, 350);
    return () => clearTimeout(t);
  }, [reviewSearchInput]);

  useEffect(() => {
    loadReviewsTable(currentHotelId, reviewSearch, reviewSentimentFilter, reviewPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHotelId, reviewSearch, reviewSentimentFilter, reviewPage]);

  // Comparison effect
  useEffect(() => {
    if (!compareHotelA || !compareHotelB) return;
    setIsLoadingCompare(true);
    Promise.all([getDashboardSummary(compareHotelA), getDashboardSummary(compareHotelB)])
      .then(([a, b]) => { setCompareDataA(a); setCompareDataB(b); })
      .catch(() => {})
      .finally(() => setIsLoadingCompare(false));
  }, [compareHotelA, compareHotelB]);

  // NLP summary effect — load when switching to deep tab or hotel changes
  useEffect(() => {
    if (activeTab === "deep") loadNlpSummary(currentHotelId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentHotelId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!hotelQuery.trim()) { alert("Lütfen otel adı giriniz"); return; }
    setIsSearching(true); setShowDropdown(true);
    try {
      const r = await searchHotels(hotelQuery);
      setSearchResults(r.results || []);
    } catch { alert("Arama sırasında hata oluştu."); }
    finally { setIsSearching(false); }
  };

  /** data_id eksik veya "null" string olan sonuçlar organik web sonucudur — yorum çekilemez */
  const isOrganicResult = (hotel) => {
    const id = hotel?.data_id;
    return !id || ["null", "None", "none", "undefined", ""].includes(String(id).trim());
  };

  const handleImportReviews = async (hotel) => {
    // Organik sonuçlar için import engelle
    if (isOrganicResult(hotel)) {
      alert(
        "Bu sonuç bir web sayfasıdır, Google Maps kaydı değil.\n\n" +
        "Yorum çekilebilmesi için listede ⭐ puanı ve yorum sayısı görünen bir otel seçin."
      );
      return;
    }
    setShowDropdown(false); setLoadingImport(true);
    try {
      const r = await importReviews(
        hotel.title, hotel.data_id, hotel.rating,
        hotel.latitude, hotel.longitude, hotel.place_id, hotel.address
      );
      alert(r.message);
      await loadDashboard(r.hotel_id || null);
    } catch { alert("Yorumlar çekilirken hata oluştu."); }
    finally { setLoadingImport(false); }
  };

  const handleCsvUpload = async () => {
    if (!csvFile || !csvHotelId) { alert("Otel seçin ve CSV dosyası ekleyin."); return; }
    setLoadingImport(true);
    try {
      const { uploadMultiSourceCsv } = await import("./api");
      const r = await uploadMultiSourceCsv(csvHotelId, csvFile);
      alert(r.message || "Yükleme tamamlandı.");
      await loadDashboard(parseInt(csvHotelId));
    } catch { alert("CSV yüklenirken hata oluştu."); }
    finally { setLoadingImport(false); setCsvFile(null); }
  };

  const handleDeleteHotel = async (e, hotelId) => {
    e.stopPropagation();
    if (!window.confirm("Bu oteli ve tüm yorumlarını silmek istediğinize emin misiniz?")) return;
    try { await deleteHotel(hotelId); loadDashboard(null); }
    catch { alert("Otel silinirken hata oluştu."); }
  };

  const handleRiskKpiClick = () => {
    setReviewSentimentFilter("negatif");
    setActiveTab("overview");
    setTimeout(() => document.getElementById("reviews-section")?.scrollIntoView({behavior:"smooth"}), 100);
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (!data) return (
    <div className="app-container" style={{alignItems:"center",justifyContent:"center"}}>
      <div className="loader" style={{width:40,height:40,borderWidth:4}}></div>
    </div>
  );

  // ── Derived data ──────────────────────────────────────────────────────────────
  const ALL_SENTIMENT = [
    {name:"Pozitif",key:"pozitif",value:data.sentiment_distribution?.pozitif||0,      color:"#10B981"},
    {name:"Negatif",key:"negatif",value:data.sentiment_distribution?.negatif||0,      color:"#EF4444"},
    {name:"Nötr",   key:"nötr",   value:data.sentiment_distribution?.["nötr"]||0, color:"#F59E0B"},
  ];
  const sentimentData = ALL_SENTIMENT.filter(d=>d.value>0);
  const BAR_COLOR = "#3B82F6";

  const PRIORITY_CONFIG = {
    acil:   {label:"ACİL",   bg:"rgba(239,68,68,0.15)",  border:"#EF4444",color:"#EF4444",dot:"#EF4444"},
    yüksek: {label:"YÜKSEK", bg:"rgba(245,158,11,0.15)", border:"#F59E0B",color:"#F59E0B",dot:"#F59E0B"},
    normal: {label:"NORMAL", bg:"rgba(59,130,246,0.12)", border:"#3B82F6",color:"#60A5FA",dot:"#3B82F6"},
  };

  const processedTrendData = trendData.map(d=>({...d, avg_score: d.avg_score != null && d.avg_score > 0 ? d.avg_score : null}));
  const validScores = trendData.filter(d=>d.avg_score != null && d.avg_score > 0);
  const avgTrend = validScores.length>0
    ? (validScores.reduce((s,d)=>s+d.avg_score,0)/validScores.length).toFixed(2)
    : "—";

  const filteredRiskReviews = sentimentFilter
    ? (data.high_risk_reviews||[]).filter(r=>r.sentiment===sentimentFilter)
    : (data.high_risk_reviews||[]);

  // ── Tooltip helpers ───────────────────────────────────────────────────────────
  const PieTooltip = ({active,payload}) => {
    if (!active||!payload?.length) return null;
    const tot = sentimentData.reduce((s,d)=>s+d.value,0);
    const pct = tot>0?Math.round(payload[0].value/tot*100):0;
    return <div style={{background:"#1E293B",border:"1px solid #334155",padding:"12px",borderRadius:"8px",color:"#F8FAFC"}}>
      <p style={{margin:0,fontWeight:600,marginBottom:4}}>{payload[0].name}</p>
      <p style={{margin:0,color:payload[0].payload.color}}>{payload[0].value} yorum — %{pct}</p>
    </div>;
  };
  const BarTooltip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    return <div style={{background:"#1E293B",border:"1px solid #334155",padding:"12px",borderRadius:"8px",color:"#F8FAFC"}}>
      <p style={{margin:0,fontWeight:600,marginBottom:4}}>{label}</p>
      <p style={{margin:0,color:BAR_COLOR}}>{payload[0].value} şikayet</p>
    </div>;
  };
  const handlePieClick = entry => setSentimentFilter(prev=>prev===entry.key?null:entry.key);

  // ── Comparison helpers ────────────────────────────────────────────────────────
  const CompareScoreBar = ({label, scoreA, scoreB, colorA="#3B82F6", colorB="#8B5CF6"}) => (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>{label}</span>
        <div style={{display:"flex",gap:12}}>
          <span style={{fontSize:"0.82rem",color:colorA,fontWeight:700}}>{scoreA?.toFixed?.(2)||scoreA}</span>
          <span style={{fontSize:"0.82rem",color:colorB,fontWeight:700}}>{scoreB?.toFixed?.(2)||scoreB}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:4,height:8}}>
        <div style={{flex:1,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${Math.min(100,(scoreA||0)*10)}%`,height:"100%",background:colorA,borderRadius:4,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{flex:1,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${Math.min(100,(scoreB||0)*10)}%`,height:"100%",background:colorB,borderRadius:4,transition:"width 0.6s ease"}}/>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
    <div className="app-container">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:40}}>
          <div style={{background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",padding:8,borderRadius:12}}>
            <ActivityIcon/>
          </div>
          <h2 style={{fontSize:"1.2rem",fontWeight:700,letterSpacing:"-0.5px"}}>
            HotelReview<span className="text-accent">AI</span>
          </h2>
        </div>

        {/* Hotel list */}
        <div style={{marginBottom:24}}>
          <p className="kpi-title" style={{marginBottom:12}}>ANALİZ EDİLEN OTEL</p>
          {data.analyzed_hotels?.length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div
                className="glass-panel"
                style={{padding:"10px 12px",cursor:"pointer",borderLeft:!data.selected_hotel?"4px solid var(--accent-primary)":"4px solid transparent",transition:"all 0.2s"}}
                onClick={()=>loadDashboard(null)}
              >
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <BuildingIcon/>
                  <span style={{fontWeight:600,fontSize:"0.9rem"}}>Tüm Oteller</span>
                </div>
              </div>
              {data.analyzed_hotels.map((h,i)=>(
                <div key={i} className="glass-panel" style={{padding:"10px 12px",cursor:"pointer",borderLeft:data.selected_hotel?.id===h.id?"4px solid var(--accent-primary)":"4px solid transparent",transition:"all 0.2s",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>loadDashboard(h.id)}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <BuildingIcon/>
                    <span style={{fontWeight:500,fontSize:"0.88rem"}}>{h.name}</span>
                  </div>
                  <button onClick={e=>handleDeleteHotel(e,h.id)} style={{background:"transparent",border:"none",color:"var(--danger)",cursor:"pointer",padding:"3px"}} title="Sil"><TrashIcon/></button>
                </div>
              ))}
            </div>
          ):(
            <p style={{color:"var(--text-muted)",fontSize:"0.88rem"}}>Henüz otel analiz edilmedi.</p>
          )}
        </div>

        {/* Bottom: BERT + metrics */}
        <div style={{marginTop:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:bertStatus==="ready"?"#10B981":"#F59E0B",boxShadow:bertStatus==="ready"?"0 0 6px #10B981,0 0 12px #10B98170":"0 0 6px #F59E0B,0 0 12px #F59E0B70",animation:"neonPulse 2s ease-in-out infinite"}}></div>
            <span style={{fontSize:"0.76rem",color:"var(--text-muted)"}}>
              BERT&nbsp;
              {bertStatus===null?"kontrol ediliyor...":bertStatus==="ready"?<span style={{color:"#10B981",fontWeight:600}}>✓ Hazır</span>:<span style={{color:"#F59E0B",fontWeight:600}}>⏳ Yükleniyor</span>}
            </span>
          </div>
          {metrics && (
            <div>
              <p className="kpi-title" style={{marginBottom:10}}>MODEL BAŞARISI</p>
              <div className="glass-panel" style={{padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>Accuracy</span>
                  <span style={{fontWeight:700,color:"var(--positive)",fontSize:"0.85rem"}}>{metrics.accuracy}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>F1 Score</span>
                  <span style={{fontWeight:700,color:"var(--positive)",fontSize:"0.85rem"}}>{metrics.f1_score}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Search / Import Bar */}
        <header className="search-container animate-fade-in delay-1">
          {/* Mode toggle — SourceSelector'dan dinamik */}
          <div style={{display:"flex",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>
            {availableSources.map(src=>(
              <button key={src.id} onClick={()=>setImportMode(src.id)} style={{padding:"10px 16px",fontSize:"0.82rem",fontWeight:600,border:"none",cursor:"pointer",transition:"all 0.2s",background:importMode===src.id?"var(--accent-primary)":"rgba(255,255,255,0.05)",color:importMode===src.id?"white":"var(--text-secondary)"}}>
                {src.label}
              </button>
            ))}
          </div>

          {importMode==="serpapi" ? (
            <div className="search-input-wrapper" ref={searchDropdownRef} style={{flex:1}}>
              <SearchIcon/>
              <input type="text" className="search-input" placeholder="Otel adı girin (Örn: Rixos Premium Belek)..." value={hotelQuery}
                onChange={e=>setHotelQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}/>
              {showDropdown && (
                <div className="search-results">
                  {isSearching ? <div style={{padding:16,textAlign:"center",color:"var(--text-muted)"}}>Aranıyor...</div>
                  : searchResults.length>0 ? searchResults.map((hotel,i)=>{
                    const organic = isOrganicResult(hotel);
                    return (
                      <div key={i} className="search-result-item"
                        style={{opacity: organic ? 0.65 : 1, cursor: organic ? "default" : "pointer"}}
                        onClick={()=>!organic && handleImportReviews(hotel)}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,color:"var(--text-primary)",marginBottom:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{wordBreak:"break-word"}}>{hotel.title}</span>
                            {organic && (
                              <span style={{
                                fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.03em",
                                background:"rgba(239,68,68,0.15)",color:"#f87171",
                                border:"1px solid rgba(239,68,68,0.3)",borderRadius:4,
                                padding:"1px 6px",flexShrink:0,whiteSpace:"nowrap"
                              }}>WEB SONUCU</span>
                            )}
                          </div>
                          <div style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>
                            {organic
                              ? <span style={{color:"#f87171"}}>⚠ Yorum çekilemiyor — Google Maps kaydı yok</span>
                              : <>⭐ {hotel.rating||"-"} | {(hotel.reviews||0).toLocaleString()} yorum</>
                            }
                          </div>
                        </div>
                        <button
                          className={organic ? "btn" : "btn btn-secondary"}
                          disabled={organic}
                          style={{
                            padding:"6px 14px",fontSize:"0.82rem",flexShrink:0,
                            opacity: organic ? 0.4 : 1,
                            cursor: organic ? "not-allowed" : "pointer",
                          }}
                          onClick={e=>{e.stopPropagation(); !organic && handleImportReviews(hotel);}}>
                          {organic ? "—" : "İçe Aktar"}
                        </button>
                      </div>
                    );
                  }) : <div style={{padding:16,textAlign:"center",color:"var(--text-muted)"}}>Sonuç bulunamadı.</div>}
                </div>
              )}
            </div>
          ) : (
            <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap",alignItems:"center"}}>
              <select value={csvHotelId} onChange={e=>setCsvHotelId(e.target.value)}
                style={{padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"white",fontSize:"0.88rem",outline:"none",flex:"0 0 200px"}}>
                <option value="">— Otel seçin —</option>
                {data.analyzed_hotels?.map(h=><option key={h.id} value={h.id} style={{background:"#1e293b"}}>{h.name}</option>)}
              </select>
              <label style={{padding:"10px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,cursor:"pointer",fontSize:"0.88rem",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:8}}>
                <UploadIcon/>
                {csvFile ? csvFile.name : "CSV dosyası seçin"}
                <input ref={csvInputRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>setCsvFile(e.target.files?.[0]||null)}/>
              </label>
            </div>
          )}

          <button className="btn btn-primary" onClick={importMode==="serpapi"?handleSearch:handleCsvUpload} style={{flexShrink:0}}>
            {importMode==="serpapi"?"Ara":"Yükle"}
          </button>
        </header>

        {loadingImport && (
          <div className="glass-panel animate-fade-in" style={{padding:14,display:"flex",alignItems:"center",gap:12,background:"rgba(59,130,246,0.1)",borderColor:"var(--accent-primary)"}}>
            <div className="loader"></div>
            <span style={{color:"var(--accent-secondary)",fontWeight:500}}>Yorumlar analiz ediliyor, lütfen bekleyin...</span>
          </div>
        )}

        {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
        <div style={{display:"flex",gap:4,padding:"4px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",width:"fit-content"}}>
          {[
            ["overview","Genel Özet"],
            ["compare","Otel Karşılaştırma"],
            ["deep","Derinlemesine Analiz"],
          ].map(([tab,lbl])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{
              padding:"9px 22px",borderRadius:9,fontSize:"0.88rem",fontWeight:600,border:"none",cursor:"pointer",transition:"all 0.2s",
              background:activeTab===tab?"linear-gradient(135deg,var(--accent-primary),#2563EB)":"transparent",
              color:activeTab===tab?"white":"var(--text-muted)",
              boxShadow:activeTab===tab?"0 2px 8px rgba(37,99,235,0.3)":"none",
            }}>{lbl}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1 — GENEL ÖZET
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab==="overview" && (
        <section className="dashboard-grid animate-fade-in delay-2">

          {/* Hero satisfaction card */}
          {data.total_reviews>0 && (() => {
            const score = data.average_satisfaction_score;
            const G = gradeConfig(score);
            const tot=data.total_reviews;
            const pos=data.sentiment_distribution?.pozitif||0;
            const neg=data.sentiment_distribution?.negatif||0;
            const neu=data.sentiment_distribution?.["nötr"]||0;
            return (
              <div className="glass-panel animate-fade-in" style={{gridColumn:"span 12",padding:"22px 28px",background:G.bg,border:`1px solid ${G.color}28`}}>
                <div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap"}}>
                  <div style={{textAlign:"center",minWidth:88}}>
                    <div style={{fontSize:"3rem",fontWeight:800,color:G.color,lineHeight:1}}>{score}</div>
                    <div style={{fontSize:"0.82rem",color:"var(--text-muted)",marginTop:4}}>/ 10</div>
                  </div>
                  <div style={{width:1,height:56,background:"rgba(255,255,255,0.1)",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <span style={{fontSize:"1rem",fontWeight:800,background:G.color,color:"#fff",padding:"2px 12px",borderRadius:7,boxShadow:`0 0 12px ${G.color}90,0 0 24px ${G.color}40`}}>{G.grade}</span>
                      <span style={{fontSize:"1.1rem",fontWeight:700,color:"var(--text-primary)"}}>{G.label}</span>
                      <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>— {G.desc}</span>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:8,overflow:"hidden"}}>
                      <div style={{width:`${Math.min(100,score*10)}%`,height:"100%",background:`linear-gradient(90deg,${G.color},${G.gradEnd})`,borderRadius:99,transition:"width 0.7s ease"}}/>
                    </div>
                    <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:6}}>
                      {data.selected_hotel?data.selected_hotel.name:"Tüm Oteller"} • {tot} yorum analiz edildi
                    </div>
                  </div>
                  <div style={{width:1,height:56,background:"rgba(255,255,255,0.08)",flexShrink:0}}/>
                  <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                    {[{label:"Pozitif",v:pos,c:"#10B981"},{label:"Negatif",v:neg,c:"#EF4444"},{label:"Nötr",v:neu,c:"#F59E0B"}].map(s=>(
                      <div key={s.label} style={{textAlign:"center"}}>
                        <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c}}>{tot>0?Math.round(s.v/tot*100):0}%</div>
                        <div style={{fontSize:"0.78rem",color:"var(--text-muted)"}}>{s.label}</div>
                        <div style={{fontSize:"0.72rem",color:"var(--text-muted)"}}>({s.v})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* KPI cards */}
          <div className="kpi-card glass-panel">
            <div className="kpi-icon"><MessageSquareIcon/></div>
            <div><div className="kpi-title">Toplam Yorum</div><div className="kpi-value">{data.total_reviews}</div></div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon" style={{background:"rgba(16,185,129,0.1)",color:"var(--positive)"}}><StarIcon/></div>
            <div><div className="kpi-title">Ort. Memnuniyet</div><div className="kpi-value">{data.average_satisfaction_score} <span style={{fontSize:"1rem",color:"var(--text-muted)",fontWeight:500}}>/ 10</span></div></div>
          </div>

          <div className="kpi-card glass-panel" style={{cursor:"pointer"}} onClick={handleRiskKpiClick} title="Negatif yorumları filtrele">
            <div className="kpi-icon" style={{background:"rgba(239,68,68,0.1)",color:"var(--danger)"}}><AlertCircleIcon/></div>
            <div>
              <div className="kpi-title">Riskli Yorum Oranı</div>
              <div className="kpi-value">{data.total_reviews>0?Math.round(((data.sentiment_distribution?.negatif||0)/data.total_reviews)*100):0}%</div>
              <div style={{fontSize:"0.72rem",color:"var(--text-muted)",marginTop:4}}>↗ Tıkla → filtrele</div>
            </div>
          </div>

          <div className="kpi-card glass-panel" style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <label style={{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:600}}>RAPOR ZAMAN ARALIĞI</label>
              <select value={timeFrame} onChange={e=>setTimeFrame(e.target.value)}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"white",padding:"8px",borderRadius:"8px",fontSize:"0.9rem",outline:"none"}}>
                <option value="all" style={{background:"#1e293b"}}>Tüm Zamanlar</option>
                <option value="weekly" style={{background:"#1e293b"}}>Son 1 Hafta</option>
                <option value="monthly" style={{background:"#1e293b"}}>Son 1 Ay</option>
                <option value="yearly" style={{background:"#1e293b"}}>Son 1 Yıl</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={()=>window.open(`http://127.0.0.1:8000/reports/pdf?time_frame=${timeFrame}${data.selected_hotel?'&hotel_id='+data.selected_hotel.id:''}`)}>
              <DownloadIcon/> Rapor İndir (PDF)
            </button>
          </div>

          {/* ── Dış Platform Puanları + Harita ─────────────────────────── */}
          {currentHotelId && (
            <div className="chart-card glass-panel" style={{gridColumn:"1/-1"}}>

              {/* Başlık satırı */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
                <h3 className="chart-title" style={{margin:0}}>Dış Platform Puanları</h3>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn btn-secondary"
                    style={{padding:"6px 14px",fontSize:"0.82rem",display:"flex",alignItems:"center",gap:6,opacity:extFetching?0.6:1}}
                    disabled={extFetching}
                    onClick={async()=>{
                      setExtFetching(true);
                      try {
                        const r = await autoFetchPlatformRatings(currentHotelId);
                        setExtRatings(r.ratings || []);
                        if (r.saved_count === 0) alert("Bu otel için platform puanı bulunamadı. Manuel ekleyebilirsiniz.");
                      } catch { alert("Otomatik getirme başarısız."); }
                      finally { setExtFetching(false); }
                    }}>
                    {extFetching
                      ? <><span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Aranıyor...</>
                      : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:2}}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Otomatik Getir</>
                    }
                  </button>
                  <button className="btn btn-secondary" style={{padding:"6px 14px",fontSize:"0.82rem",display:"flex",alignItems:"center",gap:5}}
                    onClick={()=>{setExtForm({platform:"",rating:"",review_count:"",url:""});setExtModal("add");}}>
                    <span style={{fontSize:"1.1rem",lineHeight:1}}>+</span> Manuel Ekle
                  </button>
                </div>
              </div>

              {/* İki sütun: kartlar | harita */}
              <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>

                {/* ── Platform kartları ── */}
                <div style={{flex:"1 1 400px"}}>
                  {extRatings.length === 0 ? (
                    <div style={{textAlign:"center",color:"var(--text-muted)",padding:"28px 0",fontSize:"0.88rem",background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px dashed rgba(255,255,255,0.1)"}}>
                      <div style={{fontSize:"1.8rem",marginBottom:8}}>🔍</div>
                      Henüz platform puanı yok.<br/>
                      <span style={{fontSize:"0.8rem",opacity:0.7}}>"Otomatik Getir"e tıklayarak TripAdvisor, Booking.com vb. puanları otomatik çekin.</span>
                    </div>
                  ) : (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
                      {extRatings.map(r => {
                        const pct = r.rating != null ? Math.round((r.rating / r.max_rating) * 100) : 0;
                        const barColor = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
                        return (
                          <div key={r.id} style={{
                            background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                            borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",
                          }}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}
                          onClick={()=>{setExtForm({platform:r.platform,rating:r.rating??"",review_count:r.review_count??"",url:r.url??""});setExtModal({edit:r});}}>

                            {/* Platform header */}
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                              <span style={{
                                width:32,height:32,borderRadius:8,background:r.color,flexShrink:0,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:"0.72rem",fontWeight:900,color:"white",letterSpacing:"0.02em",
                              }}>{r.icon}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:700,fontSize:"0.82rem",color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</div>
                                {r.review_count != null && (
                                  <div style={{fontSize:"0.72rem",color:"var(--text-muted)"}}>{r.review_count.toLocaleString("tr-TR")} yorum</div>
                                )}
                              </div>
                              {r.url && (
                                <a href={r.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                                  style={{color:"var(--text-muted)",flexShrink:0,lineHeight:0,opacity:0.7}}
                                  onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                                  onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                              )}
                            </div>

                            {/* Büyük puan */}
                            <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:8}}>
                              <span style={{fontSize:"2rem",fontWeight:900,color:"white",lineHeight:1,letterSpacing:"-0.02em"}}>
                                {r.rating != null ? r.rating.toLocaleString("tr-TR",{minimumFractionDigits:1,maximumFractionDigits:1}) : "—"}
                              </span>
                              <span style={{fontSize:"0.82rem",color:"var(--text-muted)",fontWeight:500}}>
                                /{r.max_rating % 1 === 0 ? r.max_rating.toFixed(0) : r.max_rating}
                              </span>
                            </div>

                            {/* Puan çubuğu */}
                            {r.rating != null && (
                              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:5,overflow:"hidden"}}>
                                <div style={{width:`${pct}%`,height:"100%",background:barColor,borderRadius:99,transition:"width 0.6s ease"}}/>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Harita ── */}
                {data.selected_hotel?.latitude && data.selected_hotel?.longitude ? (
                  <div style={{flex:"0 0 300px",minWidth:260}}>
                    <div style={{
                      borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",
                      position:"relative",
                    }}>
                      {/* Google Maps embed (no API key needed for output=embed) */}
                      <iframe
                        title="Otel konumu"
                        width="100%"
                        height="220"
                        style={{display:"block",border:0}}
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${data.selected_hotel.latitude},${data.selected_hotel.longitude}&z=15&output=embed`}
                      />
                      {/* Haritada aç butonu */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1${data.selected_hotel.place_id ? `&query_place_id=${data.selected_hotel.place_id}` : `&query=${data.selected_hotel.latitude},${data.selected_hotel.longitude}`}`}
                        target="_blank" rel="noreferrer"
                        style={{
                          position:"absolute",bottom:8,right:8,
                          background:"rgba(15,23,42,0.85)",backdropFilter:"blur(4px)",
                          border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,
                          padding:"5px 10px",fontSize:"0.75rem",color:"white",
                          textDecoration:"none",display:"flex",alignItems:"center",gap:5,
                          transition:"background 0.2s",
                        }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.8)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(15,23,42,0.85)"}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Google Maps'te aç
                      </a>
                    </div>
                    {/* Adres */}
                    {data.selected_hotel.address && (
                      <div style={{marginTop:8,fontSize:"0.75rem",color:"var(--text-muted)",lineHeight:1.4,padding:"0 2px"}}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4,verticalAlign:"middle",flexShrink:0}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {data.selected_hotel.address}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* ── Modal ── */}
              {extModal && (
                <div style={{
                  position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:9999,
                  display:"flex",alignItems:"center",justifyContent:"center",padding:16,
                }} onClick={()=>setExtModal(null)}>
                  <div style={{
                    background:"#1E293B",border:"1px solid rgba(255,255,255,0.12)",
                    borderRadius:16,padding:28,width:"100%",maxWidth:420,
                  }} onClick={e=>e.stopPropagation()}>
                    <h3 style={{margin:"0 0 20px",color:"var(--text-primary)",fontSize:"1.05rem"}}>
                      {extModal==="add" ? "Platform Puanı Ekle" : `Düzenle — ${extModal.edit?.label}`}
                    </h3>
                    {extModal==="add" && (
                      <div style={{marginBottom:14}}>
                        <label style={{fontSize:"0.78rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>PLATFORM</label>
                        <select value={extForm.platform} onChange={e=>setExtForm(p=>({...p,platform:e.target.value}))}
                          style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:"0.9rem",outline:"none"}}>
                          <option value="" style={{background:"#1e293b"}}>— Seçin —</option>
                          {platformList.filter(p=>!extRatings.some(r=>r.platform===p.key)).map(p=>(
                            <option key={p.key} value={p.key} style={{background:"#1e293b"}}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:"0.78rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>PUAN</label>
                      <input type="number" min="0" max="10" step="0.1" value={extForm.rating}
                        onChange={e=>setExtForm(p=>({...p,rating:e.target.value}))} placeholder="örn. 4.3"
                        style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:"0.9rem",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:"0.78rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>YORUM SAYISI</label>
                      <input type="number" min="0" value={extForm.review_count}
                        onChange={e=>setExtForm(p=>({...p,review_count:e.target.value}))} placeholder="örn. 599"
                        style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:"0.9rem",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{marginBottom:22}}>
                      <label style={{fontSize:"0.78rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>PLATFORM URL (isteğe bağlı)</label>
                      <input type="url" value={extForm.url}
                        onChange={e=>setExtForm(p=>({...p,url:e.target.value}))} placeholder="https://www.tripadvisor.com/..."
                        style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"white",fontSize:"0.9rem",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
                      {extModal!=="add" && (
                        <button className="btn" style={{color:"#f87171",border:"1px solid rgba(248,113,113,0.3)",background:"rgba(239,68,68,0.1)",padding:"8px 16px",fontSize:"0.85rem"}}
                          onClick={async()=>{await deleteExternalRating(currentHotelId,extModal.edit.platform);setExtModal(null);loadExtRatings(currentHotelId);}}>Sil</button>
                      )}
                      <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                        <button className="btn btn-secondary" style={{padding:"8px 16px",fontSize:"0.85rem"}} onClick={()=>setExtModal(null)}>İptal</button>
                        <button className="btn btn-primary" style={{padding:"8px 16px",fontSize:"0.85rem"}}
                          onClick={async()=>{
                            const pl = extModal==="add" ? extForm.platform : extModal.edit.platform;
                            if (!pl){alert("Platform seçin");return;}
                            await upsertExternalRating(currentHotelId,{platform:pl,rating:extForm.rating!==""?parseFloat(extForm.rating):null,review_count:extForm.review_count!==""?parseInt(extForm.review_count):null,url:extForm.url||null});
                            setExtModal(null);loadExtRatings(currentHotelId);
                          }}>Kaydet</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pie chart */}
          <div className="chart-card glass-panel">
            <h3 className="chart-title" style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8}}>
              Duygu Dağılımı
              {sentimentFilter && <button onClick={()=>setSentimentFilter(null)} style={{fontSize:"0.78rem",background:"rgba(239,68,68,0.15)",border:"1px solid #EF4444",color:"#EF4444",padding:"2px 10px",borderRadius:6,cursor:"pointer",fontWeight:500}}>✕ {sentimentFilter} filtresi kaldır</button>}
            </h3>
            <div style={{flex:1,minHeight:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none" onClick={handlePieClick} style={{cursor:"pointer"}}>
                    {sentimentData.map((e,i)=><Cell key={i} fill={e.color} opacity={sentimentFilter&&sentimentFilter!==e.key?0.3:1}/>)}
                  </Pie>
                  <Tooltip content={<PieTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:16}}>
              {ALL_SENTIMENT.filter(s=>s.value>0).map(item=>(
                <div key={item.key} onClick={()=>handlePieClick(item)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",opacity:sentimentFilter&&sentimentFilter!==item.key?0.4:1,transition:"opacity 0.2s"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:item.color}}/>
                  <span style={{color:"var(--text-secondary)",fontSize:"0.9rem"}}>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="chart-card glass-panel">
            <h3 className="chart-title">En Çok Şikayet Edilen Konular</h3>
            <div style={{flex:1,minHeight:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_issue_categories||[]} margin={{top:20,right:30,left:0,bottom:5}}>
                  <XAxis dataKey="category" stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)"}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<BarTooltip/>} cursor={{fill:"rgba(255,255,255,0.05)"}}/>
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[4,4,0,0]} barSize={40}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend ComposedChart */}
          <div className="list-card glass-panel">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
              <h3 className="chart-title" style={{margin:0}}>Yorum Trendi</h3>
              <div style={{display:"flex",gap:6}}>
                {[["daily","Günlük"],["weekly","Haftalık"],["monthly","Aylık"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setTrendGroupBy(k)} style={{padding:"5px 14px",borderRadius:8,fontSize:"0.82rem",fontWeight:600,cursor:"pointer",background:trendGroupBy===k?"var(--accent-primary)":"rgba(255,255,255,0.07)",color:trendGroupBy===k?"white":"var(--text-secondary)",border:trendGroupBy===k?"1px solid var(--accent-primary)":"1px solid rgba(255,255,255,0.1)",transition:"all 0.2s"}}>{l}</button>
                ))}
              </div>
            </div>
            {processedTrendData.length>1 ? (
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedTrendData} margin={{top:10,right:40,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10B981" stopOpacity={0.03}/></linearGradient>
                      <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0.03}/></linearGradient>
                      <linearGradient id="gradNeu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0.03}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="period" tickFormatter={formatPeriod} stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)",fontSize:12}} axisLine={false} tickLine={false} interval={trendGroupBy==="daily" ? Math.floor(processedTrendData.length/6) : 0}/>
                    <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)",fontSize:12}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <YAxis yAxisId="right" orientation="right" domain={[0,10]} stroke="var(--text-muted)" tick={{fill:"#60A5FA",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<TrendTooltip/>}/>
                    <Legend formatter={v=><span style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>{v}</span>}/>
                    <Area yAxisId="left" type="monotone" dataKey="positive" name="Pozitif" stroke="#10B981" fill="url(#gradPos)" strokeWidth={2} dot={false} activeDot={{r:4,strokeWidth:0}}/>
                    <Area yAxisId="left" type="monotone" dataKey="negative" name="Negatif" stroke="#EF4444" fill="url(#gradNeg)" strokeWidth={2} dot={false} activeDot={{r:4,strokeWidth:0}}/>
                    <Area yAxisId="left" type="monotone" dataKey="neutral" name="Nötr" stroke="#F59E0B" fill="url(#gradNeu)" strokeWidth={2} dot={false} activeDot={{r:4,strokeWidth:0}}/>
                    <Line yAxisId="right" type="monotone" dataKey="avg_score" name="Ort. Memnuniyet" stroke="#60A5FA" strokeDasharray="5 3" strokeWidth={2} dot={false} connectNulls activeDot={{r:4,strokeWidth:0}}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ):(
              <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",fontSize:"0.9rem"}}>
                {trendData.length===0?"Grafik için yorum tarihi bulunamadı.":"Grafik için en az 2 farklı dönem gerekiyor."}
              </div>
            )}
            {trendData.length>0 && (
              <div style={{display:"flex",gap:24,marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>Dönem: <strong style={{color:"var(--text-secondary)"}}>{trendGroupBy==="daily" ? "Son 30 gün" : `${trendData.length} ${trendGroupBy==="weekly"?"hafta":"ay"}`}</strong></span>
                <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>Toplam: <strong style={{color:"var(--text-secondary)"}}>{trendData.reduce((s,d)=>s+d.total,0)} yorum</strong></span>
                <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>Ort. Memnuniyet: <strong style={{color:"#10B981"}}>{avgTrend}{avgTrend!=="—"?" / 10":""}</strong></span>
              </div>
            )}
          </div>

          {/* Source analysis */}
          {data.source_analysis?.length>0 && (
            <div className="list-card glass-panel">
              <h3 className="chart-title">Kaynak Bazlı Memnuniyet Dağılımı</h3>
              <div style={{height:220}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.source_analysis} margin={{top:10,right:10,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="source" stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis stroke="var(--text-muted)" tick={{fill:"var(--text-secondary)",fontSize:12}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip contentStyle={{background:"#1E293B",border:"1px solid #334155",borderRadius:8,color:"#F8FAFC"}} cursor={{fill:"rgba(255,255,255,0.05)"}}/>
                    <Legend formatter={v=><span style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>{v}</span>}/>
                    <Bar dataKey="positive" name="Pozitif" stackId="a" fill="#10B981"/>
                    <Bar dataKey="negative" name="Negatif" stackId="a" fill="#EF4444"/>
                    <Bar dataKey="neutral" name="Nötr" stackId="a" fill="#F59E0B" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",gap:24,marginTop:10,flexWrap:"wrap"}}>
                {data.source_analysis.map((s,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontSize:"0.8rem",fontWeight:600,color:"var(--text-secondary)",textTransform:"uppercase"}}>{s.source_label||s.source}</span>
                    <span style={{fontSize:"0.78rem",color:"var(--text-muted)"}}>{s.total_reviews} yorum · {s.average_score}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div className="list-card glass-panel">
            <h3 className="chart-title">Kurumsal Aksiyon Planı</h3>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",background:"rgba(59,130,246,0.08)",borderRadius:10,border:"1px solid rgba(59,130,246,0.2)",marginBottom:20}}>
              <span style={{marginTop:1,flexShrink:0,color:"#60A5FA"}}><AlertCircleIcon/></span>
              <span style={{color:"var(--text-secondary)",fontSize:"0.92rem",lineHeight:1.6}}>{data.weekly_action_plan}</span>
            </div>
            {data.action_plan?.length>0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {data.action_plan.map((item,i)=>{
                  const cfg=PRIORITY_CONFIG[item.priority]||PRIORITY_CONFIG.normal;
                  return (
                    <div key={i} style={{background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:12,padding:"16px 18px"}}>
                      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:10}}>
                        <span style={{fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",color:cfg.color,background:"rgba(0,0,0,0.25)",border:`1px solid ${cfg.border}`,padding:"3px 10px",borderRadius:6}}>{cfg.label}</span>
                        <span style={{fontSize:"0.78rem",fontWeight:600,color:"var(--text-muted)",background:"rgba(255,255,255,0.06)",padding:"3px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{item.category}</span>
                        <span style={{marginLeft:"auto",fontSize:"0.8rem",color:"var(--text-muted)"}}>{item.complaint_count} şikayet</span>
                      </div>
                      <p style={{fontWeight:700,fontSize:"0.97rem",color:"var(--text-primary)",marginBottom:6,lineHeight:1.4}}>{item.title}</p>
                      <p style={{fontSize:"0.88rem",color:"var(--text-secondary)",marginBottom:10,lineHeight:1.6}}>{item.description}</p>
                      <ul style={{listStyle:"none",padding:0,margin:"0 0 12px 0",display:"flex",flexDirection:"column",gap:5}}>
                        {item.steps.map((step,si)=>(
                          <li key={si} style={{display:"flex",gap:8,fontSize:"0.85rem",color:"var(--text-secondary)",lineHeight:1.5}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot,flexShrink:0,marginTop:7}}/>
                            {step}
                          </li>
                        ))}
                      </ul>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                        <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Sorumlu: <span style={{color:"var(--text-secondary)",fontWeight:500}}>{item.department}</span></span>
                        <span style={{fontSize:"0.8rem",fontWeight:600,color:cfg.color}}>⏱ {item.timeframe}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ):(
              <p style={{color:"var(--text-muted)",fontSize:"0.9rem"}}>Aksiyon planı için yeterli şikayet verisi yok.</p>
            )}
          </div>

          {/* Risk Reviews */}
          <div className="list-card glass-panel">
            <h3 className="chart-title" style={{color:"var(--danger)",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <AlertCircleIcon/> En Riskli Yorumlar
              {sentimentFilter && <span style={{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:400}}>— {sentimentFilter} filtresi aktif</span>}
            </h3>
            {filteredRiskReviews.length>0 ? filteredRiskReviews.map((r,i)=>(
              <div key={i} className="risk-item">
                <div className="risk-item-header">
                  <span className="risk-category">{r.issue_category?r.issue_category.toUpperCase():"GENEL"}</span>
                  <span className="risk-score">Risk: {r.risk_score}</span>
                </div>
                <p style={{color:"var(--text-secondary)",fontSize:"0.95rem",lineHeight:1.6,marginBottom:10}}>"{r.comment}"</p>
                {r.action_suggestion && <div style={{fontSize:"0.85rem",color:"var(--text-muted)",display:"flex",gap:6}}><span style={{color:"var(--warning)"}}>Öneri:</span> {r.action_suggestion}</div>}
              </div>
            )):(
              <p style={{color:"var(--text-muted)"}}>{sentimentFilter?`"${sentimentFilter}" kategorisinde riskli yorum yok.`:"Riskli yorum bulunamadı."}</p>
            )}
          </div>

          {/* Reviews Table */}
          <div id="reviews-section" className="list-card glass-panel" style={{marginBottom:40}}>
            <h3 className="chart-title">Tüm Yorumlar</h3>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" value={reviewSearchInput} onChange={e=>setReviewSearchInput(e.target.value)} placeholder="Yorumlarda NLP arama..."
                style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 14px",color:"var(--text-primary)",fontSize:"0.88rem",outline:"none"}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[null,"pozitif","negatif","nötr"].map(key=>(
                  <button key={key??"all"} onClick={()=>{setReviewSentimentFilter(key);setReviewPage(1);}}
                    style={{padding:"6px 14px",borderRadius:8,fontSize:"0.82rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s",
                      background:reviewSentimentFilter===key?(key==="pozitif"?"rgba(16,185,129,0.25)":key==="negatif"?"rgba(239,68,68,0.25)":key==="nötr"?"rgba(245,158,11,0.25)":"rgba(59,130,246,0.25)"):"rgba(255,255,255,0.06)",
                      color:reviewSentimentFilter===key?(key==="pozitif"?"#10B981":key==="negatif"?"#EF4444":key==="nötr"?"#F59E0B":"#60A5FA"):"var(--text-secondary)",
                      border:"1px solid rgba(255,255,255,0.1)"}}>
                    {key===null?"Tümü":key.charAt(0).toUpperCase()+key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {isTableLoading ? (
              <div style={{padding:"40px 0",display:"flex",justifyContent:"center"}}><div className="loader"/></div>
            ):reviewsData.items.length>0 ? (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.87rem"}}>
                  <thead>
                    <tr>
                      {["Otel","Yorum","Duygu","Kategori","Risk","Kaynak","Tarih"].map(h=>(
                        <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"var(--text-muted)",fontWeight:600,fontSize:"0.76rem",letterSpacing:"0.05em",textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsData.items.map((r,i)=>{
                      const sentColor=r.sentiment==="pozitif"?"#10B981":r.sentiment==="negatif"?"#EF4444":"#F59E0B";
                      const sentBg=r.sentiment==="pozitif"?"rgba(16,185,129,0.12)":r.sentiment==="negatif"?"rgba(239,68,68,0.12)":"rgba(245,158,11,0.12)";
                      const riskColor=(r.risk_score||0)>=6?"#EF4444":(r.risk_score||0)>=4?"#F59E0B":"#10B981";
                      const srcLabel=r.source==="serpapi"?"SerpAPI":r.source==="csv"?"CSV":r.source==="booking"?"Booking":"Manuel";
                      const srcColor=r.source==="serpapi"?"#8B5CF6":r.source==="csv"?"#06B6D4":r.source==="booking"?"#F59E0B":"#64748B";
                      const srcBg=r.source==="serpapi"?"rgba(139,92,246,0.15)":r.source==="csv"?"rgba(6,182,212,0.15)":r.source==="booking"?"rgba(245,158,11,0.15)":"rgba(100,116,139,0.15)";
                      return (
                        <tr key={r.id} onClick={()=>setDrawerReview(r)} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.01)":"transparent",cursor:"pointer",transition:"background 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"rgba(255,255,255,0.01)":"transparent"}>
                          <td style={{padding:"9px 12px",color:"var(--text-muted)",fontSize:"0.83rem",whiteSpace:"nowrap",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}} title={r.hotel_name}>{r.hotel_name}</td>
                          <td style={{padding:"9px 12px",color:"var(--text-secondary)",maxWidth:300}} title={r.comment}>{r.comment.length>100?r.comment.slice(0,100)+"…":r.comment}</td>
                          <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:"0.78rem",fontWeight:600,background:sentBg,color:sentColor}}>{r.sentiment}</span></td>
                          <td style={{padding:"9px 12px",color:"var(--text-muted)",fontSize:"0.83rem",whiteSpace:"nowrap"}}>{r.issue_category}</td>
                          <td style={{padding:"9px 12px",fontWeight:700,color:riskColor,whiteSpace:"nowrap"}}>{r.risk_score??"—"}</td>
                          <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}><span style={{padding:"3px 8px",borderRadius:5,fontSize:"0.75rem",fontWeight:600,background:srcBg,color:srcColor}}>{srcLabel}</span></td>
                          <td style={{padding:"9px 12px",color:"var(--text-muted)",fontSize:"0.8rem",whiteSpace:"nowrap"}}>{r.review_date||r.created_at||"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ):(
              <p style={{color:"var(--text-muted)",fontSize:"0.9rem",padding:"20px 0",textAlign:"center"}}>
                {reviewSearch?`"${reviewSearch}" için yorum bulunamadı.`:"Henüz yorum bulunmuyor."}
              </p>
            )}
            {/* Pagination */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:"0.83rem",color:"var(--text-muted)"}}>
                Toplam <strong style={{color:"var(--text-secondary)"}}>{reviewsData.total}</strong> yorum
                {reviewsData.total_pages>1&&` — Sayfa ${reviewsData.page} / ${reviewsData.total_pages}`}
              </span>
              <div style={{display:"flex",gap:8}}>
                {[["← Önceki",-1],["Sonraki →",1]].map(([lbl,dir])=>{
                  const disabled=dir===-1?reviewPage<=1:reviewPage>=(reviewsData.total_pages||1);
                  return <button key={lbl} disabled={disabled} onClick={()=>setReviewPage(p=>p+dir)}
                    style={{padding:"6px 16px",borderRadius:8,fontSize:"0.83rem",cursor:disabled?"default":"pointer",background:disabled?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.08)",color:disabled?"var(--text-muted)":"var(--text-secondary)",border:"1px solid rgba(255,255,255,0.1)",transition:"all 0.2s"}}>{lbl}</button>;
                })}
              </div>
            </div>
          </div>

        </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2 — OTEL KARŞILAŞTIRMA
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab==="compare" && (
        <section className="animate-fade-in" style={{display:"flex",flexDirection:"column",gap:24}}>
          <div className="glass-panel" style={{padding:24}}>
            <h3 className="chart-title" style={{marginBottom:20}}>İki Oteli Karşılaştır</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[["A","#3B82F6",compareHotelA,setCompareHotelA],["B","#8B5CF6",compareHotelB,setCompareHotelB]].map(([lbl,clr,val,setter])=>(
                <div key={lbl}>
                  <label style={{fontSize:"0.8rem",fontWeight:600,color:"var(--text-muted)",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    <span style={{color:clr}}>■</span> Otel {lbl}
                  </label>
                  <select value={val||""} onChange={e=>setter(e.target.value?parseInt(e.target.value):null)}
                    style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${val?clr:"rgba(255,255,255,0.12)"}`,borderRadius:10,color:"white",fontSize:"0.9rem",outline:"none"}}>
                    <option value="">— Otel seçin —</option>
                    {data.analyzed_hotels?.map(h=><option key={h.id} value={h.id} style={{background:"#1e293b"}}>{h.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {isLoadingCompare && (
            <div style={{textAlign:"center",padding:40}}><div className="loader" style={{margin:"0 auto",width:36,height:36,borderWidth:4}}/></div>
          )}

          {!isLoadingCompare && compareDataA && compareDataB && (() => {
            const hotelAName = data.analyzed_hotels?.find(h=>h.id===compareHotelA)?.name||"Otel A";
            const hotelBName = data.analyzed_hotels?.find(h=>h.id===compareHotelB)?.name||"Otel B";
            return (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                {[
                  {d:compareDataA,name:hotelAName,color:"#3B82F6",gradEnd:"#2563EB"},
                  {d:compareDataB,name:hotelBName,color:"#8B5CF6",gradEnd:"#7C3AED"},
                ].map(({d,name,color,gradEnd})=>{
                  const G=gradeConfig(d.average_satisfaction_score);
                  const tot=d.total_reviews;
                  return (
                    <div key={name} className="glass-panel" style={{padding:24,border:`1px solid ${color}30`}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                        <span style={{fontSize:"1.8rem",fontWeight:800,color:G.color,background:G.bg,padding:"4px 14px",borderRadius:8,boxShadow:`0 0 12px ${G.color}60`}}>{G.grade}</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:"1rem",color:"var(--text-primary)"}}>{name}</div>
                          <div style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>{tot} yorum · {d.average_satisfaction_score}/10</div>
                        </div>
                      </div>
                      <div style={{background:"rgba(255,255,255,0.06)",borderRadius:99,height:8,overflow:"hidden",marginBottom:20}}>
                        <div style={{width:`${Math.min(100,d.average_satisfaction_score*10)}%`,height:"100%",background:`linear-gradient(90deg,${color},${gradEnd})`,borderRadius:99}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-around",marginBottom:18,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 0"}}>
                        {[
                          {l:"Pozitif",v:d.sentiment_distribution?.pozitif||0,c:"#10B981"},
                          {l:"Negatif",v:d.sentiment_distribution?.negatif||0,c:"#EF4444"},
                          {l:"Nötr",v:d.sentiment_distribution?.["nötr"]||0,c:"#F59E0B"},
                        ].map(s=>(
                          <div key={s.l} style={{textAlign:"center"}}>
                            <div style={{fontSize:"1.3rem",fontWeight:700,color:s.c}}>{tot>0?Math.round(s.v/tot*100):0}%</div>
                            <div style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {d.top_issue_categories?.length>0 && (
                        <div>
                          <p style={{fontSize:"0.8rem",fontWeight:600,color:"var(--text-muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Öne Çıkan Konular</p>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {d.top_issue_categories.slice(0,4).map((c,i)=>(
                              <span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:"0.78rem",fontWeight:600,background:`${color}15`,color,border:`1px solid ${color}30`}}>{c.category} ({c.count})</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Side by side metrics */}
                <div className="glass-panel" style={{gridColumn:"span 2",padding:24}}>
                  <h3 className="chart-title" style={{marginBottom:20}}>Metrik Karşılaştırması</h3>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <span style={{padding:"4px 12px",borderRadius:6,background:"rgba(59,130,246,0.15)",color:"#3B82F6",fontSize:"0.82rem",fontWeight:600}}>■ {hotelAName}</span>
                    <span style={{padding:"4px 12px",borderRadius:6,background:"rgba(139,92,246,0.15)",color:"#8B5CF6",fontSize:"0.82rem",fontWeight:600}}>■ {hotelBName}</span>
                  </div>
                  <CompareScoreBar label="Ort. Memnuniyet Skoru" scoreA={compareDataA.average_satisfaction_score} scoreB={compareDataB.average_satisfaction_score}/>
                  <CompareScoreBar label="Olumlu Yorum Oranı (%)"
                    scoreA={compareDataA.total_reviews>0?Math.round((compareDataA.sentiment_distribution?.pozitif||0)/compareDataA.total_reviews*10):0}
                    scoreB={compareDataB.total_reviews>0?Math.round((compareDataB.sentiment_distribution?.pozitif||0)/compareDataB.total_reviews*10):0}
                  />
                  <CompareScoreBar label="Olumsuz Yorum Oranı (%)"
                    scoreA={compareDataA.total_reviews>0?Math.round((compareDataA.sentiment_distribution?.negatif||0)/compareDataA.total_reviews*10):0}
                    scoreB={compareDataB.total_reviews>0?Math.round((compareDataB.sentiment_distribution?.negatif||0)/compareDataB.total_reviews*10):0}
                    colorA="#EF4444" colorB="#F97316"
                  />

                  {/* Verdict */}
                  {(() => {
                    const winner = compareDataA.average_satisfaction_score >= compareDataB.average_satisfaction_score ? hotelAName : hotelBName;
                    const winColor = compareDataA.average_satisfaction_score >= compareDataB.average_satisfaction_score ? "#3B82F6" : "#8B5CF6";
                    return (
                      <div style={{marginTop:18,padding:"14px 18px",background:`${winColor}15`,border:`1px solid ${winColor}40`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:"1.5rem"}}>🏆</span>
                        <span style={{fontSize:"0.92rem",color:"var(--text-secondary)"}}>
                          Memnuniyet skoru karşılaştırmasında <strong style={{color:winColor}}>{winner}</strong> öne çıkıyor.
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {!compareHotelA && !compareHotelB && (
            <div style={{textAlign:"center",padding:60,color:"var(--text-muted)",fontSize:"0.9rem"}}>
              Yukarıdan iki otel seçerek yan yana karşılaştırma yapın.
            </div>
          )}
        </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3 — DERİNLEMESİNE ANALİZ
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab==="deep" && (
        <section className="animate-fade-in" style={{display:"flex",flexDirection:"column",gap:24}}>

          {/* NLP AI Summary */}
          <div className="glass-panel" style={{padding:24,background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{background:"rgba(139,92,246,0.15)",padding:8,borderRadius:10,color:"#A78BFA"}}><BrainIcon/></div>
              <div>
                <h3 style={{margin:0,fontSize:"1.1rem",fontWeight:700,color:"var(--text-primary)"}}>NLP Yapay Zekâ Özeti</h3>
                <p style={{margin:0,fontSize:"0.8rem",color:"var(--text-muted)"}}>Son 100 yorum otomatik analiz edildi</p>
              </div>
              <button onClick={()=>loadNlpSummary(currentHotelId)} style={{marginLeft:"auto",padding:"7px 16px",borderRadius:8,background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.4)",color:"#A78BFA",cursor:"pointer",fontSize:"0.82rem",fontWeight:600}}>
                Yenile
              </button>
            </div>

            {isLoadingNlp ? (
              <div style={{padding:"30px 0",display:"flex",justifyContent:"center"}}><div className="loader"/></div>
            ) : nlpSummary ? (
              <div>
                <div style={{marginBottom:16}}>
                  <span style={{fontSize:"0.78rem",color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    {nlpSummary.hotel_name} · {nlpSummary.total_analyzed} yorum incelendi
                  </span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {nlpSummary.summary_bullets?.map((b,i)=>(
                    <div key={i} style={{display:"flex",gap:12,padding:"12px 16px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
                      <span style={{fontSize:"1.1rem",lineHeight:1}}>{["📊","⚠️","🎯","📋","💡"][i]||"•"}</span>
                      <p style={{margin:0,fontSize:"0.92rem",color:"var(--text-secondary)",lineHeight:1.6}}>{b}</p>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:24,marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.07)",flexWrap:"wrap"}}>
                  {nlpSummary.top_complaint && <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>En Büyük Sorun: <strong style={{color:"#EF4444"}}>{nlpSummary.top_complaint}</strong></span>}
                  {nlpSummary.top_praise && <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Güçlü Yön: <strong style={{color:"#10B981"}}>{nlpSummary.top_praise}</strong></span>}
                  {nlpSummary.avg_score>0 && <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Ort. Skor: <strong style={{color:"#60A5FA"}}>{nlpSummary.avg_score}/10</strong></span>}
                  {nlpSummary.high_risk_count>0 && <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Yüksek Risk: <strong style={{color:"#F59E0B"}}>{nlpSummary.high_risk_count} yorum</strong></span>}
                </div>
              </div>
            ) : (
              <p style={{color:"var(--text-muted)",fontSize:"0.9rem"}}>Özet yüklenemedi. "Yenile" butonuna tıklayın.</p>
            )}
          </div>

          {/* Deep reviews table — all filters */}
          <div className="glass-panel" style={{padding:24}}>
            <h3 className="chart-title" style={{marginBottom:16}}>Gelişmiş Yorum Filtreleme</h3>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <input type="text" value={reviewSearchInput} onChange={e=>setReviewSearchInput(e.target.value)} placeholder="Anahtar kelime ara..."
                style={{flex:1,minWidth:220,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"9px 14px",color:"var(--text-primary)",fontSize:"0.88rem",outline:"none"}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[null,"pozitif","negatif","nötr"].map(key=>(
                  <button key={key??"all"} onClick={()=>{setReviewSentimentFilter(key);setReviewPage(1);}}
                    style={{padding:"7px 14px",borderRadius:8,fontSize:"0.82rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s",
                      background:reviewSentimentFilter===key?(key==="pozitif"?"rgba(16,185,129,0.25)":key==="negatif"?"rgba(239,68,68,0.25)":key==="nötr"?"rgba(245,158,11,0.25)":"rgba(59,130,246,0.25)"):"rgba(255,255,255,0.06)",
                      color:reviewSentimentFilter===key?(key==="pozitif"?"#10B981":key==="negatif"?"#EF4444":key==="nötr"?"#F59E0B":"#60A5FA"):"var(--text-secondary)",
                      border:"1px solid rgba(255,255,255,0.1)"}}>
                    {key===null?"Tümü":key.charAt(0).toUpperCase()+key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {isTableLoading ? (
              <div style={{padding:"30px 0",display:"flex",justifyContent:"center"}}><div className="loader"/></div>
            ) : reviewsData.items.length>0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {reviewsData.items.map((r,i)=>{
                  const sentColor=r.sentiment==="pozitif"?"#10B981":r.sentiment==="negatif"?"#EF4444":"#F59E0B";
                  const riskColor=(r.risk_score||0)>=6?"#EF4444":(r.risk_score||0)>=4?"#F59E0B":"#10B981";
                  return (
                    <div key={r.id} onClick={()=>setDrawerReview(r)} style={{padding:"14px 18px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",cursor:"pointer",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.07)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.75rem",fontWeight:700,color:sentColor,background:`${sentColor}18`,padding:"2px 10px",borderRadius:6,textTransform:"uppercase"}}>{r.sentiment}</span>
                        <span style={{fontSize:"0.75rem",color:"var(--text-muted)",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:6}}>{r.issue_category}</span>
                        <span style={{fontSize:"0.75rem",fontWeight:700,color:riskColor,marginLeft:"auto"}}>Risk: {r.risk_score??"—"}</span>
                        <span style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>{r.review_date||r.created_at||"—"}</span>
                      </div>
                      <p style={{margin:0,fontSize:"0.88rem",color:"var(--text-secondary)",lineHeight:1.6}}>{r.comment}</p>
                      {r.action_suggestion && <p style={{margin:"8px 0 0",fontSize:"0.8rem",color:"var(--text-muted)"}}><span style={{color:"var(--warning)"}}>💡</span> {r.action_suggestion}</p>}
                    </div>
                  );
                })}
              </div>
            ):(
              <p style={{color:"var(--text-muted)",padding:"20px 0",textAlign:"center"}}>Yorum bulunamadı.</p>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:"0.83rem",color:"var(--text-muted)"}}>Toplam <strong style={{color:"var(--text-secondary)"}}>{reviewsData.total}</strong> yorum{reviewsData.total_pages>1&&` — Sayfa ${reviewsData.page}/${reviewsData.total_pages}`}</span>
              <div style={{display:"flex",gap:8}}>
                {[["← Önceki",-1],["Sonraki →",1]].map(([lbl,dir])=>{
                  const disabled=dir===-1?reviewPage<=1:reviewPage>=(reviewsData.total_pages||1);
                  return <button key={lbl} disabled={disabled} onClick={()=>setReviewPage(p=>p+dir)}
                    style={{padding:"6px 16px",borderRadius:8,fontSize:"0.83rem",cursor:disabled?"default":"pointer",background:disabled?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.08)",color:disabled?"var(--text-muted)":"var(--text-secondary)",border:"1px solid rgba(255,255,255,0.1)"}}>{lbl}</button>;
                })}
              </div>
            </div>
          </div>
        </section>
        )}
      </main>

      {/* ── Review Detail Drawer ─────────────────────────────────────────────── */}
      {drawerReview && (
        <>
          {/* Backdrop */}
          <div onClick={()=>setDrawerReview(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,backdropFilter:"blur(2px)"}}/>
          {/* Drawer panel */}
          <div style={{position:"fixed",top:0,right:0,width:480,maxWidth:"100vw",height:"100vh",background:"var(--bg-secondary)",borderLeft:"1px solid var(--border-color)",padding:28,zIndex:1000,overflowY:"auto",display:"flex",flexDirection:"column",gap:20,
            animation:"slideInRight 0.25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0,fontSize:"1.1rem",fontWeight:700}}>Yorum Detayı</h2>
              <button onClick={()=>setDrawerReview(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px",cursor:"pointer",color:"var(--text-secondary)",display:"flex"}}><XIcon/></button>
            </div>

            {/* Hotel + date */}
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{background:"rgba(59,130,246,0.1)",padding:10,borderRadius:10}}><BuildingIcon/></div>
              <div>
                <div style={{fontWeight:600,color:"var(--text-primary)"}}>{drawerReview.hotel_name}</div>
                <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>{drawerReview.review_date||drawerReview.created_at||"Tarih yok"}</div>
              </div>
            </div>

            {/* Badges */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[
                {lbl:drawerReview.sentiment, color:drawerReview.sentiment==="pozitif"?"#10B981":drawerReview.sentiment==="negatif"?"#EF4444":"#F59E0B"},
                {lbl:drawerReview.issue_category||"genel", color:"#60A5FA"},
                {lbl:drawerReview.source==="serpapi"?"SerpAPI":drawerReview.source==="csv"?"CSV":"Manuel", color:"#8B5CF6"},
              ].map((b,i)=>(
                <span key={i} style={{padding:"4px 12px",borderRadius:8,fontSize:"0.8rem",fontWeight:600,background:`${b.color}18`,color:b.color,border:`1px solid ${b.color}40`,textTransform:"capitalize"}}>{b.lbl}</span>
              ))}
            </div>

            {/* Risk & Satisfaction scores */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {label:"Risk Skoru",val:drawerReview.risk_score,color:(drawerReview.risk_score||0)>=6?"#EF4444":(drawerReview.risk_score||0)>=4?"#F59E0B":"#10B981"},
                {label:"Memnuniyet",val:drawerReview.satisfaction_score,color:"#10B981"},
              ].map(s=>(
                <div key={s.label} style={{padding:"14px 16px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.label}</div>
                  <div style={{fontSize:"1.8rem",fontWeight:800,color:s.color}}>{s.val??<span style={{color:"var(--text-muted)"}}>—</span>}</div>
                  <div style={{fontSize:"0.72rem",color:"var(--text-muted)"}}>/ 10</div>
                </div>
              ))}
            </div>

            {/* Full comment */}
            <div style={{padding:"16px 18px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",flex:1}}>
              <p style={{fontSize:"0.78rem",fontWeight:600,color:"var(--text-muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Yorum</p>
              <p style={{margin:0,fontSize:"0.95rem",color:"var(--text-secondary)",lineHeight:1.7}}>{drawerReview.comment}</p>
            </div>

            {/* Action suggestion */}
            {drawerReview.action_suggestion && (
              <div style={{padding:"14px 16px",background:"rgba(245,158,11,0.08)",borderRadius:10,border:"1px solid rgba(245,158,11,0.2)"}}>
                <p style={{fontSize:"0.78rem",fontWeight:600,color:"#F59E0B",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><AlertCircleIcon/> YZ Önerisi</p>
                <p style={{margin:0,fontSize:"0.88rem",color:"var(--text-secondary)",lineHeight:1.6}}>{drawerReview.action_suggestion}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}
