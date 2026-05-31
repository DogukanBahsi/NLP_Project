"""
Resend ile e-posta gönderme yardımcısı.
RESEND_API_KEY env var'ından alınır.
"""
import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY", "")

# Gönderen adres — Resend'in ücretsiz sandbox'ında sadece
# onboarding@resend.dev kullanılabilir (kendi domain yoksa)
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
FROM_NAME  = os.getenv("FROM_NAME",  "HotelReviewAI")


def send_verification_email(to_email: str, username: str, code: str) -> bool:
    """6 haneli doğrulama kodunu e-posta ile gönder."""
    try:
        resend.Emails.send({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "E-posta Doğrulama Kodunuz",
            "html": f"""
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
                <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);padding:8px;border-radius:10px;display:inline-block;">
                  <span style="color:white;font-size:18px;">⚡</span>
                </div>
                <span style="font-size:1.2rem;font-weight:700;">HotelReview<span style="color:#3B82F6;">AI</span></span>
              </div>

              <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:8px;">Merhaba, {username}! 👋</h2>
              <p style="color:#94a3b8;margin-bottom:28px;">Hesabınızı doğrulamak için aşağıdaki kodu girin. Kod <strong style="color:#f8fafc;">10 dakika</strong> geçerlidir.</p>

              <div style="background:#1e293b;border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <span style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#3B82F6;">{code}</span>
              </div>

              <p style="color:#64748b;font-size:0.85rem;">Bu kodu siz istemediyseniz bu e-postayı görmezden gelin.</p>
            </div>
            """,
        })
        return True
    except Exception as e:
        print(f"E-posta gönderilemedi: {e}")
        return False
