import pandas as pd
import re

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# ========================
# VERİ YÜKLE
# ========================
df = pd.read_csv("Data/reviews.csv")

# ========================
# LABEL OLUŞTUR
# ========================
df['label'] = df['Rating'].apply(lambda x: 1 if x >= 4 else 0)

# ========================
# TEMİZLEME
# ========================
def temizle(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return text

df['clean'] = df['Review'].apply(temizle)

# ========================
# VERİYİ BÖL
# ========================
X_train, X_test, y_train, y_test = train_test_split(
    df['clean'], df['label'], test_size=0.2
)

# ========================
# TF-IDF
# ========================
vectorizer = TfidfVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# ========================
# MODEL
# ========================
model = LogisticRegression()
model.fit(X_train_vec, y_train)

# ========================
# TAHMİN
# ========================
y_pred = model.predict(X_test_vec)

# ========================
# SONUÇ
# ========================
print("\nMODEL SONUÇLARI:\n")
print(classification_report(y_test, y_pred))

temalar = {
    "temizlik": ["dirty", "clean", "smell"],
    "gürültü": ["noise", "loud"],
    "personel": ["staff", "service"],
    "fiyat": ["price", "expensive"],
    "oda": ["room", "bed"],
    "wifi": ["wifi", "internet"]
}

# ========================
# ŞİKAYET ANALİZİ
# ========================

def sikayet_bul(text):
    bulunanlar = []
    for kategori, kelimeler in temalar.items():
        for kelime in kelimeler:
            if kelime in text:
                bulunanlar.append(kategori)
                break
    return bulunanlar

df['issues'] = df['clean'].apply(sikayet_bul)

# sadece negatifleri incele
negatifler = df[df['label'] == 0]

print("\nÖRNEK ŞİKAYETLER:\n")
print(negatifler[['clean', 'issues']].head(10))

# ========================
# YÖNETİCİ ÖZETİ
# ========================

from collections import Counter

# sadece negatif yorumlar
negatifler = df[df['label'] == 0]

# tüm sorunları topla
tum_sorunlar = []

for liste in negatifler['issues']:
    tum_sorunlar.extend(liste)

# say
sayim = Counter(tum_sorunlar)

print("\nYÖNETİCİ ÖZETİ:\n")

print("En çok şikayet edilen konular:")
for konu, adet in sayim.most_common(5):
    print(f"- {konu}: {adet} şikayet")

# basit öneri sistemi
print("\nÖnerilen aksiyonlar:")

for konu, adet in sayim.most_common(3):
    if konu == "temizlik":
        print("- Temizlik ekipleri denetlenmeli")
    elif konu == "gürültü":
        print("- Ses izolasyonu artırılmalı")
    elif konu == "personel":
        print("- Personel eğitimi artırılmalı")
    elif konu == "fiyat":
        print("- Fiyat politikası gözden geçirilmeli")
    elif konu == "oda":
        print("- Oda konforu iyileştirilmeli")
    elif konu == "wifi":
        print("- İnternet altyapısı güçlendirilmeli")

        print("\nHATALI TAHMİNLER:\n")

hatalar = X_test[y_test != y_pred]

print(hatalar.head(5))