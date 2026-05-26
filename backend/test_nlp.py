import time
from app.nlp.bert_analyzer import analyze_with_bert

def test_bert():
    print("Initializing BERT model (this may take time if downloading for the first time)...")
    start_time = time.time()
    
    test_comment = "Bu otel gerçekten harikaydı, her şey mükemmeldi."
    result = analyze_with_bert(test_comment)
    
    end_time = time.time()
    print(f"Analysis successful!")
    print(f"Result: {result}")
    print(f"Time taken: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    test_bert()
