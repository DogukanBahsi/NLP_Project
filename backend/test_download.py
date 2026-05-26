import requests
url = "https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment/resolve/main/config.json"
print(f"Downloading {url}...")
try:
    r = requests.get(url, timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Content: {r.text[:100]}")
except Exception as e:
    print(f"Error: {e}")
