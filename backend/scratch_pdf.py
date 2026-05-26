import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime

# Register Arial for Turkish characters
pdfmetrics.registerFont(TTFont('Arial', 'arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'arialbd.ttf'))

# Mock Data
class MockReview:
    def __init__(self, comment, sentiment, issue_category, satisfaction_score, risk_score):
        self.comment = comment
        self.sentiment = sentiment
        self.issue_category = issue_category
        self.satisfaction_score = satisfaction_score
        self.risk_score = risk_score

reviews = [
    MockReview("Oda çok kirliydi ve resepsiyon personeli çok ilgisiz", "negatif", "temizlik", 2.0, 8.5),
    MockReview("Oda çok temizdi ve personel güler yüzlüydü", "pozitif", "resepsiyon", 4.5, 1.0),
    MockReview("Wifi çok yavaştı hiç çekmiyordu", "negatif", "wifi", 1.5, 7.0),
    MockReview("Kahvaltı harikaydı ama oda küçüktü", "pozitif", "oda", 4.0, 3.0),
    MockReview("Personel çok ilgisizdi ve oda kirliydi", "negatif", "temizlik", 1.0, 9.5),
    MockReview("Fiyatına göre çok iyi bir oteldi", "pozitif", "fiyat", 5.0, 0.5),
]

file_path = "sample_report.pdf"
doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
elements = []

# Styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Arial-Bold',
    fontSize=24,
    textColor=colors.HexColor('#2c3e50'),
    spaceAfter=20,
    alignment=1 # Center
)
heading_style = ParagraphStyle(
    name='HeadingStyle',
    fontName='Arial-Bold',
    fontSize=16,
    textColor=colors.HexColor('#2980b9'),
    spaceAfter=15,
    spaceBefore=20
)
normal_style = ParagraphStyle(
    name='NormalStyle',
    fontName='Arial',
    fontSize=11,
    textColor=colors.HexColor('#34495e'),
    spaceAfter=10,
    leading=14
)
bold_style = ParagraphStyle(
    name='BoldStyle',
    fontName='Arial-Bold',
    fontSize=11,
    textColor=colors.HexColor('#2c3e50')
)

# Title
elements.append(Paragraph("Hotel Review AI", title_style))
elements.append(Paragraph("Yönetici Özet Raporu", ParagraphStyle(name='SubTitle', parent=title_style, fontSize=18, textColor=colors.HexColor('#7f8c8d'))))
elements.append(Paragraph(f"Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}", ParagraphStyle(name='Date', parent=normal_style, alignment=1)))
elements.append(Spacer(1, 20))

# 1. Summary Statistics
total_reviews = len(reviews)
positive_reviews = len([r for r in reviews if r.sentiment == 'pozitif'])
negative_reviews = len([r for r in reviews if r.sentiment == 'negatif'])
avg_score = sum([r.satisfaction_score for r in reviews]) / total_reviews if total_reviews > 0 else 0

elements.append(Paragraph("1. Özet İstatistikler", heading_style))

summary_data = [
    ["Toplam Yorum Sayısı", str(total_reviews)],
    ["Pozitif Yorumlar", str(positive_reviews)],
    ["Negatif Yorumlar", str(negative_reviews)],
    ["Ortalama Memnuniyet Puanı", f"{avg_score:.2f} / 5.0"]
]
summary_table = Table(summary_data, colWidths=[200, 100])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, -1), 'Arial'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#ecf0f1')),
    ('FONTNAME', (0, 0), (0, -1), 'Arial-Bold'), # Make first column bold
]))
elements.append(summary_table)
elements.append(Spacer(1, 15))

# 2. Category Analysis
elements.append(Paragraph("2. Kategori Bazlı Analiz (Şikayet ve Memnuniyet)", heading_style))

category_stats = {}
for r in reviews:
    cat = r.issue_category.capitalize() if r.issue_category else "Diğer"
    if cat not in category_stats:
        category_stats[cat] = {'pozitif': 0, 'negatif': 0}
    category_stats[cat][r.sentiment] += 1

cat_data = [["Kategori", "Pozitif", "Negatif", "Toplam"]]
for cat, stats in category_stats.items():
    cat_data.append([
        cat,
        str(stats['pozitif']),
        str(stats['negatif']),
        str(stats['pozitif'] + stats['negatif'])
    ])

cat_table = Table(cat_data, colWidths=[150, 80, 80, 80])
cat_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 12),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
    ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
    ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
]))
elements.append(cat_table)
elements.append(Spacer(1, 15))

# 3. Critical Reviews
elements.append(Paragraph("3. Kritik Şikayetler ve Riskli Yorumlar", heading_style))
elements.append(Paragraph("En yüksek risk puanına sahip son yorumlar aşağıda listelenmiştir. Bu şikayetler acil aksiyon gerektirebilir.", normal_style))

critical_reviews = sorted([r for r in reviews if r.sentiment == 'negatif'], key=lambda x: x.risk_score, reverse=True)[:5]

if critical_reviews:
    for cr in critical_reviews:
        elements.append(Paragraph(f"<b>Kategori:</b> {cr.issue_category.capitalize()} | <b>Risk Puanı:</b> {cr.risk_score}", normal_style))
        elements.append(Paragraph(f"<i>\"{cr.comment}\"</i>", ParagraphStyle(name='ItalicStyle', parent=normal_style, textColor=colors.HexColor('#e74c3c'))))
        elements.append(Spacer(1, 10))
else:
    elements.append(Paragraph("Kritik seviyede şikayet bulunmamaktadır.", normal_style))

doc.build(elements)
print("PDF generated successfully.")
