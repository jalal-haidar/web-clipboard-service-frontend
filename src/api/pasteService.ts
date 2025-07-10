import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_ENV_BASEURL ||
  (import.meta.env.DEV ? '/api' : 'https://pastebin-api.onrender.com');
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
  createdAt?: string;
  expiresAt?: string;
}

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
