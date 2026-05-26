from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from deep_translator import GoogleTranslator
import uuid
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from sqlalchemy import func

from app.database import get_db
from app import models
from app.nlp.action_planner import generate_action_plan

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


def translate_to_tr(text):
    if not text:
        return ""
    try:
        translator = GoogleTranslator(source='auto', target='tr')
        translated = translator.translate(text)
        return translated if translated else text
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def create_bar_chart(data, title, xlabel, ylabel, color='#3B82F6'):
    plt.figure(figsize=(6, 4))
    keys = list(data.keys())
    values = list(data.values())
    
    # Sort by values descending
    sorted_indices = sorted(range(len(values)), key=lambda k: values[k], reverse=True)
    keys = [keys[i] for i in sorted_indices][:8] # Top 8
    values = [values[i] for i in sorted_indices][:8]

    plt.bar(keys, values, color=color)
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', dpi=100)
    plt.close()
    img_data.seek(0)
    return img_data

def create_time_series_chart(reviews, time_frame):
    plt.figure(figsize=(7, 4))
    
    # Group by date
    counts = {}
    neg_counts = {}
    
    for r in reviews:
        if not r.review_date: continue
        
        if time_frame == 'weekly':
            key = r.review_date.strftime('%Y-%W')
        elif time_frame == 'monthly':
            key = r.review_date.strftime('%Y-%m')
        elif time_frame == 'yearly':
            key = r.review_date.strftime('%Y')
        else:
            key = r.review_date.strftime('%Y-%m')
            
        counts[key] = counts.get(key, 0) + 1
        if r.sentiment == 'negatif':
            neg_counts[key] = neg_counts.get(key, 0) + 1
            
    sorted_keys = sorted(counts.keys())
    if not sorted_keys: return None

    total_vals = [counts[k] for k in sorted_keys]
    neg_vals = [neg_counts.get(k, 0) for k in sorted_keys]
    
    plt.plot(sorted_keys, total_vals, marker='o', label='Toplam Yorum', color='#3B82F6')
    plt.plot(sorted_keys, neg_vals, marker='x', label='Şikayetler', color='#EF4444')
    
    plt.title("Zaman Bazlı Yorum ve Şikayet Dağılımı")
    plt.xticks(rotation=45)
    plt.legend()
    plt.tight_layout()
    
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', dpi=100)
    plt.close()
    img_data.seek(0)
    return img_data

@router.get("/pdf")
def generate_pdf_report(
    background_tasks: BackgroundTasks,
    hotel_id: Optional[int] = None,
    time_frame: str = "all",  # all, monthly, weekly, yearly
    db: Session = Depends(get_db)
):
    file_path = f"report_{uuid.uuid4().hex}.pdf"

    # Time filtering
    now = datetime.utcnow()
    filter_date = None
    if time_frame == 'weekly':
        filter_date = now - timedelta(days=7)
    elif time_frame == 'monthly':
        filter_date = now - timedelta(days=30)
    elif time_frame == 'yearly':
        filter_date = now - timedelta(days=365)

    query = db.query(models.Review)
    if filter_date:
        query = query.filter(
            func.coalesce(models.Review.review_date, models.Review.created_at) >= filter_date
        )
    
    all_reviews = query.all()
    all_hotels = db.query(models.Hotel).all()
    
    if hotel_id is not None:
        reviews = [r for r in all_reviews if r.hotel_id == hotel_id]
        target_hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
        hotel_name = target_hotel.name if target_hotel else "Tüm Oteller"
    else:
        reviews = all_reviews
        hotel_name = "Tüm Oteller"

    # Font tanımlamaları
    try:
        pdfmetrics.registerFont(TTFont('Arial', 'arial.ttf'))
        pdfmetrics.registerFont(TTFont('Arial-Bold', 'arialbd.ttf'))
        default_font = 'Arial'
        bold_font = 'Arial-Bold'
    except:
        default_font = 'Helvetica'
        bold_font = 'Helvetica-Bold'

    doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    elements = []

    # Stiller
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name='TitleStyle', fontName=bold_font, fontSize=24, textColor=colors.HexColor('#2c3e50'), spaceAfter=10, alignment=1
    )
    heading_style = ParagraphStyle(
        name='HeadingStyle', fontName=bold_font, fontSize=16, textColor=colors.HexColor('#2980b9'), spaceAfter=10, spaceBefore=15
    )
    normal_style = ParagraphStyle(
        name='NormalStyle', fontName=default_font, fontSize=10, textColor=colors.HexColor('#34495e'), spaceAfter=8, leading=12
    )

    # Başlık
    elements.append(Paragraph("Hotel Review AI", title_style))
    elements.append(Paragraph(f"Yönetici Analiz Raporu - {hotel_name}", ParagraphStyle(name='SubTitle', parent=title_style, fontSize=16, textColor=colors.HexColor('#7f8c8d'))))
    elements.append(Paragraph(f"Zaman Aralığı: {time_frame.capitalize()} | Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}", ParagraphStyle(name='Date', parent=normal_style, alignment=1)))
    elements.append(Spacer(1, 10))

    if not reviews:
        elements.append(Paragraph("Seçilen zaman aralığında analiz edilecek yorum bulunmamaktadır.", normal_style))
        doc.build(elements)
        background_tasks.add_task(os.remove, file_path)
        return FileResponse(file_path, media_type="application/pdf", filename="hotel_review_report.pdf")

    # 1. Genel İstatistikler
    total_reviews = len(reviews)
    positive_reviews = len([r for r in reviews if r.sentiment == 'pozitif'])
    negative_reviews = len([r for r in reviews if r.sentiment == 'negatif'])
    avg_score = sum([r.satisfaction_score for r in reviews if r.satisfaction_score]) / total_reviews if total_reviews > 0 else 0
    avg_score = avg_score / 10.0

    elements.append(Paragraph("1. Genel Performans Özeti", heading_style))
    
    summary_data = [
        ["Toplam Yorum", str(total_reviews), "Ort. Memnuniyet", f"{avg_score:.2f}/10"],
        ["Pozitif Yorum", str(positive_reviews), "Negatif Yorum", str(negative_reviews)]
    ]
    summary_table = Table(summary_data, colWidths=[120, 100, 120, 100])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#ecf0f1')),
        ('FONTNAME', (0, 0), (-1, -1), default_font),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (0, -1), bold_font),
        ('FONTNAME', (2, 0), (2, -1), bold_font),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    # Zaman Serisi Grafiği (Tüm raporlarda var)
    if any(r.review_date for r in reviews):
        elements.append(Paragraph("Zaman Bazlı Eğilim Analizi", heading_style))
        chart_data = create_time_series_chart(reviews, time_frame)
        if chart_data:
            elements.append(Image(chart_data, width=450, height=250))
            elements.append(Spacer(1, 15))

    # Bölüm numarası: karşılaştırma modu varsa 2'den başlar, yoksa atlanır
    is_comparison_mode = hotel_id is None and len(all_hotels) > 1
    action_section_num = 3 if is_comparison_mode else 2
    kritik_section_num = 4 if is_comparison_mode else 3

    # --- KARŞILAŞTIRMA MODU (Tüm Oteller Seçiliyse) ---
    if is_comparison_mode:
        elements.append(Paragraph("2. Otel Karşılaştırma ve Kıyaslama", heading_style))
        
        # Karşılaştırma Tablosu (Genel Yıldız Puanı Dahil)
        comp_data = [["Otel Adı", "Google Puan", "Yorum", "Pozitif", "Negatif", "Sistem Puanı"]]
        for hotel in all_hotels:
            h_reviews = [r for r in all_reviews if r.hotel_id == hotel.id]
            h_total = len(h_reviews)
            if h_total == 0: continue
            
            h_pos = len([r for r in h_reviews if r.sentiment == 'pozitif'])
            h_neg = len([r for r in h_reviews if r.sentiment == 'negatif'])
            h_avg = (sum([r.satisfaction_score for r in h_reviews if r.satisfaction_score]) / h_total) / 10.0
            
            comp_data.append([
                hotel.name[:20],
                f"{hotel.google_rating or '-'}/5",
                str(h_total),
                str(h_pos),
                str(h_neg),
                f"{h_avg:.2f}"
            ])
            
        comp_table = Table(comp_data, colWidths=[140, 70, 60, 60, 60, 80])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), bold_font),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
        ]))
        elements.append(comp_table)
        elements.append(Spacer(1, 20))

        # Şikayet Kıyaslama Grafiği
        elements.append(Paragraph("En Çok Şikayet Edilen Konuların Kıyaslaması", heading_style))
        issue_counts = {}
        for r in reviews:
            if r.sentiment == 'negatif' and r.issue_category:
                cat = r.issue_category.capitalize()
                issue_counts[cat] = issue_counts.get(cat, 0) + 1
        
        if issue_counts:
            chart_data = create_bar_chart(issue_counts, "Şikayet Kıyaslama (Tüm Oteller)", "Kategori", "Şikayet Sayısı", color='#EF4444')
            elements.append(Image(chart_data, width=400, height=250))
            elements.append(Spacer(1, 15))

        # Öne Çıkan Özellikler Karşılaştırması
        elements.append(Paragraph("Öne Çıkan Özellikler Karşılaştırması", heading_style))
        features_data = [["Otel Adı", "Öne Çıkan Güçlü Yönler"]]
        for hotel in all_hotels:
            h_reviews = [r for r in all_reviews if r.hotel_id == hotel.id and r.sentiment == 'pozitif']
            if not h_reviews: continue
            
            h_cats = {}
            for r in h_reviews:
                if r.issue_category:
                    h_cats[r.issue_category] = h_cats.get(r.issue_category, 0) + 1
            
            top_features = sorted(h_cats.keys(), key=lambda x: h_cats[x], reverse=True)[:3]
            features_data.append([hotel.name[:20], ", ".join([f.capitalize() for f in top_features])])
            
        feat_table = Table(features_data, colWidths=[150, 350])
        feat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27ae60')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('FONTNAME', (0, 0), (-1, 0), bold_font),
        ]))
        elements.append(feat_table)
        elements.append(Spacer(1, 15))

        # Genel Karşılaştırmalı Öneri
        elements.append(Paragraph("Sektörel Karşılaştırma Önerisi", heading_style))
        if len(all_hotels) > 1:
            best_hotel = max(all_hotels, key=lambda h: (len([r for r in all_reviews if r.hotel_id == h.id and r.sentiment == 'pozitif']) / len([r for r in all_reviews if r.hotel_id == h.id]) if len([r for r in all_reviews if r.hotel_id == h.id]) > 0 else 0))
            elements.append(Paragraph(f"Analiz edilen oteller arasında misafir memnuniyet oranı en yüksek olan işletme <b>{best_hotel.name}</b> olarak görülmektedir. Diğer işletmelerin özellikle en çok şikayet alan '{list(issue_counts.keys())[0] if issue_counts else 'genel'}' kategorisindeki süreçlerini iyileştirmesi önerilir.", normal_style))

    # Kurumsal Aksiyon Planı bölümü
    elements.append(Paragraph(f"{action_section_num}. Kurumsal Aksiyon Planı", heading_style))

    neg_count = sum(1 for r in reviews if r.sentiment == 'negatif')
    cat_counts: dict = {}
    for r in reviews:
        cat = (r.issue_category or "genel").lower()
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    top_cats = sorted(
        [{"category": k, "count": v} for k, v in cat_counts.items()],
        key=lambda x: x["count"], reverse=True
    )[:5]
    action_items = generate_action_plan(top_cats, neg_count)

    if action_items:
        priority_label = {"acil": "ACIL", "yüksek": "YUKSEK", "normal": "NORMAL"}
        priority_colors = {
            "acil":   colors.HexColor("#C0392B"),
            "yüksek": colors.HexColor("#E67E22"),
            "normal": colors.HexColor("#27AE60"),
        }
        action_table_data = [["Oncelik", "Kategori", "Aksiyon Basligi", "Sorumlu Birim", "Sure"]]
        action_row_colors = []

        for item in action_items:
            action_table_data.append([
                priority_label.get(item["priority"], item["priority"].upper()),
                item["category"].capitalize(),
                item["title"][:45],
                item["department"][:30],
                item["timeframe"],
            ])
            action_row_colors.append(item["priority"])

        action_table = Table(action_table_data, colWidths=[55, 65, 195, 130, 75])
        table_style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTNAME",   (0, 0), (-1, 0), bold_font),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("FONTNAME",   (0, 1), (-1, -1), default_font),
            ("ALIGN",      (0, 0), (-1, -1), "CENTER"),
            ("ALIGN",      (2, 1), (3, -1), "LEFT"),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
            ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
        ]
        for row_idx, priority in enumerate(action_row_colors, start=1):
            col = priority_colors.get(priority, colors.HexColor("#27AE60"))
            table_style_cmds.append(("TEXTCOLOR", (0, row_idx), (0, row_idx), col))
            table_style_cmds.append(("FONTNAME",  (0, row_idx), (0, row_idx), bold_font))

        action_table.setStyle(TableStyle(table_style_cmds))
        elements.append(action_table)

        # Her aksiyon için kısa adımlar
        elements.append(Spacer(1, 12))
        for item in action_items:
            elements.append(Paragraph(
                f"<b>{item['category'].upper()}</b> — {item['title']}",
                ParagraphStyle(name="ActionHead", parent=normal_style,
                               textColor=priority_colors.get(item["priority"], colors.HexColor("#2c3e50")),
                               spaceBefore=8)
            ))
            for step in item["steps"]:
                elements.append(Paragraph(f"• {step}", normal_style))
    else:
        elements.append(Paragraph("Aksiyon gerektiren kritik sikayet tespit edilmedi.", normal_style))

    elements.append(Spacer(1, 20))

    # Kritik Şikayetler ve Öneriler
    elements.append(Paragraph(f"{kritik_section_num}. Kritik Sikayetler ve Yapay Zeka Onerileri", heading_style))
    critical_reviews = [r for r in reviews if r.sentiment == 'negatif'][:5]

    if critical_reviews:
        for cr in critical_reviews:
            scaled_risk = round(cr.risk_score / 10.0, 1)
            elements.append(Paragraph(f"<b>Kategori:</b> {cr.issue_category.capitalize() if cr.issue_category else 'Genel'} | <b>Risk:</b> {scaled_risk}/10", normal_style))
            elements.append(Paragraph(f"<i>\"{translate_to_tr(cr.comment)}\"</i>", ParagraphStyle(name='Italic', parent=normal_style, textColor=colors.HexColor('#e74c3c'))))
            if cr.action_suggestion:
                elements.append(Paragraph(f"<b>Yapay Zeka Önerisi:</b> {cr.action_suggestion}", ParagraphStyle(name='Suggestion', parent=normal_style, textColor=colors.HexColor('#2980b9'))))
            elements.append(Spacer(1, 10))
    else:
        elements.append(Paragraph("Bu dönemde kritik şikayet bulunmamaktadır.", normal_style))

    doc.build(elements)
    background_tasks.add_task(os.remove, file_path)
    return FileResponse(file_path, media_type="application/pdf", filename=f"{hotel_name}_analiz_raporu.pdf")