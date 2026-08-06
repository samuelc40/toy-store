import React from 'react';
import { Search, X, Loader } from 'lucide-react';
import useSearch from '../hooks/useSearch';

/**
 * Custom debounced SearchBar with loading indicator and clear buttons.
 */
export function SearchBar({ value, onChange, loading = false }) {
    const [localQuery, setLocalQuery] = useSearch(value, 300, onChange);

    const handleClear = () => {
        setLocalQuery('');
        onChange('');
    };

    return (
        <div className="catalog-search-bar">
            <Search className="search-icon-lbl" size={15} />
            <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search luxury toys, collectible brands..."
                className="search-input-element"
            />
            {loading && (
                <Loader className="search-loading-icon spinner-icon-anim" size={13} />
            )}
            {!loading && localQuery && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="btn-clear-search-query"
                    title="Clear Search"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );
}

export default SearchBar;
