import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_ENV_BASEURL ||
  (import.meta.env.DEV ? '/api' : 'https://web-clipboard-service.onrender.com');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('All env vars:', import.meta.env);

// Types for better TypeScript support
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface PasteData {
  id: string;
  text: string;
  createdAt?: string;
}
interface CreatePasteResponse {
  id: string;
  expiresAt?: string;
}

interface PasteResponse {
  id: string;
  text: string;
  title?: string;
  language?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface RecentPastesAPIResponse {
  count: number;
  pastes: Array<{
    id: string;
    text: string;
    createdAt: string;
    expiresAt?: string;
  }>;
}

interface StoredPaste {
  id: string;
  text: string;
  title?: string;
  language?: string;
  createdAt: string;
  expiresAt?: string;
}

export type { StoredPaste };

interface CreatePasteOptions {
  title?: string;
  language?: string;
  expiration?: number;
}

interface CreatePasteRequest {
  text: string;
  title?: string;
  language?: string;
  expiration?: number;
}
export const createPaste = async (
  text: string,
  options?: CreatePasteOptions,
): Promise<CreatePasteResponse> => {
  const requestBody: CreatePasteRequest = {
    text,
    ...options,
  };

  try {
    console.log('Creating paste with data:', requestBody);

    const response = await fetch(`${API_BASE_URL}/paste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
      mode: 'cors', // Explicitly set CORS mode
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid paste data provided');
      } else if (response.status === 413) {
        throw new Error('Paste content is too large');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Paste created successfully (ServiceLayer):', data);

    // Store paste in history
    const pasteToStore: StoredPaste = {
      id: data.id,
      text: requestBody.text,
      title: requestBody.title,
      language: requestBody.language,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
    };
    storePasteInHistory(pasteToStore);

    // Add paste ID to user list for cross-device access
    addPasteIdToUserList(data.id);

    return data;
  } catch (error) {
    // Type guard to handle unknown error type
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          'Network error. Please check your connection and ensure the API server is running.',
        );
      }
      if (error.message.includes('CORS')) {
        throw new Error(
          'CORS error. The API server may not be configured to accept requests from this domain.',
        );
      }
      // Re-throw the original error if it's already an Error instance
      throw error;
    }

    // Handle non-Error objects
    throw new Error('An unexpected error occurred while creating paste');
  }
};

// Updated getPaste method with consistent API response structure
export const getPaste = async (id: string): Promise<PasteResponse> => {
  try {
    if (!id || !id.trim()) {
      throw new Error('Paste ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/paste/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('received response for getPaste:', response);

    // if (!response.ok) {
    //   if (response.status === 404) {
    //     throw new Error('Paste not found or has expired');
    //   } else if (response.status === 429) {
    //     throw new Error('Too many requests. Please try again later');
    //   } else if (response.status >= 500) {
    //     throw new Error('Server error. Please try again later');
    //   } else {
    //     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    //   }
    // }

    const data = await response.json();
    console.log('Paste fetched successfully (ServiceLayer):', data);

    // Store fetched paste in history
    const pasteToStore: StoredPaste = {
      id: data.id,
      text: data.text,
      title: data.title,
      language: data.language,
      createdAt: data.createdAt || new Date().toISOString(),
      expiresAt: data.expiresAt,
    };
    storePasteInHistory(pasteToStore);

    return data;
  } catch (error) {
    // Type guard to handle unknown error type
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection');
      } else if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again');
      }
      // Re-throw the original error if it's already an Error instance
      throw error;
    }

    // Handle non-Error objects
    throw new Error('An unexpected error occurred');
  }
};

// Alternative version with more detailed response handling
export const getPasteWithDetails = async (id: string): Promise<PasteResponse> => {
  try {
    const response = await getPaste(id);
    return response;
  } catch (error) {
    console.error('Error fetching paste:', error);
    throw error;
  }
};

// Utility function to check if paste exists without fetching content
export const checkPasteExists = async (id: string): Promise<boolean> => {
  try {
    await axios.head(`${API_BASE_URL}/paste/${id}`);
    return true;
  } catch (error) {
    return false;
  }
};

// LocalStorage key for storing paste history
const PASTE_HISTORY_KEY = 'pastebin-history';

// Function to store paste in localStorage
const storePasteInHistory = (paste: StoredPaste): void => {
  try {
    const existingHistory = getPasteHistory();
    const updatedHistory = [paste, ...existingHistory.filter((p) => p.id !== paste.id)];

    // Keep only last 100 pastes to prevent localStorage bloat
    const trimmedHistory = updatedHistory.slice(0, 100);

    localStorage.setItem(PASTE_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error storing paste in history:', error);
  }
};

// Function to retrieve paste history from localStorage
export const getPasteHistory = (): StoredPaste[] => {
  try {
    const history = localStorage.getItem(PASTE_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving paste history:', error);
    return [];
  }
};

// Function to get pastes from last 24 hours
export const getRecentPastes = (): StoredPaste[] => {
  const history = getPasteHistory();
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  return history.filter((paste) => {
    const createdAt = new Date(paste.createdAt);
    return createdAt > twentyFourHoursAgo;
  });
};

// Function to clear paste history
export const clearPasteHistory = (): void => {
  try {
    localStorage.removeItem(PASTE_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing paste history:', error);
  }
};

// Function to remove a specific paste from history
export const removePasteFromHistory = (pasteId: string): void => {
  try {
    const history = getPasteHistory();
    const updatedHistory = history.filter((paste) => paste.id !== pasteId);
    localStorage.setItem(PASTE_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing paste from history:', error);
  }
};

// Function to delete a paste from the backend
export const deletePaste = async (id: string): Promise<{ message: string; id: string }> => {
  try {
    if (!id || !id.trim()) {
      throw new Error('Paste ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/paste/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('Delete response:', response);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Paste not found or has already been deleted');
      } else if (response.status === 400) {
        throw new Error('Invalid paste ID format');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Paste deleted successfully:', data);

    // Also remove from local history
    removePasteFromHistory(id);

    return data;
  } catch (error) {
    console.error('Error deleting paste:', error);
    throw error;
  }
};

// Function to get all recent pastes from the API
export const getAllRecentPastes = async (): Promise<StoredPaste[]> => {
  try {
    const url = `${API_BASE_URL}/pastes/recent`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      signal: AbortSignal.timeout(15000), // Increase timeout to 15 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No pastes found
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: RecentPastesAPIResponse = await response.json();
    console.log('Recent pastes API response:', data);

    // Validate the response structure
    if (!data || !Array.isArray(data.pastes)) {
      console.warn('Invalid API response structure:', data);
      return getRecentPastes(); // Fallback to localStorage
    }

    // Convert API response to StoredPaste format
    const pastes: StoredPaste[] = data.pastes
      .filter((paste) => paste && paste.id) // Filter out invalid entries
      .map((paste) => ({
        id: paste.id,
        text: paste.text || '', // Ensure text is never undefined
        title: undefined, // API doesn't return title in the preview
        language: undefined, // API doesn't return language in the preview
        createdAt: paste.createdAt || new Date().toISOString(),
        expiresAt: paste.expiresAt,
      }));

    return pastes;
  } catch (error) {
    console.error('Error fetching recent pastes from API:', error);
    // Fallback to localStorage if API fails
    return getRecentPastes();
  }
};

// Function to get recent pastes from API with localStorage fallback
export const getRecentPastesFromAPI = async (): Promise<StoredPaste[]> => {
  try {
    return await getAllRecentPastes();
  } catch (error) {
    console.error('Error fetching recent pastes from API:', error);
    // Fallback to localStorage
    return getRecentPastes();
  }
};

// Configuration for data source
const USE_API_FOR_ALL_PASTES = true; // Set to false to use localStorage only
const MERGE_WITH_LOCALSTORAGE = false; // Set to true to merge API with localStorage

// Unified function to get recent pastes based on configuration
export const getRecentPastesUnified = async (): Promise<StoredPaste[]> => {
  if (USE_API_FOR_ALL_PASTES) {
    try {
      // Get all recent pastes from API (last 24 hours)
      const apiPastes = await getAllRecentPastes();

      if (MERGE_WITH_LOCALSTORAGE) {
        // Merge with localStorage pastes and remove duplicates
        const localPastes = getRecentPastes();
        const allPastes = [...apiPastes, ...localPastes];

        // Remove duplicates based on paste ID
        const uniquePastes = allPastes.filter(
          (paste, index, self) => index === self.findIndex((p) => p.id === paste.id),
        );

        // Sort by creation date (newest first)
        return uniquePastes.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      } else {
        // Return only API pastes (already sorted by backend)
        return apiPastes;
      }
    } catch (error) {
      console.warn('API failed, falling back to localStorage:', error);
      // Return localStorage data as fallback
      return getRecentPastes();
    }
  } else {
    return getRecentPastes();
  }
};

// Enhanced storage for user-specific paste tracking
const USER_PASTE_IDS_KEY = 'user-paste-ids';

// Function to store paste ID for cross-device access
export const addPasteIdToUserList = (pasteId: string): void => {
  try {
    const userPasteIds = getUserPasteIds();
    const updatedIds = [pasteId, ...userPasteIds.filter((id) => id !== pasteId)];

    // Keep only last 200 IDs to prevent storage bloat
    const trimmedIds = updatedIds.slice(0, 200);

    localStorage.setItem(USER_PASTE_IDS_KEY, JSON.stringify(trimmedIds));
  } catch (error) {
    console.error('Error storing paste ID:', error);
  }
};

// Function to get user's paste IDs
export const getUserPasteIds = (): string[] => {
  try {
    const ids = localStorage.getItem(USER_PASTE_IDS_KEY);
    return ids ? JSON.parse(ids) : [];
  } catch (error) {
    console.error('Error retrieving paste IDs:', error);
    return [];
  }
};

// Function to get pastes by fetching from API using stored IDs
export const getUserPastesFromAPI = async (): Promise<StoredPaste[]> => {
  const userPasteIds = getUserPasteIds();
  const pastes: StoredPaste[] = [];

  // Fetch recent 50 pastes to avoid too many API calls
  const recentIds = userPasteIds.slice(0, 50);

  for (const pasteId of recentIds) {
    try {
      const pasteData = await getPaste(pasteId);
      const storedPaste: StoredPaste = {
        id: pasteData.id,
        text: pasteData.text,
        title: pasteData.title,
        language: pasteData.language,
        createdAt: pasteData.createdAt || new Date().toISOString(),
        expiresAt: pasteData.expiresAt,
      };
      pastes.push(storedPaste);
    } catch (error) {
      console.warn(`Failed to fetch paste ${pasteId}:`, error);
      // Remove failed paste ID from list
      removePasteIdFromUserList(pasteId);
    }
  }

  return pastes;
};

// Function to remove paste ID from user list
export const removePasteIdFromUserList = (pasteId: string): void => {
  try {
    const userPasteIds = getUserPasteIds();
    const updatedIds = userPasteIds.filter((id) => id !== pasteId);
    localStorage.setItem(USER_PASTE_IDS_KEY, JSON.stringify(updatedIds));
  } catch (error) {
    console.error('Error removing paste ID:', error);
  }
};

// Function to export paste IDs for cross-device sync
export const exportUserPasteIds = (): string => {
  const userPasteIds = getUserPasteIds();
  return JSON.stringify(userPasteIds);
};

// Function to import paste IDs from another device
export const importUserPasteIds = (exportedData: string): void => {
  try {
    const importedIds = JSON.parse(exportedData);
    if (Array.isArray(importedIds)) {
      const existingIds = getUserPasteIds();
      const mergedIds = [...new Set([...importedIds, ...existingIds])];
      localStorage.setItem(USER_PASTE_IDS_KEY, JSON.stringify(mergedIds));
    }
  } catch (error) {
    console.error('Error importing paste IDs:', error);
  }
};

// Debug function to see what's in localStorage
export const debugLocalStorage = (): void => {
  console.log('=== LOCAL STORAGE DEBUG ===');
  console.log('Paste History:', getPasteHistory());
  console.log('Recent Pastes:', getRecentPastes());
  console.log('User Paste IDs:', getUserPasteIds());
  console.log('========================');
};
