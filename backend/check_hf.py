import requests
import sys

def check_hf():
    print("Checking connection to HuggingFace...")
    try:
        r = requests.get("https://huggingface.co/api/models/nlptown/bert-base-multilingual-uncased-sentiment", timeout=10)
        print(f"HF API Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"HF API Error: {e}")

if __name__ == "__main__":
    check_hf()
