import { useState, useEffect } from 'react';
import { searchHotels } from '../services/hotelApi';
import SearchFilters from '../components/SearchFilters';
import HotelCard from '../components/HotelCard';
import HotelComparison from '../components/HotelComparison';
import { useHotel } from '../context/HotelContext';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [displayedHotels, setDisplayedHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 6;

  const { selectedHotels } = useHotel();

  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const response = await searchHotels(filters);
      const hotelsList = response?.hotels?.hotels || [];
      setHotels(hotelsList);
      setDisplayedHotels(hotelsList.slice(0, hotelsPerPage));
    } catch (err) {
      setError('Failed to fetch hotels. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * hotelsPerPage;
    setDisplayedHotels(hotels.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const hasMore = displayedHotels.length < hotels.length;

  return (
    <div>
      <div className="container">
        <SearchFilters onSearch={handleSearch} />

        {selectedHotels.length > 0 && <HotelComparison />}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for hotels...</p>
          </div>
        ) : hasSearched && displayedHotels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No hotels found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            {displayedHotels.length > 0 && (
              <div style={{ marginBottom: '20px', color: '#666' }}>
                Showing {displayedHotels.length} of {hotels.length} hotels
              </div>
            )}
            
            <div className="hotels-grid">
              {displayedHotels.map(hotel => (
                <HotelCard key={hotel.code} hotel={hotel} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="btn btn-primary" 
                  onClick={handleLoadMore}
                >
                  Load More Hotels
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Hotels;