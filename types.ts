export enum TaskSubject {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Negotiation = 'Negotiation',
  FollowUp = 'Follow-up',
  SiteVisit = 'Site Visit'
}

export interface SalesPerson {
  id: string; // SFDC User ID
  name: string;
}

export interface Hotel {
  id: string; // SFDC Record ID
  name: string;
}

export interface PlanTask {
  id: string;
  ownerId: string; // User ID
  ownerName: string; // For display
  whatId: string; // Hotel ID
  whatName: string; // For display
  subject: TaskSubject;
  description: string; // Comments
  dueDate: string; // YYYY-MM-DD
  month: string; // Selected month (e.g., "January 2025")
  taskType: 'Monthly Plan'; // Hardcoded
  status: 'Not Started'; // Default SFDC status
}

export interface AIGeneratedTask {
  subject: TaskSubject;
  description: string;
  dueDate: string;
}
