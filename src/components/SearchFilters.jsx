import { useHotel } from '../context/HotelContext';

const SearchFilters = ({ onSearch }) => {
  const { filters, updateFilters, clearFilters } = useHotel();

  const handleChange = (e) => {
    updateFilters({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    clearFilters();
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={filters.destination}
              onChange={handleChange}
              placeholder="NYC, Miami, London, Paris..."
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Try: New York, Miami, Los Angeles, Chicago, London, Paris, Barcelona, Dubai
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
        </div>

        <div className="filter-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            Clear Filters
          </button>
          <button type="submit" className="btn btn-primary">
            Search Hotels
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;