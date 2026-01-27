import { SalesPerson, Hotel } from '../types';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

interface SheetData {
  users: SalesPerson[];
  hotels: Hotel[];
  subjects: string[];
}

/**
 * Fetches data from Google Sheets using the Sheets API v4
 * Expected sheet structure:
 * - Sheet "Users": Column A = User ID, Column B = User Name
 * - Sheet "Hotels": Column A = Hotel ID, Column B = Hotel Name
 * - Sheet "Subjects": Column A = Subject names
 */
export async function fetchGoogleSheetData(): Promise<SheetData> {
  if (!SPREADSHEET_ID || !API_KEY) {
    throw new Error('Google Sheets credentials not configured. Please check your .env file.');
  }

  try {
    // Fetch all three sheets in parallel
    const [usersResponse, hotelsResponse, subjectsResponse] = await Promise.all([
      fetchSheetRange('Users!A2:B'), // Skip header row
      fetchSheetRange('Hotels!A2:B'),
      fetchSheetRange('Subjects!A2:A'),
    ]);

    // Parse Users
    const users: SalesPerson[] = usersResponse.values?.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
    })).filter((user: SalesPerson) => user.id && user.name) || [];

    // Parse Hotels
    const hotels: Hotel[] = hotelsResponse.values?.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
    })).filter((hotel: Hotel) => hotel.id && hotel.name) || [];

    // Parse Subjects
    const subjects: string[] = subjectsResponse.values?.map((row: string[]) => row[0])
      .filter((subject: string) => subject && subject.trim() !== '') || [];

    return { users, hotels, subjects };
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
