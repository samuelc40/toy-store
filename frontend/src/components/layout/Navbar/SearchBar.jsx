import React from 'react';
import { Search } from 'lucide-react';

function SearchBar({ value, onChange, onKeyDown }) {
  return (
    <div className="search-container">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        placeholder="Find your fun..."
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;
