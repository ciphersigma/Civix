import React, { useState } from 'react';
import SearchInput from './SearchInput';

function DirectionsPanel({ userLocation, onGetDirections, onClose }) {
  const [fromLocation, setFromLocation] = useState(userLocation);
  const [toLocation, setToLocation] = useState(null);

  const handleGetDirections = () => {
    if (fromLocation && toLocation) {
      onGetDirections(fromLocation, toLocation);
    }
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>🗺️ Get Directions</h3>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.inputsContainer}>
        <div style={styles.inputWrapper}>
          <span style={styles.marker}>🔵</span>
          <SearchInput
            placeholder="Your location"
            initialValue={userLocation ? "Current Location" : ""}
            onSelect={setFromLocation}
          />
        </div>

        <button onClick={swapLocations} style={styles.swapBtn}>⇅</button>

        <div style={styles.inputWrapper}>
          <span style={styles.marker}>🔴</span>
          <SearchInput
            placeholder="Choose destination"
            onSelect={setToLocation}
          />
        </div>
      </div>

      <button 
        onClick={handleGetDirections} 
        disabled={!fromLocation || !toLocation}
        style={{
          ...styles.directionsBtn,
          opacity: (!fromLocation || !toLocation) ? 0.5 : 1,
          cursor: (!fromLocation || !toLocation) ? 'not-allowed' : 'pointer'
        }}
      >
        Get Directions
      </button>
    </div>
  );
}

const styles = {
  panel: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(255, 255, 255, 0.98)',
    padding: '20px',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 1000,
    width: 380,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#202124'
  },
  closeBtn: {
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'background 0.2s',
    color: '#666'
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'white',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.1)'
  },
  marker: {
    fontSize: 16,
    flexShrink: 0
  },
  swapBtn: {
    alignSelf: 'center',
    background: 'white',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  directionsBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }
};

export default DirectionsPanel;
