import { createContext, useContext, useEffect, useState } from 'react';

const HotelContext = createContext({});

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within HotelProvider');
  }
  return context;
};

export const HotelProvider = ({ children }) => {
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [filters, setFilters] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    rooms: '1',
    rating: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('selectedHotels');
    if (stored) {
      try {
        setSelectedHotels(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading selected hotels:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedHotels', JSON.stringify(selectedHotels));
  }, [selectedHotels]);

  const toggleHotelSelection = (hotel) => {
    setSelectedHotels(prev => {
      const isSelected = prev.some(h => h.code === hotel.code);
      if (isSelected) {
        return prev.filter(h => h.code !== hotel.code);
      } else {
        return [...prev, hotel];
      }
    });
  };

  const removeHotelFromSelection = (hotelCode) => {
    setSelectedHotels(prev => prev.filter(h => h.code !== hotelCode));
  };

  const clearSelection = () => {
    setSelectedHotels([]);
  };

  const isHotelSelected = (hotelCode) => {
    return selectedHotels.some(h => h.code === hotelCode);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      checkIn: '',
      checkOut: '',
      adults: '2',
      children: '0',
      rooms: '1',
      rating: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const value = {
    selectedHotels,
    filters,
    toggleHotelSelection,
    removeHotelFromSelection,
    clearSelection,
    isHotelSelected,
    updateFilters,
    clearFilters,
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};