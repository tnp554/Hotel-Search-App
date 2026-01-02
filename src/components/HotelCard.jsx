import { useHotel } from '../context/HotelContext';

const HotelCard = ({ hotel }) => {
  const { isHotelSelected, toggleHotelSelection } = useHotel();
  const selected = isHotelSelected(hotel.code);

  const price = hotel.minRate || '0';
  
  let rating = 0;
  if (hotel.rating) {
    rating = parseInt(hotel.rating);
  } else if (hotel.categoryName) {
    const match = hotel.categoryName.match(/(\d+)/);
    if (match) {
      rating = parseInt(match[1]);
    }
  }
  
  const boardName = hotel.rooms?.[0]?.rates?.[0]?.boardName || 'Room Only';
  const hotelName = hotel.name || 'Hotel';
  const address = hotel.address || '';
  const city = hotel.city || '';
  const currency = hotel.currency || 'USD';

  const handleCheckboxChange = () => {
    toggleHotelSelection(hotel);
  };

  const getStarDisplay = () => {
    if (rating >= 1 && rating <= 5) {
      return '★'.repeat(rating);
    }
    return null;
  };

  const starDisplay = getStarDisplay();

  return (
    <div className={`hotel-card ${selected ? 'selected' : ''}`}>
      
      <div className="hotel-card-content">
        <div className="hotel-card-header">
          <h3 className="hotel-name">{hotelName}</h3>
          {starDisplay && (
            <div className="hotel-rating">
              {starDisplay}
            </div>
          )}
        </div>

        <div className="hotel-address">
          📍 {address ? `${address}, ` : ''}{city}
        </div>

        <div className="hotel-details">
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            <strong>Board:</strong> {boardName}
          </p>
          {hotel.amenities && hotel.amenities.length > 0 && (
            <p style={{ fontSize: '12px', color: '#999' }}>
              {hotel.amenities.slice(0, 3).join(', ')}
            </p>
          )}
          {rating > 0 && (
            <p style={{ fontSize: '13px', color: '#667eea', fontWeight: '600', marginTop: '5px' }}>
              {rating} Star Hotel
            </p>
          )}
        </div>

        <div className="hotel-price">
          {currency === 'USD' ? '$' : currency + ' '}
          {parseFloat(price).toFixed(2)}
          <span className="hotel-price-label"> / stay</span>
        </div>

        <div className="hotel-card-actions">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id={`hotel-${hotel.code}`}
              checked={selected}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`hotel-${hotel.code}`}>
              {selected ? 'Selected for comparison' : 'Select to compare'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;