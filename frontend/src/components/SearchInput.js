import React, { useState, useRef, useEffect } from 'react';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function SearchInput({ placeholder, initialValue, onSelect }) {
  const [query, setQuery] = useState(initialValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (query.length > 2 && query !== initialValue) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => searchLocation(query), 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const searchLocation = async (searchQuery) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=IN&proximity=72.5714,23.0225&types=place,locality,neighborhood,address,poi`;
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelect = (feature) => {
    const [longitude, latitude] = feature.center;
    setQuery(feature.place_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect({ latitude, longitude, name: feature.place_name });
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        style={styles.input}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <>
          <div style={styles.overlay} onClick={() => setShowSuggestions(false)} />
          <div style={styles.suggestions}>
            {suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                style={styles.suggestionItem}
              >
                <span style={styles.icon}>📍</span>
                <div style={styles.textContainer}>
                  <div style={styles.placeName}>{item.text}</div>
                  <div style={styles.placeAddress}>{item.place_name}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    flex: 1
  },
  input: {
    width: '100%',
    padding: '8px 0',
    fontSize: 14,
    border: 'none',
    outline: 'none',
    background: 'transparent'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  },
  suggestions: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: -12,
    right: -12,
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxHeight: 250,
    overflowY: 'auto',
    zIndex: 1000,
    border: '1px solid rgba(0,0,0,0.1)'
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
    flexShrink: 0
  },
  textContainer: {
    flex: 1,
    minWidth: 0
  },
  placeName: {
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 2,
    color: '#202124',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  placeAddress: {
    fontSize: 11,
    color: '#70757a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default SearchInput;
