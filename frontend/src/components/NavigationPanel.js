import React from 'react';

function NavigationPanel({ destination, route, onClear }) {
  if (!destination) return null;

  const formatDistance = (meters) => {
    return meters > 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
  };

  const getManeuverIcon = (type) => {
    const icons = {
      'turn': '↪️',
      'new name': '➡️',
      'depart': '🚗',
      'arrive': '🏁',
      'merge': '🔀',
      'on ramp': '⤴️',
      'off ramp': '⤵️',
      'fork': '🔱',
      'roundabout': '🔄',
      'rotary': '🔄',
      'continue': '⬆️'
    };
    return icons[type] || '➡️';
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>🧭 Navigation</h3>
        <button onClick={onClear} style={styles.closeBtn}>✕</button>
      </div>
      
      {route ? (
        <div style={styles.info}>
          <div style={styles.routeInfo}>
            <div style={styles.stat}>
              <span style={styles.label}>Distance:</span>
              <span style={styles.value}>{formatDistance(route.distance)}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.label}>Duration:</span>
              <span style={styles.value}>{formatDuration(route.duration)}</span>
            </div>
          </div>

          {route.hazardCount > 0 ? (
            <div style={styles.warningDanger}>
              ⚠️ Route passes near {route.hazardCount} waterlogged area{route.hazardCount > 1 ? 's' : ''}. Drive carefully!
            </div>
          ) : (
            <div style={styles.warningSafe}>
              ✅ Safe route - No waterlogged areas detected
            </div>
          )}

          {route.steps && route.steps.length > 0 && (
            <div style={styles.stepsContainer}>
              <h4 style={styles.stepsTitle}>Turn-by-Turn Directions</h4>
              <div style={styles.stepsList}>
                {route.steps.slice(0, 5).map((step, index) => (
                  <div key={index} style={styles.step}>
                    <span style={styles.stepIcon}>{getManeuverIcon(step.maneuver.type)}</span>
                    <div style={styles.stepText}>
                      <div style={styles.stepInstruction}>{step.maneuver.instruction}</div>
                      <div style={styles.stepDistance}>{formatDistance(step.distance)}</div>
                    </div>
                  </div>
                ))}
                {route.steps.length > 5 && (
                  <div style={styles.moreSteps}>+{route.steps.length - 5} more steps</div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.loading}>Calculating best route...</div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    position: 'absolute',
    top: 100,
    right: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '20px',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 320,
    maxWidth: 400,
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
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
  info: {
    fontSize: 14
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  label: {
    color: '#666'
  },
  value: {
    fontWeight: 'bold'
  },
  warning: {
    marginTop: 12,
    padding: 10,
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
    borderRadius: 8,
    fontSize: 13,
    color: '#856404',
    border: '1px solid #ffeaa7'
  },
  warningDanger: {
    marginTop: 12,
    padding: 10,
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    borderRadius: 8,
    fontSize: 13,
    color: '#721c24',
    border: '1px solid #f5c6cb',
    fontWeight: 500
  },
  warningSafe: {
    marginTop: 12,
    padding: 10,
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    borderRadius: 8,
    fontSize: 13,
    color: '#155724',
    border: '1px solid #c3e6cb',
    fontWeight: 500
  },
  routeInfo: {
    marginBottom: 8
  },
  stepsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid rgba(0,0,0,0.1)'
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: '#202124'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: 8,
    background: 'rgba(0,0,0,0.02)',
    borderRadius: 6
  },
  stepIcon: {
    fontSize: 18,
    flexShrink: 0
  },
  stepText: {
    flex: 1,
    minWidth: 0
  },
  stepInstruction: {
    fontSize: 13,
    color: '#202124',
    marginBottom: 2
  },
  stepDistance: {
    fontSize: 11,
    color: '#70757a'
  },
  moreSteps: {
    fontSize: 12,
    color: '#70757a',
    textAlign: 'center',
    padding: 8,
    fontStyle: 'italic'
  },
  loading: {
    fontSize: 14,
    color: '#666'
  }
};

export default NavigationPanel;
