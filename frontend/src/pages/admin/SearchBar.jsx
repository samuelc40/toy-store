import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ value, onSearchChange, placeholder = "Search..." }) {
  const [localVal, setLocalVal] = useState(value);
  const timerRef = useRef(null);

  // Update local value if prop changes (e.g. cleared from parent)
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalVal(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 450); // debounce 450ms
  };

  const handleClear = () => {
    setLocalVal('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onSearchChange('');
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
      <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={localVal || ''}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '12px 40px 12px 48px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          boxShadow: 'var(--shadow)',
          transition: 'all 0.2s',
          boxSizing: 'border-box'
        }}
      />
      {localVal && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
