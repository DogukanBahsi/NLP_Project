import { useEffect, useState } from "react";
import { API } from "./api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
  API.get("/dashboard/summary")
    .then(res => setData(res.data))
    .catch(err => console.log("Dashboard hatası:", err));

  API.get("/dashboard/model-metrics")
    .then(res => setMetrics(res.data))
    .catch(err => {
      console.log("Model metrics hatası:", err);
      setMetrics(null);
    });
}, []);

  if (!data) return <div>Yükleniyor...</div>;

  const sentimentData = [
    { name: "Pozitif", value: data.sentiment_distribution.pozitif || 0 },
    { name: "Negatif", value: data.sentiment_distribution.negatif || 0 },
    { name: "Nötr", value: data.sentiment_distribution.nötr || 0 }
  ];

  const COLORS = ["#4CAF50", "#F44336", "#9E9E9E"];

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>📊 Hotel Review AI Dashboard</h1>

      {/* 🔥 KARTLAR */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={card}>
          <h3>Toplam Yorum</h3>
          <h2>{data.total_reviews}</h2>
        </div>

        <div style={card}>
          <h3>Ortalama Memnuniyet</h3>
          <h2>{data.average_satisfaction_score}</h2>
        </div>
      </div>

      {/* 🔥 SENTIMENT PIE */}
      <h2>Duygu Dağılımı</h2>
      <PieChart width={400} height={300}>
        <Pie data={sentimentData} dataKey="value" outerRadius={100}>
          {sentimentData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>

      {/* 🔥 KATEGORİ BAR */}
      <h2>En Çok Şikayet Edilen Konular</h2>
      <BarChart width={500} height={300} data={data.top_issue_categories}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#2196F3" />
      </BarChart>

      {/* 🔥 RİSKLİ YORUMLAR */}
      <h2>⚠ En Riskli Yorumlar</h2>
      <ul>
        {data.high_risk_reviews.map((r, i) => (
          <li key={i}>{r.comment}</li>
        ))}
      </ul>

      {/* 🔥 AKSİYON */}
      <h2>📌 Bu Hafta Ne Yapılmalı?</h2>
      <p>{data.weekly_action_plan}</p>

      {/* 🔥 MODEL METRİK */}
      {metrics && (
        <div style={card}>
          <h3>Model Performansı</h3>
          <p>Accuracy: {metrics.accuracy}</p>
          <p>F1 Score: {metrics.f1_score}</p>
        </div>
      )}

      {/* 🔥 RAPOR */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => window.open("http://127.0.0.1:8000/reports/pdf")}>
          PDF İndir
        </button>

        <button onClick={() => window.open("http://127.0.0.1:8000/reports/excel")}>
          Excel İndir
        </button>
      </div>
    </div>
  );
}

const card = {
  background: "#f5f5f5",
  padding: 20,
  borderRadius: 10,
  width: 200,
  textAlign: "center"
};