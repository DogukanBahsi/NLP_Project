import logging
import sys
from transformers import pipeline

logging.basicConfig(level=logging.DEBUG)
print("Starting verbose model load...")
try:
    pipe = pipeline(
        "sentiment-analysis",
        model="nlptown/bert-base-multilingual-uncased-sentiment"
    )
    print("Success!")
    print(pipe("This is a test."))
except Exception as e:
    print(f"Error: {e}")
