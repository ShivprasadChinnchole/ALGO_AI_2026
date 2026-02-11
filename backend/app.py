"""
Flask Backend for DAO Voting System with AI Analytics

This Flask application provides API endpoints for:
- Governance analytics and monitoring
- Vote burst detection
- Participation metrics
- Sentiment analysis
- Comprehensive governance reporting

Author: DAO Analytics Team
Date: 2026-02-11
"""

from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from ai_analytics import (
    detect_vote_burst,
    calculate_participation,
    sentiment_analysis,
    generate_governance_report
)

app = Flask(__name__)

# Sample data storage (in production, use a proper database)
# This is just for demonstration purposes
sample_votes = []
sample_proposals = []
sample_users_count = 100
sample_voters_count = 0


@app.route('/')
def home():
    """Home endpoint with API information"""
    return jsonify({
        "message": "DAO Voting System - AI Analytics API",
        "version": "1.0.0",
        "endpoints": {
            "analytics": {
                "GET /api/analytics/report": "Get full governance report",
                "GET /api/analytics/participation": "Get participation metrics",
                "POST /api/analytics/sentiment": "Analyze text sentiment",
                "GET /api/analytics/anomalies": "Check for voting anomalies",
                "GET /api/analytics/health": "Get governance health status"
            }
        }
    })


@app.route('/api/analytics/report', methods=['GET'])
def get_governance_report():
    """
    Get comprehensive governance analytics report
    
    Returns:
        JSON: Complete governance report with all metrics
    """
    try:
        # In production, fetch from database
        # For now, use sample data
        report = generate_governance_report(
            vote_timestamps=sample_votes,
            total_voters=sample_voters_count,
            total_users=sample_users_count,
            proposal_texts=sample_proposals,
            vote_yes_count=sample_voters_count // 2,
            vote_no_count=sample_voters_count // 2
        )
        
        return jsonify({
            "success": True,
            "data": report
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/analytics/participation', methods=['GET'])
def get_participation():
    """
    Get governance participation metrics
    
    Returns:
        JSON: Participation rate and classification
    """
    try:
        # In production, fetch from database
        result = calculate_participation(
            total_voters=sample_voters_count,
            total_users=sample_users_count
        )
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/analytics/sentiment', methods=['POST'])
def analyze_sentiment_api():
    """
    Analyze sentiment of provided text
    
    Request Body:
        {
            "text": "Text to analyze"
        }
    
    Returns:
        JSON: Sentiment analysis results
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'text' field in request body"
            }), 400
        
        text = data['text']
        result = sentiment_analysis(text)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/analytics/anomalies', methods=['GET'])
def check_anomalies():
    """
    Check for voting anomalies and burst patterns
    
    Returns:
        JSON: Anomaly detection results
    """
    try:
        # In production, fetch recent votes from database
        result = detect_vote_burst(sample_votes)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/analytics/health', methods=['GET'])
def get_health_status():
    """
    Get overall governance health status
    
    Returns:
        JSON: Quick health overview
    """
    try:
        # Generate report
        report = generate_governance_report(
            vote_timestamps=sample_votes,
            total_voters=sample_voters_count,
            total_users=sample_users_count,
            proposal_texts=sample_proposals
        )
        
        # Extract key health indicators
        health_status = {
            "status": report["summary"],
            "participation_level": report["participation_metrics"]["level"],
            "anomaly_status": report["anomaly_detection"]["status"],
            "sentiment": report["sentiment_insights"]["overall_sentiment"],
            "timestamp": report["report_date"]
        }
        
        return jsonify({
            "success": True,
            "data": health_status
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Demo/Testing endpoints
@app.route('/api/demo/add-vote', methods=['POST'])
def add_demo_vote():
    """
    Demo endpoint to add sample votes for testing
    
    Request Body:
        {
            "timestamp": "2026-02-11T10:30:00" (optional, defaults to now)
        }
    """
    try:
        global sample_voters_count
        
        data = request.get_json() or {}
        timestamp = data.get('timestamp')
        
        if timestamp:
            # Handle both Zulu time notation (Z) and explicit UTC offset formats
            # Replace 'Z' with '+00:00' for ISO format compatibility
            vote_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            vote_time = datetime.now()
        
        sample_votes.append(vote_time)
        sample_voters_count += 1
        
        return jsonify({
            "success": True,
            "message": f"Vote added at {vote_time.isoformat()}",
            "total_votes": len(sample_votes)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/demo/add-proposal', methods=['POST'])
def add_demo_proposal():
    """
    Demo endpoint to add sample proposals for testing
    
    Request Body:
        {
            "text": "Proposal text to analyze"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'text' field in request body"
            }), 400
        
        proposal_text = data['text']
        sample_proposals.append(proposal_text)
        
        # Analyze sentiment of the new proposal
        sentiment = sentiment_analysis(proposal_text)
        
        return jsonify({
            "success": True,
            "message": "Proposal added",
            "total_proposals": len(sample_proposals),
            "sentiment_analysis": sentiment
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/demo/reset', methods=['POST'])
def reset_demo_data():
    """Reset all demo data"""
    global sample_votes, sample_proposals, sample_voters_count
    
    sample_votes = []
    sample_proposals = []
    sample_voters_count = 0
    
    return jsonify({
        "success": True,
        "message": "Demo data reset successfully"
    })


@app.route('/api/demo/populate', methods=['POST'])
def populate_demo_data():
    """Populate with sample data for testing"""
    global sample_votes, sample_proposals, sample_voters_count
    
    # Reset first
    sample_votes = []
    sample_proposals = []
    sample_voters_count = 0
    
    # Add sample votes (5 votes spread over 10 minutes)
    base_time = datetime.now()
    for i in range(5):
        sample_votes.append(base_time + timedelta(minutes=i*2))
    
    sample_voters_count = 5
    
    # Add sample proposals
    sample_proposals = [
        "This proposal will greatly improve our community governance!",
        "I support this initiative for better transparency.",
        "Great idea that will benefit all members.",
        "We should implement this to enhance our platform."
    ]
    
    return jsonify({
        "success": True,
        "message": "Demo data populated",
        "votes_added": len(sample_votes),
        "proposals_added": len(sample_proposals)
    })


if __name__ == '__main__':
    print("=" * 60)
    print("DAO Voting System - AI Analytics API")
    print("=" * 60)
    print("\nStarting Flask server...")
    print("\nAvailable endpoints:")
    print("  GET  /                              - API information")
    print("  GET  /api/analytics/report          - Full governance report")
    print("  GET  /api/analytics/participation   - Participation metrics")
    print("  POST /api/analytics/sentiment       - Sentiment analysis")
    print("  GET  /api/analytics/anomalies       - Anomaly detection")
    print("  GET  /api/analytics/health          - Health status")
    print("\nDemo endpoints:")
    print("  POST /api/demo/populate             - Populate with sample data")
    print("  POST /api/demo/add-vote             - Add a sample vote")
    print("  POST /api/demo/add-proposal         - Add a sample proposal")
    print("  POST /api/demo/reset                - Reset demo data")
    print("\n" + "=" * 60)
    print("\nNOTE: For production deployment, set debug=False")
    print("=" * 60)
    
    # SECURITY: Debug mode should NEVER be enabled in production
    # Set to False for production deployments
    # Only use debug=True in local development environments
    import os
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
