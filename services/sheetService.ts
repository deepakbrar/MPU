import { SalesPerson, Hotel } from '../types';
import { MOCK_USERS, MOCK_HOTELS, SUBJECT_OPTIONS } from '../constants';
import { fetchGoogleSheetData } from './googleSheetsService';

interface SheetData {
  users: SalesPerson[];
  hotels: Hotel[];
  subjects: string[];
}

/**
 * Main service to fetch sheet data
 * Attempts to use Google Sheets first, falls back to mock data if not configured
 */
export async function fetchSheetData(): Promise<SheetData> {
  const useGoogleSheets = import.meta.env.VITE_USE_GOOGLE_SHEETS === 'true';

  if (useGoogleSheets) {
    try {
      console.log('Fetching data from Google Sheets...');
      const data = await fetchGoogleSheetData();
      console.log('Successfully loaded data from Google Sheets');
      return data;
    } catch (error) {
      console.error('Failed to fetch from Google Sheets, using mock data:', error);
      alert('Unable to connect to Google Sheets. Using sample data instead.');
      return getMockData();
    }
  } else {
    console.log('Using mock data (Google Sheets disabled)');
    return getMockData();
  }
}

function getMockData(): SheetData {
  return {
    users: MOCK_USERS,
    hotels: MOCK_HOTELS,
    subjects: SUBJECT_OPTIONS,
  };
}
