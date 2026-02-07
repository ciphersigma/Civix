import React, { useState } from 'react';

function ReportModal({ isOpen, onClose, userLocation, onSubmit }) {
  const [severity, setSeverity] = useState('MEDIUM');
  const [depth, setDepth] = useState('KNEE');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      severity,
      depth,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Report Waterlogging</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Severity:</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)} style={styles.select}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div style={styles.field}>
            <label>Water Depth:</label>
            <select value={depth} onChange={e => setDepth(e.target.value)} style={styles.select}>
              <option value="ANKLE">Ankle Deep</option>
              <option value="KNEE">Knee Deep</option>
              <option value="TYRE">Tyre Deep</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>

          <div style={styles.buttons}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: 'white',
    padding: 30,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: 500
  },
  field: {
    marginBottom: 20
  },
  select: {
    width: '100%',
    padding: 10,
    marginTop: 5,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc'
  },
  buttons: {
    display: 'flex',
    gap: 10,
    marginTop: 20
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    background: '#ccc',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 1,
    padding: 12,
    background: '#FF4444',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }
};

export default ReportModal;
