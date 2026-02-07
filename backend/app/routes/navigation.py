from flask import Blueprint, request, jsonify
import requests
import os
from app.utils.helpers import calculate_distance, get_direction, load_json_file, is_expired

routes_bp = Blueprint('routes', __name__)

MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN', 'pk.eyJ1IjoiYWxwaGFpbnN0aW54IiwiYSI6ImNta3A2N3M2dDBldjEzZXFyeTJzeGRhdzMifQ.C7b81YKX5_cWuVFJNOMkoA')
REPORTS_FILE = 'reports.json'

@routes_bp.route('/routes', methods=['POST'])
def get_route():
    data = request.json
    origin = data.get('origin')
    destination = data.get('destination')
    mode = data.get('mode', 'driving')
    
    if not origin or not destination:
        return jsonify({'error': {'code': 'INVALID_REQUEST', 'message': 'Origin and destination required', 'status': 400}}), 400
    
    coords = f"{origin['longitude']},{origin['latitude']};{destination['longitude']},{destination['latitude']}"
    url = f"https://api.mapbox.com/directions/v5/mapbox/{mode}/{coords}"
    params = {
        'geometries': 'geojson',
        'steps': 'true',
        'alternatives': 'true',
        'access_token': MAPBOX_TOKEN
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if 'routes' not in data or len(data['routes']) == 0:
            return jsonify({'error': {'code': 'NO_ROUTE', 'message': 'No route found', 'status': 404}}), 404
        
        reports = load_json_file(REPORTS_FILE)
        active_reports = [r for r in reports if not is_expired(r['expiresAt'])]
        
        routes = []
        for idx, route in enumerate(data['routes'][:3]):
            hazard_count = count_hazards_on_route(route['geometry'], active_reports)
            routes.append({
                'routeIndex': idx,
                'distance': route['distance'],
                'duration': route['duration'],
                'hazardCount': hazard_count,
                'isSafe': hazard_count == 0,
                'geometry': route['geometry'],
                'steps': route['legs'][0]['steps'][:10] if 'legs' in route else []
            })
        
        routes.sort(key=lambda x: (x['hazardCount'], x['duration']))
        
        return jsonify({'routes': routes})
    
    except Exception as e:
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(e), 'status': 500}}), 500

@routes_bp.route('/alerts/check', methods=['POST'])
def check_alerts():
    data = request.json
    lat = data.get('latitude')
    lng = data.get('longitude')
    radius = data.get('radius', 500)
    
    if not lat or not lng:
        return jsonify({'error': {'code': 'INVALID_REQUEST', 'message': 'Latitude and longitude required', 'status': 400}}), 400
    
    reports = load_json_file(REPORTS_FILE)
    active_reports = [r for r in reports if not is_expired(r['expiresAt'])]
    
    nearby_hazards = []
    for report in active_reports:
        distance = calculate_distance(lat, lng, report['latitude'], report['longitude'])
        if distance <= radius:
            direction = get_direction(lat, lng, report['latitude'], report['longitude'])
            nearby_hazards.append({
                'id': report['id'],
                'latitude': report['latitude'],
                'longitude': report['longitude'],
                'severity': report['severity'],
                'distance': int(distance),
                'direction': direction
            })
    
    nearby_hazards.sort(key=lambda x: x['distance'])
    
    alert_message = None
    if nearby_hazards:
        closest = nearby_hazards[0]
        alert_message = f"⚠️ {closest['severity'].capitalize()} severity waterlogging {closest['distance']}m {closest['direction']}!"
    
    return jsonify({
        'hasHazards': len(nearby_hazards) > 0,
        'hazards': nearby_hazards,
        'alertMessage': alert_message
    })

def count_hazards_on_route(geometry, reports):
    count = 0
    coords = geometry['coordinates']
    threshold = 0.002
    
    for report in reports:
        hazard_point = [report['longitude'], report['latitude']]
        for coord in coords:
            distance = ((coord[0] - hazard_point[0])**2 + (coord[1] - hazard_point[1])**2)**0.5
            if distance < threshold:
                count += 1
                break
    
    return count
