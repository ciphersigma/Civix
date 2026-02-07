import React, { useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function MapView({ userLocation, reports, onReportClick, onDirectionsClick, destination, route }) {
  const [clickMode, setClickMode] = useState(false);
  const getSeverityColor = (severity) => {
    const colors = { NONE: '#00FF00', LOW: '#FFFF00', MEDIUM: '#FFA500', HIGH: '#FF0000' };
    return colors[severity] || '#FFFF00';
  };

  const reportsGeoJSON = {
    type: 'FeatureCollection',
    features: reports.map(report => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.longitude, report.latitude]
      },
      properties: {
        severity: report.severity,
        color: getSeverityColor(report.severity)
      }
    }))
  };

  const handleMapClick = (e) => {
    // Map click disabled - use directions panel instead
  };

  const routeGeoJSON = route ? {
    type: 'Feature',
    geometry: route.geometry
  } : null;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        initialViewState={{
          latitude: 23.0225,
          longitude: 72.5714,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
        style={{ cursor: clickMode ? 'crosshair' : 'default' }}
      >
        <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
          <div style={styles.userMarker}>📍</div>
        </Marker>

        <Source id="reports" type="geojson" data={reportsGeoJSON}>
          <Layer
            id="reports-circle"
            type="circle"
            paint={{
              'circle-radius': {
                stops: [
                  [10, 5],
                  [12, 15],
                  [14, 40],
                  [16, 80],
                  [18, 150]
                ]
              },
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.4,
              'circle-stroke-width': 2,
              'circle-stroke-color': ['get', 'color'],
              'circle-stroke-opacity': 0.8
            }}
          />
        </Source>

        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
              }}
            />
          </Source>
        )}

        {destination && (
          <Marker latitude={destination.latitude} longitude={destination.longitude}>
            <div style={styles.destinationMarker}>🎯</div>
          </Marker>
        )}
      </Map>

      <button onClick={onReportClick} style={styles.reportButton}>
        💧 Report Waterlogging
      </button>

      <button onClick={onDirectionsClick} style={styles.directionsButton}>
        🧭 Directions
      </button>
    </div>
  );
}

const styles = {
  userMarker: {
    fontSize: 30,
    cursor: 'pointer'
  },
  destinationMarker: {
    fontSize: 30,
    cursor: 'pointer'
  },
  reportButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '16px 40px',
    fontSize: 16,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 30,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(255, 68, 68, 0.4)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  directionsButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 30,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  }
};

export default MapView;
