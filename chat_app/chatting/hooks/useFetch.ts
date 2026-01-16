import { useState, useEffect } from 'react';

interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}

interface FetchResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
}

function useFetch<T>(url: string, options: FetchOptions = {}): FetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url, JSON.stringify(options)]);

    return { data, error, isLoading };
}

export default useFetch;