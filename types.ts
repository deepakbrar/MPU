export enum TaskTypeEnum {
  MonthlyPlan = 'Monthly Plan',
  PortfolioPlan = 'Portfolio Plan',
  OwnerExternal = 'Owner (External)',
  OwnerInternal = 'Owner (Internal)',
}

export interface SalesPerson {
  id: string; // SFDC User ID
  name: string;
}

export interface Hotel {
  id: string; // SFDC Record ID
  name: string;
}

export interface Portfolio {
  name: string; // e.g., "Attica Org", "Brand X"
}

export interface HotelMapping {
  propertyId: string;   // Hotel/Property ID
  sfUserId: string;     // Sales Associate User ID
  brand: string;        // Brand name
}

export interface PlanTask {
  id: string;
  ownerId: string;
  ownerName: string;
  whatId: string;
  whatName: string;
  subject: string;
  description: string;
  dueDate: string;
  month: string;
  taskType: TaskTypeEnum;
  status: 'Not Started';
  portfolio?: string; // For portfolio tasks
}

export interface AIGeneratedTask {
  subject: string;
  description: string;
  dueDate: string;
}
