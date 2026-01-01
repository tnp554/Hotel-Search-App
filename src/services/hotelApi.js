import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;
const BASE_URL = 'https://test.api.amadeus.com';

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached access token');
    return accessToken;
  }

  try {
    console.log('Requesting new access token...');
    
    const response = await axios.post(
      `${BASE_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    
    console.log('Access token obtained');
    return accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

const amadeusApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

amadeusApi.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const CITY_CODES = {
  'new york': 'NYC',
  'nyc': 'NYC',
  'miami': 'MIA',
  'los angeles': 'LAX',
  'la': 'LAX',
  'chicago': 'CHI',
  'denver': 'DEN',
  'boston': 'BOS',
  'san francisco': 'SFO',
  'sf': 'SFO',
  'las vegas': 'LAS',
  'vegas': 'LAS',
  'orlando': 'MCO',
  'seattle': 'SEA',
  'washington': 'WAS',
  'dc': 'WAS',
  'atlanta': 'ATL',
  'paris': 'PAR',
  'london': 'LON',
  'barcelona': 'BCN',
  'madrid': 'MAD',
  'rome': 'ROM',
  'dubai': 'DXB',
  'tokyo': 'TYO',
  'singapore': 'SIN',
  'bangkok': 'BKK',
  'amsterdam': 'AMS',
  'berlin': 'BER',
  'prague': 'PRG',
  'vienna': 'VIE',
  'lisbon': 'LIS',
  'milan': 'MIL',
  'venice': 'VCE',
  'florence': 'FLR',
  'istanbul': 'IST',
  'athens': 'ATH',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'hong kong': 'HKG',
  'mumbai': 'BOM',
  'delhi': 'DEL',
  'toronto': 'YTO',
  'vancouver': 'YVR',
  'montreal': 'YMQ',
};

const getCityCode = (destination) => {
  if (!destination) return 'NYC';
  const normalized = destination.toLowerCase().trim();
  return CITY_CODES[normalized] || 'NYC';
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDates = () => {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(checkIn.getDate() + 1);
  
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  
  return {
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut)
  };
};

export const searchHotels = async (filters) => {
  try {
    const defaultDates = getDefaultDates();
    
    const checkInDate = filters.checkIn || defaultDates.checkIn;
    const checkOutDate = filters.checkOut || defaultDates.checkOut;
    const adults = parseInt(filters.adults) || 2;
    const cityCode = getCityCode(filters.destination);

    console.log('Searching hotels with parameters:', {
      cityCode,
      checkInDate,
      checkOutDate,
      adults
    });

    const hotelListResponse = await amadeusApi.get('/v1/reference-data/locations/hotels/by-city', {
      params: {
        cityCode: cityCode,
        radius: 50,
        radiusUnit: 'KM',
        hotelSource: 'ALL'
      }
    });

    const hotelIds = hotelListResponse.data.data
      .slice(0, 50)
      .map(hotel => hotel.hotelId);

    if (hotelIds.length === 0) {
      console.warn('No hotels found for city:', cityCode);
      return { hotels: { hotels: [] } };
    }

    console.log(`Found ${hotelIds.length} hotels in ${cityCode}`);

    const offersResponse = await amadeusApi.get('/v3/shopping/hotel-offers', {
      params: {
        hotelIds: hotelIds.join(','),
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults,
        roomQuantity: parseInt(filters.rooms) || 1,
        currency: 'USD',
        bestRateOnly: true
      }
    });

    let hotels = offersResponse.data.data || [];

    console.log(`Received ${hotels.length} hotel offers`);

    hotels = hotels.map(hotelData => {
      const hotel = hotelData.hotel;
      const offer = hotelData.offers?.[0];
      
      return {
        code: hotel.hotelId,
        name: hotel.name,
        cityCode: hotel.cityCode,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        
        categoryName: hotel.rating ? `${hotel.rating} Stars` : '3 Stars',
        rating: hotel.rating || 3,
        
        address: hotel.address?.lines?.[0] || '',
        city: hotel.address?.cityName || cityCode,
        
        minRate: offer?.price?.total || '0',
        currency: offer?.price?.currency || 'USD',
        
        rooms: offer ? [{
          code: offer.room?.type || 'STANDARD',
          name: offer.room?.typeEstimated?.category || 'Standard Room',
          rates: [{
            net: offer.price?.total || '0',
            boardCode: offer.boardType || 'ROOM_ONLY',
            boardName: getBoardName(offer.boardType),
          }]
        }] : [],
        
        amenities: hotel.amenities || [],
        
        description: offer?.room?.description?.text || hotel.description || ''
      };
    });

    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      hotels = hotels.filter(hotel => {
        const stars = hotel.rating || 0;
        return stars >= minRating;
      });
      console.log(`Rating filter (${minRating}+): ${hotels.length} hotels`);
    }

    if (filters.minPrice || filters.maxPrice) {
      const minPrice = parseFloat(filters.minPrice) || 0;
      const maxPrice = parseFloat(filters.maxPrice) || 999999;
      
      hotels = hotels.filter(hotel => {
        const price = parseFloat(hotel.minRate);
        return price >= minPrice && price <= maxPrice;
      });
      console.log(`Price filter ($${minPrice}-$${maxPrice}): ${hotels.length} hotels`);
    }

    return {
      hotels: {
        hotels: hotels,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        total: hotels.length
      }
    };

  } catch (error) {
    console.error('Amadeus API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response) {
      const errorMsg = error.response.data?.errors?.[0]?.detail || 
                      error.response.data?.error_description ||
                      `API Error: ${error.response.status}`;
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error('No response from Amadeus API. Please check your connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export const getHotelDetails = async (hotelId, checkIn, checkOut) => {
  try {
    const defaultDates = getDefaultDates();
    
    const response = await amadeusApi.get('/v3/shopping/hotel-offers', {
      params: {
        hotelIds: hotelId,
        checkInDate: checkIn || defaultDates.checkIn,
        checkOutDate: checkOut || defaultDates.checkOut,
        adults: 2,
        currency: 'USD'
      }
    });

    const hotelData = response.data.data?.[0];
    return hotelData || null;

  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};

const getBoardName = (boardType) => {
  const boardNames = {
    'ROOM_ONLY': 'Room Only',
    'BREAKFAST': 'Bed and Breakfast',
    'HALF_BOARD': 'Half Board',
    'FULL_BOARD': 'Full Board',
    'ALL_INCLUSIVE': 'All Inclusive'
  };
  return boardNames[boardType] || 'Room Only';
};

export const AVAILABLE_DESTINATIONS = Object.entries(CITY_CODES).map(([name, code]) => ({
  name: name,
  code: code
}));