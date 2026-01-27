const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

interface UploadTask {
  ownerId: string;
  ownerName: string;
  whatId: string;
  whatName: string;
  subject: string;
  description: string;
  dueDate: string;
  month: string; // Selected month for planning
  taskType: string;
  status?: string;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  rowsAdded?: number;
  error?: string;
}

export async function uploadTasksToGoogleSheets(tasks: UploadTask[]): Promise<UploadResponse> {
  if (!SCRIPT_URL) {
    throw new Error('Google Script URL not configured. Please add VITE_GOOGLE_SCRIPT_URL to .env.local');
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    });

    // Note: no-cors mode doesn't allow reading response, so we assume success
    return {
      success: true,
      message: `${tasks.length} tasks uploaded successfully`,
      rowsAdded: tasks.length,
    };
    
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload tasks',
    };
  }
}
