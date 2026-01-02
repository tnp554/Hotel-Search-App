import { useHotel } from '../context/HotelContext';
import { POPULAR_CITIES } from '../services/hotelApi';
import { useState } from 'react';

const SearchFilters = ({ onSearch }) => {
  const { filters, updateFilters, clearFilters } = useHotel();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    updateFilters({ [e.target.name]: e.target.value });
  };

  const handleDestinationChange = (e) => {
    updateFilters({ destination: e.target.value });
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (city) => {
    updateFilters({ destination: city });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(filters);
  };

  const handleClear = () => {
    clearFilters();
    setShowSuggestions(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredSuggestions = POPULAR_CITIES.filter(city =>
    city.toLowerCase().includes(filters.destination.toLowerCase())
  );

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={filters.destination}
              onChange={handleDestinationChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., Mumbai, Goa, Paris, Dubai"
              autoComplete="off"
            />
            
            {showSuggestions && filters.destination && filteredSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginTop: '5px',
                maxHeight: '250px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {filteredSuggestions.slice(0, 15).map((city, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSuggestionClick(city)}
                    style={{
                      padding: '10px 15px',
                      cursor: 'pointer',
                      borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background 0.2s',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    📍 {city}
                  </div>
                ))}
              </div>
            )}
            
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Try: Mumbai, Delhi, Goa, Jaipur, Dubai, Paris, New York
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="checkIn">Check-in Date</label>
            <input
              type="date"
              id="checkIn"
              name="checkIn"
              value={filters.checkIn || today}
              onChange={handleChange}
              min={today}
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkOut">Check-out Date</label>
            <input
              type="date"
              id="checkOut"
              name="checkOut"
              value={filters.checkOut || tomorrow}
              onChange={handleChange}
              min={filters.checkIn || today}
            />
          </div>

          <div className="form-group">
            <label htmlFor="adults">Adults</label>
            <select
              id="adults"
              name="adults"
              value={filters.adults}
              onChange={handleChange}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="children">Children</label>
            <select
              id="children"
              name="children"
              value={filters.children}
              onChange={handleChange}
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rooms">Rooms</label>
            <select
              id="rooms"
              name="rooms"
              value={filters.rooms}
              onChange={handleChange}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="minPrice">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="1000"
              min="0"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            Clear Filters
          </button>
          <button type="submit" className="btn btn-primary">
            Search Hotels
          </button>
        </div>
        
        {!filters.destination && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              <strong>Quick Search:</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Dubai', 'Paris', 'New York'].map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    updateFilters({ destination: city });
                    setTimeout(() => onSearch({ ...filters, destination: city }), 100);
                  }}
                  style={{
                    padding: '8px 15px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = 'inherit';
                    e.target.style.borderColor = '#e0e0e0';
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilters;