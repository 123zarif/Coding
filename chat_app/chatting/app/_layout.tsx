import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/context/AuthContext";
import { Stack } from 'expo-router';
import { SplashScreenController } from "@/splash";

export default function RootLayout() {
    return <SafeAreaProvider>
        <SessionProvider>
            <SplashScreenController />
            <Stack screenOptions={{ headerShown: false }} />
        </SessionProvider>
    </SafeAreaProvider >
}
