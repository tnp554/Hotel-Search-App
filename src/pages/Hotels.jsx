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
    setHasSearched(false);
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    setCurrentPage(1);

    try {
      console.log('Starting search with filters:', filters);
      const response = await searchHotels(filters);
      const hotelsList = response?.hotels?.hotels || [];
      
      console.log(`Search successful: ${hotelsList.length} hotels found`);
      
      setHotels(hotelsList);
      setDisplayedHotels(hotelsList.slice(0, hotelsPerPage));
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to fetch hotels. Please try again.');
      setHotels([]);
      setDisplayedHotels([]);
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
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for hotels...</p>
          </div>
        ) : !hasSearched ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>Start Your Search</h3>
            <p>Enter a destination above to find hotels</p>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <strong>Popular destinations:</strong> Mumbai, Delhi, Bangalore, Goa, Jaipur, Dubai, Paris, New York
            </div>
          </div>
        ) : displayedHotels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No hotels found</h3>
            <p>Try adjusting your search filters or try a different destination</p>
          </div>
        ) : (
          <>
            {displayedHotels.length > 0 && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '10px 15px',
                background: '#e6f7ff',
                borderRadius: '8px',
                border: '1px solid #91d5ff'
              }}>
                <strong>Live API Data:</strong> Showing {displayedHotels.length} of {hotels.length} hotels
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
                  Load More Hotels ({hotels.length - displayedHotels.length} remaining)
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