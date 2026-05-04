def detect_issue_category(comment: str) -> str:
    text = comment.lower()

    categories = {
        "temizlik": ["kirli", "pis", "temiz değil", "leke", "toz", "koku", "çarşaf", "havlu"],
        "resepsiyon": ["resepsiyon", "personel", "çalışan", "ilgisiz", "kaba", "check-in", "check in"],
        "oda": ["oda", "yatak", "klima", "duş", "banyo", "manzara", "ses", "gürültü"],
        "yemek": ["kahvaltı", "yemek", "restoran", "menü", "lezzet", "açık büfe"],
        "wifi": ["wifi", "internet", "bağlantı", "çekmiyor", "yavaş internet"],
        "fiyat": ["pahalı", "fiyat", "ücret", "para", "değmez", "fiyat performans"]
    }

    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text:
                return category

    return "genel"