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
  // US Cities
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
  'philadelphia': 'PHL',
  'phoenix': 'PHX',
  'san diego': 'SAN',
  'dallas': 'DFW',
  'houston': 'HOU',
  'detroit': 'DTT',
  'minneapolis': 'MSP',
  'tampa': 'TPA',
  'portland': 'PDX',
  'austin': 'AUS',
  'nashville': 'BNA',
  'new orleans': 'MSY',
  'salt lake city': 'SLC',
  
  // European Cities
  'paris': 'PAR',
  'london': 'LON',
  'barcelona': 'BCN',
  'madrid': 'MAD',
  'rome': 'ROM',
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
  'dublin': 'DUB',
  'edinburgh': 'EDI',
  'brussels': 'BRU',
  'copenhagen': 'CPH',
  'stockholm': 'STO',
  'oslo': 'OSL',
  'helsinki': 'HEL',
  'zurich': 'ZRH',
  'geneva': 'GVA',
  'munich': 'MUC',
  'frankfurt': 'FRA',
  'hamburg': 'HAM',
  'warsaw': 'WAW',
  'budapest': 'BUD',
  'krakow': 'KRK',
  
  // Middle East & Africa
  'dubai': 'DXB',
  'abu dhabi': 'AUH',
  'doha': 'DOH',
  'riyadh': 'RUH',
  'jeddah': 'JED',
  'tel aviv': 'TLV',
  'cairo': 'CAI',
  'casablanca': 'CAS',
  'marrakech': 'RAK',
  'cape town': 'CPT',
  'johannesburg': 'JNB',
  
  // Asia Pacific
  'tokyo': 'TYO',
  'singapore': 'SIN',
  'bangkok': 'BKK',
  'hong kong': 'HKG',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'beijing': 'BJS',
  'shanghai': 'SHA',
  'seoul': 'SEL',
  'osaka': 'OSA',
  'kuala lumpur': 'KUL',
  'manila': 'MNL',
  'jakarta': 'JKT',
  'hanoi': 'HAN',
  'ho chi minh': 'SGN',
  'phuket': 'HKT',
  'bali': 'DPS',
  'taipei': 'TPE',
  'macau': 'MFM',
  
  // INDIAN CITIES
  'mumbai': 'BOM',
  'delhi': 'DEL',
  'new delhi': 'DEL',
  'bangalore': 'BLR',
  'bengaluru': 'BLR',
  'kolkata': 'CCU',
  'calcutta': 'CCU',
  'chennai': 'MAA',
  'madras': 'MAA',
  'hyderabad': 'HYD',
  'ahmedabad': 'AMD',
  'pune': 'PNQ',
  'jaipur': 'JAI',
  'lucknow': 'LKO',
  'chandigarh': 'IXC',
  'kochi': 'COK',
  'cochin': 'COK',
  'indore': 'IDR',
  'nagpur': 'NAG',
  'visakhapatnam': 'VTZ',
  'vizag': 'VTZ',
  'bhopal': 'BHO',
  'patna': 'PAT',
  'vadodara': 'BDQ',
  'baroda': 'BDQ',
  'ludhiana': 'LUH',
  'agra': 'AGR',
  'nashik': 'ISK',
  'rajkot': 'RAJ',
  'varanasi': 'VNS',
  'banaras': 'VNS',
  'srinagar': 'SXR',
  'aurangabad': 'IXU',
  'amritsar': 'ATQ',
  'allahabad': 'IXD',
  'prayagraj': 'IXD',
  'ranchi': 'IXR',
  'guwahati': 'GAU',
  'coimbatore': 'CJB',
  'jabalpur': 'JLR',
  'gwalior': 'GWL',
  'vijayawada': 'VGA',
  'jodhpur': 'JDH',
  'madurai': 'IXM',
  'raipur': 'RPR',
  'kota': 'KTU',
  'bhubaneswar': 'BBI',
  'hubli': 'HBX',
  'dharwad': 'HBX',
  'tirupati': 'TIR',
  'mysore': 'MYQ',
  'mysuru': 'MYQ',
  'gurgaon': 'DEL',
  'gurugram': 'DEL',
  'noida': 'DEL',
  'thiruvananthapuram': 'TRV',
  'trivandrum': 'TRV',
  'goa': 'GOI',
  'panaji': 'GOI',
  'udaipur': 'UDR',
  'rishikesh': 'DED',
  'haridwar': 'HW',
  'shimla': 'SLV',
  'manali': 'KUU',
  'darjeeling': 'IXB',
  'ooty': 'ONY',
  'munnar': 'COK',
  'pondicherry': 'PNY',
  'puducherry': 'PNY',
  'mahabalipuram': 'MAA',
  'mamallapuram': 'MAA',
  'khajuraho': 'HJR',
  'hampi': 'BLR',
  'ajanta': 'IXU',
  'ellora': 'IXU',
  'konark': 'BBI',
  'puri': 'BBI',
  'mount abu': 'ABR',
  'gangtok': 'IXB',
  'shillong': 'SHL',
  'port blair': 'IXZ',
  'andaman': 'IXZ',
  'leh': 'IXL',
  'ladakh': 'IXL',
  'jammu': 'IXJ',
  'dwarka': 'OMN',
  'somnath': 'DIU',
  'rameswaram': 'RMD',
  'kanyakumari': 'IXY',
  'shirdi': 'SAG',
  'ajmer': 'AJM',
  'pushkar': 'AJM',
  'mathura': 'DEL',
  'vrindavan': 'DEL',
  'ayodhya': 'AYJ',
  'bodhgaya': 'GAY',
  'gaya': 'GAY',
  'faridabad': 'DEL',
  'ghaziabad': 'DEL',
  'greater noida': 'DEL',
  'navi mumbai': 'BOM',
  'thane': 'BOM',
  'mangalore': 'IXE',
  'udupi': 'IXE',
  'varkala': 'TRV',
  'kovalam': 'TRV',
  'mahabaleshwar': 'PNQ',
  'lonavala': 'PNQ',
  'alibaug': 'BOM',
  'daman': 'NMB',
  'diu': 'DIU',
  'lakshadweep': 'AGX',
  'vasco da gama': 'GOI',
  'mussoorie': 'DED',
  'nainital': 'PGH',
  'dehradun': 'DED',
  'coorg': 'IXG',
  'kodaikanal': 'IXM',
  'yercaud': 'SXV',
  'coonoor': 'ONY',
  'pachmarhi': 'BHO',
  'matheran': 'BOM',
  'lavasa': 'PNQ',
  'surat': 'STV',
  'kanpur': 'KNU',
  'rourkela': 'ROU',
  'durgapur': 'RDP',
  'asansol': 'CCU',
  'salem': 'SXV',
  'tirunelveli': 'TEN',
  'vellore': 'VLR',
  'tiruchirappalli': 'TRZ',
  'trichy': 'TRZ',
  'thanjavur': 'TJV',
  'warangal': 'WGC',
  'guntur': 'GNT',
  'nellore': 'NLR',
  'tiruppur': 'TUP',
  'erode': 'ERD',
  'karur': 'KRR',
  'belgaum': 'IXG',
  'gulbarga': 'GBI',
  'bellary': 'BEP',
  'tumkur': 'TUM',
  'rajahmundry': 'RJA',
  'kakinada': 'CCU',
  'bhilai': 'RPR',
  'jamshedpur': 'IXW',
  'cuttack': 'CTC',
  'bilaspur': 'PAB',
  'raigarh': 'RGH',
  'korba': 'RPR',
  'siliguri': 'IXB',
  
  // Canada
  'toronto': 'YTO',
  'vancouver': 'YVR',
  'montreal': 'YMQ',
  'calgary': 'YYC',
  'ottawa': 'YOW'
};

const getCityCode = (destination) => {
  if (!destination || destination.trim() === '') {
    return null;
  }
  
  const normalized = destination.toLowerCase().trim();
  const code = CITY_CODES[normalized];
  
  if (!code) {
    console.warn(`City "${destination}" not found in database.`);
    return null;
  }
  
  console.log(`Found city code: ${destination} → ${code}`);
  return code;
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
    
    if (!cityCode) {
      const errorMsg = filters.destination 
        ? `City "${filters.destination}" not found. Please try: Mumbai, Delhi, Bangalore, Goa, Jaipur, Dubai, Paris, New York, etc.`
        : 'Please enter a destination city';
      throw new Error(errorMsg);
    }

    console.log('Searching hotels with parameters:', {
      cityCode,
      cityName: filters.destination,
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
      throw new Error(`No hotels found in ${filters.destination || cityCode}. Try a different city.`);
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
  
  let rating = 0;
  if (hotel.rating) {
    rating = parseInt(hotel.rating);
  } else if (hotel.categoryCode) {
    const match = hotel.categoryCode.match(/(\d+)/);
    if (match) {
      rating = parseInt(match[1]);
    }
  }
  
  return {
    code: hotel.hotelId,
    name: hotel.name,
    cityCode: hotel.cityCode,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    
    categoryName: rating > 0 ? `${rating} Stars` : '3 Stars',
    rating: rating > 0 ? rating : 3,
    
    address: hotel.address?.lines?.[0] || '',
    city: hotel.address?.cityName || filters.destination || cityCode,
    
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

console.log(`Transformed ${hotels.length} hotels with ratings`);

const ratingCounts = hotels.reduce((acc, h) => {
  acc[h.rating] = (acc[h.rating] || 0) + 1;
  return acc;
}, {});
console.log('Rating distribution:', ratingCounts);

    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      const beforeCount = hotels.length;
      hotels = hotels.filter(hotel => {
        const stars = hotel.rating || 0;
        return stars >= minRating;
      });
      console.log(`Rating filter (${minRating}+): ${beforeCount} → ${hotels.length} hotels`);
    }

    if (filters.minPrice || filters.maxPrice) {
      const minPrice = parseFloat(filters.minPrice) || 0;
      const maxPrice = parseFloat(filters.maxPrice) || 999999;
      const beforeCount = hotels.length;
      
      hotels = hotels.filter(hotel => {
        const price = parseFloat(hotel.minRate);
        return price >= minPrice && price <= maxPrice;
      });
      console.log(`Price filter ($${minPrice}-$${maxPrice}): ${beforeCount} → ${hotels.length} hotels`);
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
      throw new Error(error.message);
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

export const POPULAR_CITIES = [
  // International
  'New York', 'Los Angeles', 'London', 'Paris', 'Dubai', 'Singapore', 'Tokyo', 'Bangkok', 'Hong Kong', 'Sydney',
  
  // Indian Cities
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Udaipur', 'Agra', 'Varanasi', 'Shimla', 'Manali', 'Rishikesh', 'Darjeeling', 'Ooty', 'Tirupati', 'Shirdi', 'Haridwar', 'Amritsar', 'Puri', 'Kochi', 'Mysore', 'Coimbatore', 'Indore', 'Bhopal', 'Chandigarh', 'Lucknow', 'Nagpur', 'Surat', 'Visakhapatnam'
];