from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.auth import generate_token, require_auth
from app.utils.helpers import load_json_file, save_json_file

users_bp = Blueprint('users', __name__)

USERS_FILE = 'users.json'
REPORTS_FILE = 'reports.json'

@users_bp.route('/users/register', methods=['POST'])
def register():
    data = request.json
    device_id = data.get('deviceId')
    
    if not device_id:
        return jsonify({'error': {'code': 'INVALID_REQUEST', 'message': 'Device ID required', 'status': 400}}), 400
    
    users = load_json_file(USERS_FILE)
    existing_user = next((u for u in users if u['deviceId'] == device_id), None)
    
    if existing_user:
        token = generate_token(existing_user['userId'])
        return jsonify({
            'userId': existing_user['userId'],
            'token': token,
            'createdAt': existing_user['createdAt']
        })
    
    user_id = f"user_{int(datetime.now().timestamp() * 1000)}"
    new_user = {
        'userId': user_id,
        'deviceId': device_id,
        'name': data.get('name', ''),
        'phone': data.get('phone', ''),
        'fcmToken': data.get('fcmToken', ''),
        'createdAt': datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_json_file(USERS_FILE, users)
    
    token = generate_token(user_id)
    
    return jsonify({
        'userId': user_id,
        'token': token,
        'createdAt': new_user['createdAt']
    }), 201

@users_bp.route('/users/me', methods=['GET'])
@require_auth
def get_profile():
    users = load_json_file(USERS_FILE)
    user = next((u for u in users if u['userId'] == request.user_id), None)
    
    if not user:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'User not found', 'status': 404}}), 404
    
    reports = load_json_file(REPORTS_FILE)
    user_reports = [r for r in reports if r.get('userId') == request.user_id]
    
    return jsonify({
        'userId': user['userId'],
        'name': user.get('name', ''),
        'phone': user.get('phone', ''),
        'reportsCount': len(user_reports),
        'joinedAt': user['createdAt']
    })

@users_bp.route('/users/me', methods=['PUT'])
@require_auth
def update_profile():
    data = request.json
    users = load_json_file(USERS_FILE)
    user = next((u for u in users if u['userId'] == request.user_id), None)
    
    if not user:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'User not found', 'status': 404}}), 404
    
    user['name'] = data.get('name', user.get('name', ''))
    user['phone'] = data.get('phone', user.get('phone', ''))
    user['fcmToken'] = data.get('fcmToken', user.get('fcmToken', ''))
    
    save_json_file(USERS_FILE, users)
    
    return jsonify({'message': 'Profile updated successfully'})
