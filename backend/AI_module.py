from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import time
from collections import deque

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend

# --- IN-MEMORY STORAGE (Replace with Database in Prod) ---
vote_logs = []
vote_timestamps = deque(maxlen=20) # Keep track of last 20 votes for burst detection

# --- 1. VOTE TRACKING & ANOMALY DETECTION ---
@app.route('/track-vote', methods=['POST'])
def track_vote():
    data = request.json
    current_time = time.time()
    
    # Log vote
    vote_logs.append(data)
    vote_timestamps.append(current_time)
    
    # Check for "Vote Burst" (Bot Detection)
    # If 5 votes happened in less than 2 seconds
    burst_detected = False
    if len(vote_timestamps) >= 5:
        if vote_timestamps[-1] - vote_timestamps[-5] < 2.0:
            burst_detected = True
            print("⚠️ ANOMALY: High frequency voting detected!")

    return jsonify({
        "status": "logged", 
        "burst_warning": burst_detected
    })

# --- 2. AI SENTIMENT ANALYSIS ---
@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Analyzes proposals or forum comments to gauge campus mood.
    """
    data = request.json
    text_content = data.get('text', '')
    
    if not text_content:
        return jsonify({"error": "No text provided"}), 400

    # AI Processing
    blob = TextBlob(text_content)
    polarity = blob.sentiment.polarity  # -1 (Negative) to +1 (Positive)
    subjectivity = blob.sentiment.subjectivity # 0 (Fact) to 1 (Opinion)

    # Determine Verdict
    verdict = "Neutral"
    if polarity > 0.1: verdict = "Positive"
    if polarity < -0.1: verdict = "Negative"

    return jsonify({
        "score": polarity,
        "subjectivity": subjectivity,
        "verdict": verdict,
        "keywords": list(blob.noun_phrases) # Extract key topics
    })

# --- 3. GENERAL ANALYTICS ENDPOINT ---
@app.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    return jsonify({
        "total_votes_tracked": len(vote_logs),
        "active_nodes": 4, # Mock decentralized stat
        "network_health": "Optimal"
    })

if __name__ == '__main__':
    print("🤖 TrustChain AI Analytics Node Running on Port 5000...")
    app.run(debug=True, port=5000)
