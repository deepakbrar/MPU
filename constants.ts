import { SalesPerson, Hotel, TaskSubject } from './types';

export const MOCK_USERS: SalesPerson[] = [
  { id: '0055g000004XYZ1', name: 'Alice Johnson' },
  { id: '0055g000004XYZ2', name: 'Bob Smith' },
  { id: '0055g000004XYZ3', name: 'Charlie Davis' },
  { id: '0055g000004XYZ4', name: 'Diana Prince' },
];

export const MOCK_HOTELS: Hotel[] = [
  { id: 'a005g00000ABCD1', name: 'Grand Plaza Hotel' },
  { id: 'a005g00000ABCD2', name: 'Seaside Resort & Spa' },
  { id: 'a005g00000ABCD3', name: 'Mountain View Lodge' },
  { id: 'a005g00000ABCD4', name: 'City Center Inn' },
  { id: 'a005g00000ABCD5', name: 'Lakeside Retreat' },
];

export const SUBJECT_OPTIONS = Object.values(TaskSubject);

export const CSV_HEADERS = [
  "Owner ID",
  "Owner Name",
  "Related To (WhatId)",
  "Hotel Name",
  "Subject",
  "Comments/Description",
  "Due Date",
  "Task Type"
];
