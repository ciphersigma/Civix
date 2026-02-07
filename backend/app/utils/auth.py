import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.getenv('SECRET_KEY', 'civix-secret-key-change-in-production')

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=365),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': {'code': 'UNAUTHORIZED', 'message': 'Token required', 'status': 401}}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid token', 'status': 401}}), 401
        
        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated
