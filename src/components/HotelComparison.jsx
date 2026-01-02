import { useHotel } from '../context/HotelContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

const HotelComparison = () => {
  const { selectedHotels, removeHotelFromSelection, clearSelection } = useHotel();

  if (selectedHotels.length === 0) {
    return null;
  }

  const getHotelName = (hotel) => hotel.name || 'Hotel';
  const getPrice = (hotel) => parseFloat(hotel.minRate || 0);
  const getRating = (hotel) => hotel.rating || 0;
  const getCity = (hotel) => hotel.city || 'Unknown';
  const getBoardName = (hotel) => hotel.rooms?.[0]?.rates?.[0]?.boardName || 'Room Only';

  const priceData = selectedHotels.map(hotel => {
    const name = getHotelName(hotel);
    return {
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      price: getPrice(hotel),
      fullName: name
    };
  });

  const ratingData = selectedHotels.reduce((acc, hotel) => {
    const rating = Math.round(getRating(hotel));
    const ratingLabel = `${rating} Stars`;
    
    const existing = acc.find(item => item.name === ratingLabel);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: ratingLabel, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h2>Hotel Comparison ({selectedHotels.length})</h2>
        <button className="btn btn-danger" onClick={clearSelection}>
          Clear All
        </button>
      </div>

      <div className="comparison-grid">
        {selectedHotels.map(hotel => {
          const hotelName = getHotelName(hotel);
          const price = getPrice(hotel);
          const rating = getRating(hotel);
          const city = getCity(hotel);
          const boardName = getBoardName(hotel);

          return (
            <div key={hotel.code} className="comparison-card">
              <button
                className="comparison-card-remove"
                onClick={() => removeHotelFromSelection(hotel.code)}
                title="Remove from comparison"
              >
                ×
              </button>

              <h3>{hotelName}</h3>

              <div className="comparison-detail">
                <span className="comparison-detail-label">Location</span>
                <span className="comparison-detail-value">{city}</span>
              </div>

              <div className="comparison-detail">
                <span className="comparison-detail-label">Rating</span>
                <span className="comparison-detail-value">
                  {'★'.repeat(Math.round(rating))} ({rating})
                </span>
              </div>

              <div className="comparison-detail">
                <span className="comparison-detail-label">Price/stay</span>
                <span className="comparison-detail-value">
                  {price.toFixed(2)}
                </span>
              </div>

              <div className="comparison-detail">
                <span className="comparison-detail-label">Board Type</span>
                <span className="comparison-detail-value">{boardName}</span>
              </div>

              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="comparison-detail">
                  <span className="comparison-detail-label">Amenities</span>
                  <span className="comparison-detail-value">
                    {hotel.amenities.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedHotels.length >= 2 && (
        <>
          <div className="chart-container">
            <h3 className="chart-title">Price Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          background: 'white',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}>
                          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                          <p style={{ margin: '5px 0 0 0', color: '#667eea' }}>
                            Price: ${payload[0].value.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="price" fill="#667eea" name="Price per Stay" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default HotelComparison;