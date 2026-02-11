"""
AI Analytics Module for Governance Monitoring

This module provides lightweight analytics for governance monitoring, including:
- Vote burst detection for identifying potential manipulation
- Participation rate calculation and classification
- Sentiment analysis of proposal text
- Comprehensive governance report generation

Author: AI Analytics Team
Date: 2026-02-11
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Union
import json

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("Warning: TextBlob not available. Sentiment analysis will use fallback method.")


def format_timestamp(timestamp: Union[datetime, int, float]) -> datetime:
    """
    Convert various timestamp formats to datetime object.
    
    Args:
        timestamp: Can be datetime object, Unix timestamp (int/float), or string
        
    Returns:
        datetime: Standardized datetime object
        
    Raises:
        ValueError: If timestamp format is not supported
    """
    if isinstance(timestamp, datetime):
        return timestamp
    elif isinstance(timestamp, (int, float)):
        # Assume Unix timestamp
        return datetime.fromtimestamp(timestamp)
    elif isinstance(timestamp, str):
        # Try to parse ISO format
        try:
            return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError(f"Unsupported timestamp string format: {timestamp}")
    else:
        raise ValueError(f"Unsupported timestamp type: {type(timestamp)}")


def detect_vote_burst(vote_timestamps: List[Union[datetime, int, float]]) -> Dict[str, Any]:
    """
    Detect if there's a suspicious burst of votes in a short time window.
    
    This function checks for potential vote manipulation by identifying if more than
    5 votes occur within a 30-second window.
    
    Args:
        vote_timestamps: List of datetime objects or Unix timestamps
        
    Returns:
        dict: Anomaly detection results with the following structure:
            {
                "is_anomaly": bool,
                "burst_count": int,
                "time_window": str,
                "message": str
            }
            
    Example:
        >>> timestamps = [datetime.now() for _ in range(10)]
        >>> result = detect_vote_burst(timestamps)
        >>> print(result["is_anomaly"])
        True
    """
    try:
        # Handle empty list
        if not vote_timestamps:
            return {
                "is_anomaly": False,
                "burst_count": 0,
                "time_window": "30 seconds",
                "message": "No votes to analyze"
            }
        
        # Convert all timestamps to datetime objects
        timestamps = [format_timestamp(ts) for ts in vote_timestamps]
        
        # Sort timestamps to ensure chronological order
        timestamps.sort()
        
        # Initialize variables for burst detection
        max_burst_count = 0
        time_window_seconds = 30
        
        # Optimized sliding window approach using two pointers (O(n) complexity)
        # This is more efficient than nested loops for large datasets
        left = 0
        for right in range(len(timestamps)):
            # Move left pointer forward while window exceeds 30 seconds
            while left < right and (timestamps[right] - timestamps[left]).total_seconds() > time_window_seconds:
                left += 1
            
            # Count votes in current window
            votes_in_window = right - left + 1
            
            # Update max burst count
            if votes_in_window > max_burst_count:
                max_burst_count = votes_in_window
        
        # Determine if this is an anomaly (more than 5 votes in 30 seconds)
        is_anomaly = max_burst_count > 5
        
        # Create the result message
        if is_anomaly:
            message = f"Detected {max_burst_count} votes within 30 seconds"
        else:
            message = "Normal voting pattern"
        
        return {
            "is_anomaly": is_anomaly,
            "burst_count": max_burst_count,
            "time_window": "30 seconds",
            "message": message
        }
        
    except Exception as e:
        # Error handling - return safe default
        return {
            "is_anomaly": False,
            "burst_count": 0,
            "time_window": "30 seconds",
            "message": f"Error during burst detection: {str(e)}"
        }


def calculate_participation(total_voters: int, total_users: int) -> Dict[str, Any]:
    """
    Calculate governance participation rate with classification.
    
    Args:
        total_voters: Number of users who voted
        total_users: Total number of eligible users
        
    Returns:
        dict: Participation metrics with the following structure:
            {
                "participation_rate": float,
                "total_voters": int,
                "total_users": int,
                "level": str (High/Medium/Low),
                "message": str
            }
            
    Classification:
        - High: >= 50%
        - Medium: 25% - 49%
        - Low: < 25%
        
    Example:
        >>> result = calculate_participation(75, 200)
        >>> print(result["participation_rate"])
        37.5
        >>> print(result["level"])
        'Medium'
    """
    try:
        # Validate inputs
        if total_users <= 0:
            return {
                "participation_rate": 0.0,
                "total_voters": total_voters,
                "total_users": total_users,
                "level": "Low",
                "message": "Invalid total users count"
            }
        
        if total_voters < 0:
            total_voters = 0
        
        # Ensure voters don't exceed total users
        if total_voters > total_users:
            total_voters = total_users
        
        # Calculate participation rate
        participation_rate = (total_voters / total_users) * 100
        participation_rate = round(participation_rate, 2)
        
        # Classify participation level
        if participation_rate >= 50:
            level = "High"
        elif participation_rate >= 25:
            level = "Medium"
        else:
            level = "Low"
        
        # Create message
        message = f"{participation_rate}% participation rate - {level} engagement"
        
        return {
            "participation_rate": participation_rate,
            "total_voters": total_voters,
            "total_users": total_users,
            "level": level,
            "message": message
        }
        
    except Exception as e:
        # Error handling
        return {
            "participation_rate": 0.0,
            "total_voters": total_voters,
            "total_users": total_users,
            "level": "Low",
            "message": f"Error calculating participation: {str(e)}"
        }


def sentiment_analysis(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment of proposal text or comments.
    
    Uses TextBlob library for polarity analysis if available, otherwise falls back
    to simple keyword matching.
    
    Args:
        text: Text to analyze (proposal text, comment, etc.)
        
    Returns:
        dict: Sentiment analysis results with the following structure:
            {
                "text": str (snippet),
                "polarity_score": float (-1 to +1),
                "sentiment": str (Positive/Neutral/Negative),
                "confidence": str (High/Medium/Low),
                "message": str
            }
            
    Sentiment Classification:
        - Positive: polarity > 0.1
        - Negative: polarity < -0.1
        - Neutral: -0.1 to 0.1
        
    Confidence Classification:
        - High: |polarity| > 0.5
        - Medium: |polarity| 0.2-0.5
        - Low: |polarity| < 0.2
        
    Example:
        >>> result = sentiment_analysis("This proposal will greatly improve our community!")
        >>> print(result["sentiment"])
        'Positive'
    """
    try:
        # Validate input
        if not text or not isinstance(text, str):
            return {
                "text": "",
                "polarity_score": 0.0,
                "sentiment": "Neutral",
                "confidence": "Low",
                "message": "No text provided for analysis"
            }
        
        # Get text snippet (first 100 chars for display)
        text_snippet = text[:100] + "..." if len(text) > 100 else text
        
        # Calculate polarity score
        if TEXTBLOB_AVAILABLE:
            # Use TextBlob for sentiment analysis
            blob = TextBlob(text)
            polarity_score = blob.sentiment.polarity
        else:
            # Fallback: Simple keyword-based sentiment
            polarity_score = _simple_sentiment_score(text)
        
        # Round polarity score
        polarity_score = round(polarity_score, 2)
        
        # Classify sentiment
        if polarity_score > 0.1:
            sentiment = "Positive"
        elif polarity_score < -0.1:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        # Classify confidence based on absolute polarity
        abs_polarity = abs(polarity_score)
        if abs_polarity > 0.5:
            confidence = "High"
        elif abs_polarity >= 0.2:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Create message
        message = f"{sentiment} sentiment detected"
        
        return {
            "text": text_snippet,
            "polarity_score": polarity_score,
            "sentiment": sentiment,
            "confidence": confidence,
            "message": message
        }
        
    except Exception as e:
        # Error handling
        return {
            "text": text[:100] if text else "",
            "polarity_score": 0.0,
            "sentiment": "Neutral",
            "confidence": "Low",
            "message": f"Error during sentiment analysis: {str(e)}"
        }


def _simple_sentiment_score(text: str) -> float:
    """
    Simple fallback sentiment scoring using keyword matching.
    
    Args:
        text: Text to analyze
        
    Returns:
        float: Polarity score between -1 and 1
    """
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Define positive and negative keywords
    positive_keywords = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
        'improve', 'benefit', 'positive', 'support', 'agree', 'yes',
        'love', 'best', 'perfect', 'outstanding', 'approve', 'success'
    ]
    
    negative_keywords = [
        'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst',
        'decline', 'harm', 'negative', 'oppose', 'disagree', 'no',
        'hate', 'fail', 'reject', 'concern', 'problem', 'issue'
    ]
    
    # Count occurrences
    positive_count = sum(1 for word in positive_keywords if word in text_lower)
    negative_count = sum(1 for word in negative_keywords if word in text_lower)
    
    # Calculate score
    total_count = positive_count + negative_count
    if total_count == 0:
        return 0.0
    
    # Normalize to -1 to 1 range
    score = (positive_count - negative_count) / max(total_count, 1)
    
    # Scale to be less extreme (multiply by 0.7 to keep it in reasonable range)
    return score * 0.7


def classify_governance_health(
    participation_rate: float,
    has_anomalies: bool,
    average_sentiment: float
) -> str:
    """
    Classify overall governance health based on multiple factors.
    
    Args:
        participation_rate: Participation percentage (0-100)
        has_anomalies: Whether voting anomalies were detected
        average_sentiment: Average sentiment polarity (-1 to 1)
        
    Returns:
        str: Health classification (Excellent/Good/Fair/Poor)
    """
    # Start with base score
    score = 0
    
    # Participation scoring (0-40 points)
    if participation_rate >= 50:
        score += 40
    elif participation_rate >= 25:
        score += 25
    else:
        score += 10
    
    # Anomaly scoring (0-30 points)
    if not has_anomalies:
        score += 30
    else:
        score += 0
    
    # Sentiment scoring (0-30 points)
    if average_sentiment > 0.3:
        score += 30
    elif average_sentiment > 0:
        score += 20
    elif average_sentiment > -0.3:
        score += 10
    else:
        score += 0
    
    # Classify based on total score (0-100)
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Fair"
    else:
        return "Poor"


def generate_governance_report(
    vote_timestamps: List[Union[datetime, int, float]] = None,
    total_voters: int = 0,
    total_users: int = 100,
    proposal_texts: List[str] = None,
    vote_yes_count: int = 0,
    vote_no_count: int = 0
) -> Dict[str, Any]:
    """
    Generate comprehensive governance analytics report.
    
    This function aggregates data from all analytics functions to provide
    a complete overview of governance health.
    
    Args:
        vote_timestamps: List of recent vote timestamps (optional)
        total_voters: Total number of voters
        total_users: Total number of eligible users
        proposal_texts: List of recent proposal texts for sentiment analysis
        vote_yes_count: Number of yes votes
        vote_no_count: Number of no votes
        
    Returns:
        dict: Comprehensive governance report with the following structure:
            {
                "report_date": str (ISO format),
                "anomaly_detection": dict,
                "participation_metrics": dict,
                "sentiment_insights": dict,
                "vote_distribution": dict,
                "recommendations": list,
                "summary": str
            }
            
    Example:
        >>> timestamps = [datetime.now() for _ in range(5)]
        >>> texts = ["Great proposal!", "I support this"]
        >>> report = generate_governance_report(
        ...     vote_timestamps=timestamps,
        ...     total_voters=75,
        ...     total_users=200,
        ...     proposal_texts=texts
        ... )
        >>> print(report["summary"])
        'Governance health: Good'
    """
    try:
        # Initialize default values
        if vote_timestamps is None:
            vote_timestamps = []
        if proposal_texts is None:
            proposal_texts = []
        
        # Get current timestamp for report
        report_date = datetime.now().isoformat()
        
        # 1. Anomaly Detection
        anomaly_result = detect_vote_burst(vote_timestamps)
        anomaly_status = "warning" if anomaly_result["is_anomaly"] else "normal"
        
        # 2. Participation Metrics
        participation_result = calculate_participation(total_voters, total_users)
        
        # 3. Sentiment Analysis
        sentiment_scores = []
        for text in proposal_texts:
            sentiment_result = sentiment_analysis(text)
            sentiment_scores.append(sentiment_result["polarity_score"])
        
        # Calculate average sentiment
        if sentiment_scores:
            average_polarity = round(sum(sentiment_scores) / len(sentiment_scores), 2)
            # Determine overall sentiment
            if average_polarity > 0.1:
                overall_sentiment = "Positive"
            elif average_polarity < -0.1:
                overall_sentiment = "Negative"
            else:
                overall_sentiment = "Neutral"
        else:
            average_polarity = 0.0
            overall_sentiment = "Neutral"
        
        sentiment_insights = {
            "overall_sentiment": overall_sentiment,
            "average_polarity": average_polarity,
            "analyzed_proposals": len(proposal_texts)
        }
        
        # 4. Vote Distribution
        total_votes = vote_yes_count + vote_no_count
        vote_distribution = {
            "yes_votes": vote_yes_count,
            "no_votes": vote_no_count,
            "total_votes": total_votes,
            "yes_percentage": round((vote_yes_count / total_votes * 100), 2) if total_votes > 0 else 0,
            "no_percentage": round((vote_no_count / total_votes * 100), 2) if total_votes > 0 else 0
        }
        
        # 5. Generate Recommendations
        recommendations = []
        
        # Participation recommendation
        if participation_result["level"] == "High":
            recommendations.append("Participation is high - maintain engagement strategies")
        elif participation_result["level"] == "Medium":
            recommendations.append("Participation is moderate - consider incentives to boost engagement")
        else:
            recommendations.append("Low participation detected - implement engagement campaigns")
        
        # Anomaly recommendation
        if anomaly_result["is_anomaly"]:
            recommendations.append(f"Warning: {anomaly_result['message']} - investigate potential manipulation")
        else:
            recommendations.append("No voting anomalies detected")
        
        # Sentiment recommendation
        if overall_sentiment == "Positive":
            recommendations.append("Overall positive sentiment in proposals")
        elif overall_sentiment == "Negative":
            recommendations.append("Negative sentiment detected - address community concerns")
        else:
            recommendations.append("Neutral sentiment - monitor community feedback")
        
        # Vote distribution recommendation
        if total_votes > 0:
            if vote_distribution["yes_percentage"] > 70:
                recommendations.append("Strong consensus in favor of proposals")
            elif vote_distribution["no_percentage"] > 70:
                recommendations.append("Proposals facing strong opposition - review criteria")
            else:
                recommendations.append("Mixed voting results - proposals are contentious")
        
        # 6. Overall Health Summary
        health_classification = classify_governance_health(
            participation_result["participation_rate"],
            anomaly_result["is_anomaly"],
            average_polarity
        )
        
        summary = f"Governance health: {health_classification}"
        
        # Construct final report
        report = {
            "report_date": report_date,
            "anomaly_detection": {
                "status": anomaly_status,
                "details": anomaly_result
            },
            "participation_metrics": participation_result,
            "sentiment_insights": sentiment_insights,
            "vote_distribution": vote_distribution,
            "recommendations": recommendations,
            "summary": summary
        }
        
        return report
        
    except Exception as e:
        # Error handling - return minimal safe report
        return {
            "report_date": datetime.now().isoformat(),
            "anomaly_detection": {
                "status": "error",
                "details": {"message": f"Error: {str(e)}"}
            },
            "participation_metrics": {
                "participation_rate": 0.0,
                "level": "Low",
                "message": "Error generating metrics"
            },
            "sentiment_insights": {
                "overall_sentiment": "Neutral",
                "average_polarity": 0.0,
                "analyzed_proposals": 0
            },
            "vote_distribution": {
                "yes_votes": 0,
                "no_votes": 0,
                "total_votes": 0
            },
            "recommendations": [f"Error generating report: {str(e)}"],
            "summary": "Governance health: Unable to determine"
        }


# Example usage and testing
if __name__ == "__main__":
    print("=" * 60)
    print("AI ANALYTICS MODULE - EXAMPLE USAGE")
    print("=" * 60)
    
    # Example 1: Normal voting pattern
    print("\n1. Testing detect_vote_burst() - Normal pattern:")
    normal_timestamps = [
        datetime.now(),
        datetime.now() + timedelta(minutes=1),
        datetime.now() + timedelta(minutes=2),
        datetime.now() + timedelta(minutes=3)
    ]
    result = detect_vote_burst(normal_timestamps)
    print(json.dumps(result, indent=2))
    
    # Example 2: Vote burst detection
    print("\n2. Testing detect_vote_burst() - Burst pattern:")
    burst_timestamps = [datetime.now() + timedelta(seconds=i) for i in range(10)]
    result = detect_vote_burst(burst_timestamps)
    print(json.dumps(result, indent=2))
    
    # Example 3: Participation calculation
    print("\n3. Testing calculate_participation():")
    result = calculate_participation(75, 200)
    print(json.dumps(result, indent=2))
    
    # Example 4: Sentiment analysis - Positive
    print("\n4. Testing sentiment_analysis() - Positive:")
    result = sentiment_analysis("This proposal will greatly improve our community!")
    print(json.dumps(result, indent=2))
    
    # Example 5: Sentiment analysis - Negative
    print("\n5. Testing sentiment_analysis() - Negative:")
    result = sentiment_analysis("This is a terrible idea that will harm the community.")
    print(json.dumps(result, indent=2))
    
    # Example 6: Full governance report
    print("\n6. Testing generate_governance_report():")
    test_timestamps = [datetime.now() + timedelta(minutes=i) for i in range(5)]
    test_texts = [
        "This proposal will greatly improve our community!",
        "I support this initiative",
        "Great idea for the future"
    ]
    result = generate_governance_report(
        vote_timestamps=test_timestamps,
        total_voters=75,
        total_users=200,
        proposal_texts=test_texts,
        vote_yes_count=60,
        vote_no_count=15
    )
    print(json.dumps(result, indent=2))
    
    print("\n" + "=" * 60)
    print("All tests completed successfully!")
    print("=" * 60)
