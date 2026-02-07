import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import ReportModal from './components/ReportModal';
import NavigationPanel from './components/NavigationPanel';
import DirectionsPanel from './components/DirectionsPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);

  useEffect(() => {
    getUserLocation();
    loadReports();
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Default to Ahmedabad, Gujarat
          setUserLocation({
            latitude: 23.0225,
            longitude: 72.5714
          });
        }
      );
    } else {
      // Default to Ahmedabad, Gujarat
      setUserLocation({
        latitude: 23.0225,
        longitude: 72.5714
      });
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleReportSubmit = async (report) => {
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      if (response.ok) {
        await loadReports();
        setIsReportModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report');
    }
  };

  const handleGetDirections = async (from, to) => {
    setDestination(to);
    const routeData = await fetchRoute(from, to, reports);
    setRoute(routeData);
    setShowDirectionsPanel(false);
  };

  const fetchRoute = async (start, end, hazards) => {
    const coords = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&alternatives=true&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        // Check which routes intersect with waterlogged areas
        const routesWithHazards = data.routes.map((route, index) => {
          const hazardCount = checkRouteHazards(route.geometry, hazards);
          return {
            ...route,
            routeIndex: index,
            hazardCount,
            isSafe: hazardCount === 0
          };
        });

        // Sort by safety first, then by duration
        routesWithHazards.sort((a, b) => {
          if (a.isSafe !== b.isSafe) return a.isSafe ? -1 : 1;
          return a.duration - b.duration;
        });

        const bestRoute = routesWithHazards[0];
        return {
          geometry: bestRoute.geometry,
          duration: bestRoute.duration,
          distance: bestRoute.distance,
          steps: bestRoute.legs[0].steps,
          hazardCount: bestRoute.hazardCount,
          isSafe: bestRoute.isSafe,
          alternatives: routesWithHazards.slice(1, 3)
        };
      }
    } catch (error) {
      console.error('Route error:', error);
    }
    return null;
  };

  const checkRouteHazards = (routeGeometry, hazards) => {
    let count = 0;
    const routeCoords = routeGeometry.coordinates;
    
    hazards.forEach(hazard => {
      const hazardPoint = [hazard.longitude, hazard.latitude];
      const threshold = 0.002; // ~200 meters
      
      for (let coord of routeCoords) {
        const distance = Math.sqrt(
          Math.pow(coord[0] - hazardPoint[0], 2) + 
          Math.pow(coord[1] - hazardPoint[1], 2)
        );
        if (distance < threshold) {
          count++;
          break;
        }
      }
    });
    
    return count;
  };

  const clearNavigation = () => {
    setDestination(null);
    setRoute(null);
  };

  if (!userLocation) {
    return (
      <div style={styles.loading}>
        <h2>Loading...</h2>
        <p>Please allow location access</p>
      </div>
    );
  }

  return (
    <div className="App">
      {showDirectionsPanel && (
        <DirectionsPanel
          userLocation={userLocation}
          onGetDirections={handleGetDirections}
          onClose={() => setShowDirectionsPanel(false)}
        />
      )}

      <MapView
        userLocation={userLocation}
        reports={reports}
        onReportClick={() => setIsReportModalOpen(true)}
        onDirectionsClick={() => setShowDirectionsPanel(true)}
        destination={destination}
        route={route}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLocation={userLocation}
        onSubmit={handleReportSubmit}
      />

      <NavigationPanel
        destination={destination}
        route={route}
        onClear={clearNavigation}
      />

      <div style={styles.legend}>
        <h3>Waterlogging Levels</h3>
        <div><span style={{...styles.dot, background: '#00FF00'}}></span> Dry</div>
        <div><span style={{...styles.dot, background: '#FFFF00'}}></span> Low</div>
        <div><span style={{...styles.dot, background: '#FFA500'}}></span> Medium</div>
        <div><span style={{...styles.dot, background: '#FF0000'}}></span> High</div>
      </div>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '20px',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  dot: {
    display: 'inline-block',
    width: 20,
    height: 20,
    borderRadius: '50%',
    marginRight: 10,
    border: '2px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default App;
