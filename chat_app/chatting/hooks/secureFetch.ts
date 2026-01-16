import * as SecureStore from 'expo-secure-store';

async function secureFetch(url: string, options: RequestInit = {}): Promise<any> {

    try {
        const token = await SecureStore.getItemAsync('token');
        const headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch with token failed:', error);
        throw error;
    }
}

export default secureFetch;