from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import openpyxl

from app.database import get_db
from app import models

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/pdf")
def generate_pdf_report(db: Session = Depends(get_db)):
    file_path = "report.pdf"

    reviews = db.query(models.Review).all()

    c = canvas.Canvas(file_path, pagesize=letter)
    y = 750

    c.drawString(50, y, "Hotel Review AI - Yonetici Raporu")
    y -= 30

    for review in reviews[:20]:
        text = f"{review.comment[:50]} | {review.sentiment} | {review.issue_category}"
        c.drawString(50, y, text)
        y -= 20

        if y < 50:
            c.showPage()
            y = 750

    c.save()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="hotel_review_report.pdf"
    )


@router.get("/excel")
def generate_excel_report(db: Session = Depends(get_db)):
    file_path = "report.xlsx"

    reviews = db.query(models.Review).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Reviews"

    ws.append(["ID", "Comment", "Sentiment", "Category", "Score", "Risk Score"])

    for review in reviews:
        ws.append([
            review.id,
            review.comment,
            review.sentiment,
            review.issue_category,
            review.satisfaction_score,
            review.risk_score
        ])

    wb.save(file_path)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="hotel_review_report.xlsx"
    )