import { SalesPerson, Hotel, Portfolio, HotelMapping } from '../types';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

interface SheetData {
  users: SalesPerson[];
  hotels: Hotel[];
  subjects: string[];
  portfolios: Portfolio[];
  hotelMappings: HotelMapping[];
}

export async function fetchGoogleSheetData(): Promise<SheetData> {
  if (!SPREADSHEET_ID || !API_KEY) {
    throw new Error('Google Sheets credentials not configured. Please check your .env file.');
  }

  try {
    const [usersResponse, hotelsResponse, subjectsResponse, portfoliosResponse, mappingsResponse] = await Promise.all([
      fetchSheetRange('Users!A2:B'),
      fetchSheetRange('Hotels!A2:B'),
      fetchSheetRange('Subjects!A2:A'),
      fetchSheetRange('Portfolios!A2:A'),
      fetchSheetRange('HotelMapping!A2:C'),
    ]);

    const users: SalesPerson[] = usersResponse.values?.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
    })).filter((user: SalesPerson) => user.id && user.name) || [];

    const hotels: Hotel[] = hotelsResponse.values?.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
    })).filter((hotel: Hotel) => hotel.id && hotel.name) || [];

    const subjects: string[] = subjectsResponse.values?.map((row: string[]) => row[0])
      .filter((subject: string) => subject && subject.trim() !== '') || [];

    const portfolios: Portfolio[] = portfoliosResponse.values?.map((row: string[]) => ({
      name: row[0] || '',
    })).filter((p: Portfolio) => p.name) || [];

    const hotelMappings: HotelMapping[] = mappingsResponse.values?.map((row: string[]) => ({
      propertyId: row[0] || '',
      sfUserId: row[1] || '',
      brand: row[2] || '',
    })).filter((m: HotelMapping) => m.propertyId && m.sfUserId) || [];

    return { users, hotels, subjects, portfolios, hotelMappings };
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw new Error('Failed to fetch data from Google Sheets. Please check your configuration.');
  }
}

async function fetchSheetRange(range: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}
