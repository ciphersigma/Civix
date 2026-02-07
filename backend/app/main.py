from flask import Flask, jsonify
from flask_cors import CORS
import os

from app.routes.reports import reports_bp
from app.routes.users import users_bp
from app.routes.navigation import routes_bp
from app.routes.upload import upload_bp
from app.routes.stats import stats_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(reports_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(routes_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(stats_bp, url_prefix='/api')

# Ensure upload directory exists
os.makedirs('uploads', exist_ok=True)

@app.route('/')
def root():
    return jsonify({
        'message': 'Civix API v1.0',
        'status': 'running',
        'endpoints': {
            'reports': '/api/reports',
            'users': '/api/users',
            'routes': '/api/routes',
            'alerts': '/api/alerts/check',
            'upload': '/api/upload',
            'search': '/api/search',
            'stats': '/api/stats'
        }
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': {
            'code': 'NOT_FOUND',
            'message': 'Endpoint not found',
            'status': 404
        }
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'error': {
            'code': 'SERVER_ERROR',
            'message': 'Internal server error',
            'status': 500
        }
    }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
