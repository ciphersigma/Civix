from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from app.utils.helpers import load_json_file, is_expired
from collections import Counter

stats_bp = Blueprint('stats', __name__)

REPORTS_FILE = 'reports.json'
USERS_FILE = 'users.json'

@stats_bp.route('/stats', methods=['GET'])
def get_stats():
    reports = load_json_file(REPORTS_FILE)
    users = load_json_file(USERS_FILE)
    
    active_reports = [r for r in reports if not is_expired(r['expiresAt'])]
    
    today = datetime.now().date()
    reports_today = [r for r in reports if datetime.fromisoformat(r['createdAt']).date() == today]
    
    area_counter = Counter()
    for report in reports:
        lat = round(report['latitude'], 2)
        lng = round(report['longitude'], 2)
        area_counter[(lat, lng)] += 1
    
    top_areas = [
        {'name': f"{lat}, {lng}", 'reportCount': count}
        for (lat, lng), count in area_counter.most_common(5)
    ]
    
    return jsonify({
        'totalReports': len(reports),
        'activeReports': len(active_reports),
        'totalUsers': len(users),
        'reportsToday': len(reports_today),
        'topAreas': top_areas
    })
