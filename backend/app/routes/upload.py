from flask import Blueprint, request, jsonify, send_from_directory
import base64
import os
from datetime import datetime
from PIL import Image
import io
import requests

upload_bp = Blueprint('upload', __name__)

UPLOAD_FOLDER = 'uploads'
MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN', 'pk.eyJ1IjoiYWxwaGFpbnN0aW54IiwiYSI6ImNta3A2N3M2dDBldjEzZXFyeTJzeGRhdzMifQ.C7b81YKX5_cWuVFJNOMkoA')

@upload_bp.route('/upload', methods=['POST'])
def upload_photo():
    if 'photo' in request.files:
        file = request.files['photo']
        photo_id = f"photo_{int(datetime.now().timestamp() * 1000)}"
        filename = f"{photo_id}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        img = Image.open(file)
        img.thumbnail((1200, 1200))
        img.save(filepath, 'JPEG', quality=85)
        
        file_size = os.path.getsize(filepath)
        
        return jsonify({
            'photoUrl': f"/uploads/{filename}",
            'photoId': photo_id,
            'size': file_size,
            'uploadedAt': datetime.now().isoformat()
        })
    
    elif 'photo' in request.json:
        try:
            photo_data = request.json['photo']
            if ',' in photo_data:
                photo_data = photo_data.split(',')[1]
            
            photo_id = f"photo_{int(datetime.now().timestamp() * 1000)}"
            filename = f"{photo_id}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            img_data = base64.b64decode(photo_data)
            img = Image.open(io.BytesIO(img_data))
            img.thumbnail((1200, 1200))
            img.save(filepath, 'JPEG', quality=85)
            
            file_size = os.path.getsize(filepath)
            
            return jsonify({
                'photoUrl': f"/uploads/{filename}",
                'photoId': photo_id,
                'size': file_size,
                'uploadedAt': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({'error': {'code': 'UPLOAD_FAILED', 'message': str(e), 'status': 400}}), 400
    
    return jsonify({'error': {'code': 'NO_FILE', 'message': 'No photo provided', 'status': 400}}), 400

@upload_bp.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@upload_bp.route('/search', methods=['GET'])
def search_places():
    query = request.args.get('q', '')
    lat = request.args.get('lat', 23.0225)
    lng = request.args.get('lng', 72.5714)
    
    if not query:
        return jsonify({'results': []})
    
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json"
    params = {
        'access_token': MAPBOX_TOKEN,
        'limit': 5,
        'country': 'IN',
        'proximity': f"{lng},{lat}",
        'types': 'place,locality,neighborhood,address,poi'
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        results = []
        for feature in data.get('features', []):
            results.append({
                'name': feature['text'],
                'address': feature['place_name'],
                'latitude': feature['center'][1],
                'longitude': feature['center'][0],
                'type': feature['place_type'][0] if feature.get('place_type') else 'place'
            })
        
        return jsonify({'results': results})
    
    except Exception as e:
        return jsonify({'error': {'code': 'SEARCH_FAILED', 'message': str(e), 'status': 500}}), 500
