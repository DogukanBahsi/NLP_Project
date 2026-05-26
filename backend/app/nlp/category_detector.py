def detect_issue_category(text: str) -> str:
    if not text:
        return "genel"

    text = text.lower()

    categories = {
        "temizlik": ["dirty", "clean", "unclean", "hygiene", "smell", "dust", "kirli", "temiz", "hijyen", "koku", "toz", "leke"],
        "resepsiyon": ["reception", "check-in", "check out", "front desk", "guest relations", "resepsiyon", "giriş", "çıkış", "karşılama"],
        "oda": ["room", "bed", "bathroom", "shower", "air condition", "ac", "oda", "yatak", "banyo", "duş", "klima"],
        "yemek": ["food", "breakfast", "restaurant", "dinner", "lunch", "buffet", "yemek", "kahvaltı", "restoran", "akşam yemeği", "büfe"],
        "wifi": ["wifi", "internet", "connection", "wi-fi", "bağlantı"],
        "fiyat": ["price", "expensive", "cheap", "value", "money", "fiyat", "pahalı", "ucuz", "para", "değer"],
        "personel": ["staff", "employee", "manager", "service", "waiter", "personel", "çalışan", "müdür", "hizmet", "garson"],
        "konum": ["location", "near", "distance", "center", "transport", "konum", "yakın", "merkez", "ulaşım", "mesafe"],
        "gürültü": ["noise", "loud", "music", "sound", "party", "thin walls", "gürültü", "ses", "müzik", "duvar", "yüksek ses"],
        "havuz": ["pool", "swimming pool", "havuz"],
        "spa": ["spa", "massage", "sauna", "hamam", "masaj"],
        "plaj": ["beach", "sea", "shore", "plaj", "deniz", "sahil"],
        "otopark": ["parking", "car park", "valet", "otopark", "vale", "park"],
        "güvenlik": ["security", "safe", "unsafe", "danger", "güvenlik", "güvenli", "tehlike"],
        "çocuk": ["kids", "children", "family", "baby", "çocuk", "aile", "bebek"]
    }

    scores = {}

    for category, keywords in categories.items():
        scores[category] = 0

        for keyword in keywords:
            if keyword in text:
                scores[category] += 1

    best_category = max(scores, key=scores.get)

    if scores[best_category] == 0:
        return "genel"

    return best_category