# AI Analytics Module for Governance Monitoring

A lightweight, beginner-friendly Python module that provides insights into voting patterns, participation rates, and sentiment analysis for DAO governance systems.

## Features

- **Vote Burst Detection**: Identify potential vote manipulation or coordinated voting
- **Participation Calculation**: Measure and classify governance engagement levels
- **Sentiment Analysis**: Analyze the sentiment of proposals and comments
- **Comprehensive Reporting**: Generate detailed governance health reports

## Installation

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# Download TextBlob corpora (required for sentiment analysis)
python -m textblob.download_corpora
```

### Dependencies
- `textblob>=0.15.3` - For natural language processing and sentiment analysis

## Usage

### Import the Module

```python
from backend.ai_analytics import (
    detect_vote_burst,
    calculate_participation,
    sentiment_analysis,
    generate_governance_report
)
```

### 1. Vote Burst Detection

Detect if there's a suspicious burst of votes in a short time window (more than 5 votes within 30 seconds).

```python
from datetime import datetime, timedelta

# Example: Normal voting pattern
normal_votes = [
    datetime.now(),
    datetime.now() + timedelta(minutes=1),
    datetime.now() + timedelta(minutes=2)
]

result = detect_vote_burst(normal_votes)
print(result)
# Output:
# {
#   "is_anomaly": false,
#   "burst_count": 1,
#   "time_window": "30 seconds",
#   "message": "Normal voting pattern"
# }

# Example: Burst detection (10 votes in 10 seconds)
burst_votes = [datetime.now() + timedelta(seconds=i) for i in range(10)]
result = detect_vote_burst(burst_votes)
print(result)
# Output:
# {
#   "is_anomaly": true,
#   "burst_count": 10,
#   "time_window": "30 seconds",
#   "message": "Detected 10 votes within 30 seconds"
# }
```

**Accepts:**
- List of `datetime` objects
- List of Unix timestamps (integers or floats)
- Mixed formats

**Returns:** JSON-serializable dictionary with anomaly flag and details

### 2. Participation Calculation

Calculate governance participation rate with automatic classification.

```python
result = calculate_participation(total_voters=75, total_users=200)
print(result)
# Output:
# {
#   "participation_rate": 37.5,
#   "total_voters": 75,
#   "total_users": 200,
#   "level": "Medium",
#   "message": "37.5% participation rate - Medium engagement"
# }
```

**Classification Levels:**
- **High**: ≥ 50% participation
- **Medium**: 25% - 49% participation
- **Low**: < 25% participation

**Returns:** JSON-serializable dictionary with rate, classification, and message

### 3. Sentiment Analysis

Analyze the sentiment of proposal text or comments using natural language processing.

```python
# Positive sentiment
result = sentiment_analysis("This proposal will greatly improve our community!")
print(result)
# Output:
# {
#   "text": "This proposal will greatly improve our community!",
#   "polarity_score": 1.0,
#   "sentiment": "Positive",
#   "confidence": "High",
#   "message": "Positive sentiment detected"
# }

# Negative sentiment
result = sentiment_analysis("This is a terrible idea that will harm the project.")
print(result)
# Output:
# {
#   "text": "This is a terrible idea that will harm the project.",
#   "polarity_score": -1.0,
#   "sentiment": "Negative",
#   "confidence": "High",
#   "message": "Negative sentiment detected"
# }
```

**Sentiment Classification:**
- **Positive**: polarity > 0.1
- **Negative**: polarity < -0.1
- **Neutral**: -0.1 to 0.1

**Confidence Levels:**
- **High**: |polarity| > 0.5
- **Medium**: |polarity| 0.2-0.5
- **Low**: |polarity| < 0.2

**Returns:** JSON-serializable dictionary with sentiment, polarity score, and confidence

### 4. Governance Report Generator

Generate a comprehensive governance analytics report combining all metrics.

```python
from datetime import datetime, timedelta

# Sample data
vote_timestamps = [datetime.now() + timedelta(minutes=i) for i in range(5)]
proposal_texts = [
    "This proposal will improve the platform",
    "Great idea for community growth",
    "I support this initiative"
]

report = generate_governance_report(
    vote_timestamps=vote_timestamps,
    total_voters=75,
    total_users=200,
    proposal_texts=proposal_texts,
    vote_yes_count=60,
    vote_no_count=15
)

print(report)
# Output includes:
# - Anomaly detection status
# - Participation metrics
# - Sentiment insights
# - Vote distribution
# - Recommendations
# - Overall health summary
```

**Returns:** Comprehensive JSON report with:
- Report timestamp
- Anomaly detection results
- Participation metrics
- Sentiment insights
- Vote distribution analysis
- AI-generated recommendations
- Overall governance health summary

## Understanding the Metrics

### Vote Burst Detection
- **Purpose**: Identify potential vote manipulation or coordinated voting attacks
- **Threshold**: More than 5 votes within a 30-second window triggers an anomaly
- **Use Case**: Monitor for suspicious voting patterns in real-time

### Participation Rate
- **Purpose**: Measure governance engagement and voter turnout
- **Calculation**: (total_voters / total_users) × 100
- **Interpretation**:
  - High (≥50%): Strong community engagement
  - Medium (25-49%): Moderate engagement, room for improvement
  - Low (<25%): Concerning engagement, action needed

### Sentiment Analysis
- **Purpose**: Understand community mood and proposal reception
- **Polarity Scale**: -1 (very negative) to +1 (very positive)
- **Use Case**: Gauge proposal quality and community satisfaction

### Governance Health
The overall health is classified as:
- **Excellent**: High participation, no anomalies, positive sentiment
- **Good**: Moderate-to-high participation, minimal issues
- **Fair**: Some concerns in one or more areas
- **Poor**: Multiple concerning metrics

## API Integration Examples

### Flask Backend Integration

```python
from flask import Flask, jsonify, request
from backend.ai_analytics import (
    detect_vote_burst,
    calculate_participation,
    sentiment_analysis,
    generate_governance_report
)

app = Flask(__name__)

@app.route('/api/analytics/report', methods=['GET'])
def get_governance_report():
    """Get full governance analytics report"""
    # Fetch data from database
    report = generate_governance_report(
        vote_timestamps=fetch_recent_votes(),
        total_voters=get_voter_count(),
        total_users=get_total_users(),
        proposal_texts=fetch_recent_proposals(),
        vote_yes_count=get_yes_votes(),
        vote_no_count=get_no_votes()
    )
    return jsonify(report)

@app.route('/api/analytics/participation', methods=['GET'])
def get_participation():
    """Get participation metrics"""
    result = calculate_participation(
        total_voters=get_voter_count(),
        total_users=get_total_users()
    )
    return jsonify(result)

@app.route('/api/analytics/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze text sentiment"""
    data = request.get_json()
    text = data.get('text', '')
    result = sentiment_analysis(text)
    return jsonify(result)

@app.route('/api/analytics/anomalies', methods=['GET'])
def check_anomalies():
    """Check for voting anomalies"""
    timestamps = fetch_recent_vote_timestamps()
    result = detect_vote_burst(timestamps)
    return jsonify(result)
```

## Error Handling

All functions include comprehensive error handling and will return safe default values if errors occur:

```python
# Example: Invalid input handling
result = sentiment_analysis("")
# Returns:
# {
#   "text": "",
#   "polarity_score": 0.0,
#   "sentiment": "Neutral",
#   "confidence": "Low",
#   "message": "No text provided for analysis"
# }

# Example: Empty vote list
result = detect_vote_burst([])
# Returns:
# {
#   "is_anomaly": false,
#   "burst_count": 0,
#   "time_window": "30 seconds",
#   "message": "No votes to analyze"
# }
```

## Testing

Run the built-in test examples:

```bash
cd backend
python3 ai_analytics.py
```

This will run all example test cases and display the results.

## Performance Considerations

- **Lightweight**: All functions are optimized for quick execution
- **Scalable**: Efficient algorithms for timestamp analysis
- **Memory-efficient**: Processes data in streaming fashion where possible
- **Caching**: Report results can be cached for frequently accessed data

**Recommended limits:**
- Analyze last 100-1000 votes for real-time monitoring
- Generate reports hourly or daily depending on activity
- Cache report results for 5-15 minutes

## Fallback Mechanisms

The module includes fallback mechanisms for robustness:

1. **TextBlob unavailable**: Falls back to keyword-based sentiment analysis
2. **Invalid timestamps**: Gracefully handles and converts various formats
3. **Missing data**: Provides sensible defaults and clear error messages

## Module Architecture

```
backend/
├── ai_analytics.py          # Main analytics module
│   ├── detect_vote_burst()           # Vote anomaly detection
│   ├── calculate_participation()     # Participation metrics
│   ├── sentiment_analysis()          # Sentiment analysis
│   ├── generate_governance_report()  # Comprehensive reporting
│   └── Helper functions
└── (Integration with app.py)
```

## Future Enhancements

Potential improvements for future versions:
- Machine learning-based anomaly detection
- Multi-language sentiment analysis
- Historical trend analysis
- Predictive analytics for participation
- Real-time streaming analytics
- Advanced visualization data preparation

## Contributing

This module is designed to be beginner-friendly and extensible. When contributing:
- Maintain clear, commented code
- Use type hints for all functions
- Include comprehensive docstrings
- Add error handling for edge cases
- Update tests and documentation

## License

This module is part of the ALGO_AI_2026 project.

## Support

For questions or issues, please refer to:
- Module docstrings for function-level documentation
- Example usage in the `if __name__ == "__main__"` block
- Integration examples in this README

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-11  
**Python Version**: 3.7+
