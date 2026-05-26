"""
migrate_db.py
=============
Mevcut hotel_review_ai.db veritabanini yeni sema ile uyumlu hale getirir.

Yapilan degisiklikler:
  1. hotels tablosuna 4 yeni sutun eklenir:
       place_id  TEXT
       latitude  REAL
       longitude REAL
       address   TEXT
  2. external_ratings tablosu yoksa olusturulur.

Kullanim:
    cd backend
    python migrate_db.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "hotel_review_ai.db")


def column_exists(cursor, table: str, column: str) -> bool:
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def table_exists(cursor, table: str) -> bool:
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    )
    return cursor.fetchone() is not None


def run():
    print(f"[MIGRATE] Veritabani: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # ── 1. hotels tablosuna yeni sutunlar ────────────────────────────────────
    new_columns = [
        ("place_id",  "TEXT"),
        ("latitude",  "REAL"),
        ("longitude", "REAL"),
        ("address",   "TEXT"),
    ]

    for col_name, col_type in new_columns:
        if column_exists(cur, "hotels", col_name):
            print(f"[MIGRATE] hotels.{col_name} zaten mevcut, atlandi.")
        else:
            cur.execute(f"ALTER TABLE hotels ADD COLUMN {col_name} {col_type}")
            print(f"[MIGRATE] hotels.{col_name} ({col_type}) eklendi.")

    # ── 2. external_ratings tablosu ──────────────────────────────────────────
    if table_exists(cur, "external_ratings"):
        print("[MIGRATE] external_ratings tablosu zaten mevcut, atlandi.")
    else:
        cur.execute("""
            CREATE TABLE external_ratings (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                hotel_id     INTEGER NOT NULL REFERENCES hotels(id),
                platform     TEXT    NOT NULL,
                rating       REAL,
                max_rating   REAL,
                review_count INTEGER,
                url          TEXT,
                updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("[MIGRATE] external_ratings tablosu olusturuldu.")

    conn.commit()
    conn.close()
    print("[MIGRATE] Tamamlandi. Sunucuyu yeniden baslatabilirsiniz.")


if __name__ == "__main__":
    run()
