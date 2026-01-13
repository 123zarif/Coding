import { use, createContext, type PropsWithChildren, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext<{
    verify: () => Promise<void | null>;
    signIn: (username: string, password: string) => Promise<boolean>;
    signOut: () => void;
    session?: { id: number; name: string; token: string } | null;
    isLoading: boolean;
}>({
    verify: async () => null,
    signIn: async () => false,
    signOut: async () => null,
    session: null,
    isLoading: true,
});

export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<{ isLoading: boolean, session: { id: number; name: string; token: string } | null }>({ isLoading: true, session: null });

    return (
        <AuthContext.Provider
            value={{
                verify: async () => {
                    const token = await SecureStore.getItemAsync("token");
                    if (!token) {
                        setSession({ isLoading: false, session: null });
                        return;
                    }

                    const req = await fetch(`${process.env.EXPO_PUBLIC_PROTOCOL}${process.env.EXPO_PUBLIC_API_URL}/verify_token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token }),
                    });
                    const res = await req.json();

                    if (!res.success) {
                        setSession({ isLoading: false, session: null });
                        return;
                    }

                    setSession({ isLoading: false, session: { id: res?.id, name: res?.name, token: token } });
                },
                signIn: async (username: string, password: string) => {
                    if (!username || !password) {
                        setSession({ isLoading: false, session: null });
                        return false;
                    }

                    const req = await fetch(`${process.env.EXPO_PUBLIC_PROTOCOL}${process.env.EXPO_PUBLIC_API_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username,
                            password,
                        }),
                    })

                    const res = await req.json();

                    if (!res.success) {
                        setSession({ isLoading: false, session: null });
                        return false;
                    }
                    await SecureStore.setItemAsync('token', res.token);
                    setSession({ isLoading: false, session: { id: res?.id, name: res?.name, token: res?.token } });

                    return true
                },
                signOut: async () => {
                    await SecureStore.deleteItemAsync('token');
                    setSession({ isLoading: false, session: null });
                },
                session: session?.session,
                isLoading: session.isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
