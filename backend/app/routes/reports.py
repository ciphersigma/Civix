from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.utils.auth import require_auth
from app.utils.helpers import calculate_distance, load_json_file, save_json_file, is_expired
import base64
import os

reports_bp = Blueprint('reports', __name__)

REPORTS_FILE = 'reports.json'
VOTES_FILE = 'votes.json'

@reports_bp.route('/reports', methods=['GET'])
def get_reports():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 10000, type=int)
    
    reports = load_json_file(REPORTS_FILE)
    valid_reports = [r for r in reports if not is_expired(r['expiresAt'])]
    save_json_file(REPORTS_FILE, valid_reports)
    
    if lat and lng:
        for report in valid_reports:
            report['distance'] = int(calculate_distance(lat, lng, report['latitude'], report['longitude']))
        valid_reports = [r for r in valid_reports if r['distance'] <= radius]
        valid_reports.sort(key=lambda x: x['distance'])
    
    return jsonify(valid_reports)

@reports_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    reports = load_json_file(REPORTS_FILE)
    report = next((r for r in reports if r['id'] == report_id), None)
    
    if not report:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Report not found', 'status': 404}}), 404
    
    if is_expired(report['expiresAt']):
        return jsonify({'error': {'code': 'EXPIRED', 'message': 'Report has expired', 'status': 410}}), 410
    
    return jsonify(report)

@reports_bp.route('/reports', methods=['POST'])
@require_auth
def create_report():
    data = request.json
    
    if not data.get('latitude') or not data.get('longitude'):
        return jsonify({'error': {'code': 'INVALID_REQUEST', 'message': 'Latitude and longitude required', 'status': 400}}), 400
    
    reports = load_json_file(REPORTS_FILE)
    
    new_report = {
        'id': int(datetime.now().timestamp() * 1000),
        'latitude': data['latitude'],
        'longitude': data['longitude'],
        'severity': data.get('severity', 'MEDIUM'),
        'depth': data.get('depth', 'UNKNOWN'),
        'photoUrl': data.get('photoUrl'),
        'description': data.get('description', ''),
        'userId': request.user_id,
        'votes': 0,
        'createdAt': datetime.now().isoformat(),
        'expiresAt': (datetime.now() + timedelta(hours=4)).isoformat()
    }
    
    reports.append(new_report)
    save_json_file(REPORTS_FILE, reports)
    
    return jsonify(new_report), 201

@reports_bp.route('/reports/<int:report_id>', methods=['DELETE'])
@require_auth
def delete_report(report_id):
    reports = load_json_file(REPORTS_FILE)
    report = next((r for r in reports if r['id'] == report_id), None)
    
    if not report:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Report not found', 'status': 404}}), 404
    
    if report['userId'] != request.user_id:
        return jsonify({'error': {'code': 'FORBIDDEN', 'message': 'Not authorized', 'status': 403}}), 403
    
    reports = [r for r in reports if r['id'] != report_id]
    save_json_file(REPORTS_FILE, reports)
    
    return jsonify({'message': 'Report deleted successfully'})

@reports_bp.route('/reports/<int:report_id>/vote', methods=['POST'])
@require_auth
def vote_report(report_id):
    data = request.json
    vote = data.get('vote', 0)
    
    if vote not in [-1, 1]:
        return jsonify({'error': {'code': 'INVALID_VOTE', 'message': 'Vote must be 1 or -1', 'status': 400}}), 400
    
    reports = load_json_file(REPORTS_FILE)
    votes = load_json_file(VOTES_FILE)
    
    report = next((r for r in reports if r['id'] == report_id), None)
    if not report:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Report not found', 'status': 404}}), 404
    
    vote_key = f"{request.user_id}_{report_id}"
    existing_vote = next((v for v in votes if v['key'] == vote_key), None)
    
    if existing_vote:
        report['votes'] -= existing_vote['vote']
        existing_vote['vote'] = vote
    else:
        votes.append({'key': vote_key, 'vote': vote, 'userId': request.user_id, 'reportId': report_id})
    
    report['votes'] += vote
    
    save_json_file(REPORTS_FILE, reports)
    save_json_file(VOTES_FILE, votes)
    
    return jsonify({'reportId': report_id, 'votes': report['votes'], 'userVote': vote})

@reports_bp.route('/reports/<int:report_id>/verify', methods=['POST'])
@require_auth
def verify_report(report_id):
    reports = load_json_file(REPORTS_FILE)
    report = next((r for r in reports if r['id'] == report_id), None)
    
    if not report:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Report not found', 'status': 404}}), 404
    
    report['expiresAt'] = (datetime.now() + timedelta(hours=5)).isoformat()
    report['verifiedAt'] = datetime.now().isoformat()
    
    save_json_file(REPORTS_FILE, reports)
    
    return jsonify({
        'reportId': report_id,
        'verified': True,
        'verifiedAt': report['verifiedAt'],
        'expiresAt': report['expiresAt']
    })
