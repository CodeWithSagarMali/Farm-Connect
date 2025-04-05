import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Default fetch with error handling for API requests
const defaultFetcher: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// API request for mutations (POST, PATCH, DELETE)
export const apiRequest = async <T>(
  methodOrOptions: string | {
    url: string;
    method: "POST" | "PATCH" | "DELETE";
    data?: any;
  },
  urlOrData?: string | any,
  data?: any
): Promise<T> => {
  let method: string;
  let url: string;
  let bodyData: any;

  // Handle both function signatures
  if (typeof methodOrOptions === 'string') {
    // Called as apiRequest(method, url, data)
    method = methodOrOptions;
    url = urlOrData as string;
    bodyData = data;
  } else {
    // Called as apiRequest({ url, method, data })
    method = methodOrOptions.method;
    url = methodOrOptions.url;
    bodyData = methodOrOptions.data;
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyData ? JSON.stringify(bodyData) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultFetcher,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});