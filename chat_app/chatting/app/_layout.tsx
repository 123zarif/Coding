import { Stack } from "expo-router";
import { Image } from 'expo-image';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WebSocketProvider } from "../context/WebSocketContext";


export default function RootLayout() {

  return <SafeAreaProvider>
    <WebSocketProvider>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1A1A1E',
            },

            headerTintColor: '#ffffffff',
          }}>

          <Stack.Screen name="index" options={{
            title: 'Unsaved Document #4',
            headerLeft: () => {
              return <Image
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40,
                  borderColor: '#ffffff',
                  borderWidth: 2,
                  backgroundColor: '#0553',
                  marginRight: 10,
                }}
                source="https://picsum.photos/seed/696/3000/2000"
                contentFit="cover"
                transition={1000} />
            }
          }} />
        </Stack>

      </KeyboardProvider>
    </WebSocketProvider>
  </SafeAreaProvider>
}
