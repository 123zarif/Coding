import { Stack } from "expo-router";
import { Image } from 'expo-image';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { WebSocketProvider } from "../../context/WebSocketContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSession } from "@/context/AuthContext";
import { useEffect } from "react";

export default function RootLayout() {
  const { verify, session } = useSession();

  useEffect(() => {
    const func = async () => {
      await verify()
    }

    func()
  }, [])


  return (
    <>
      <WebSocketProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <Stack
              screenOptions={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#1A1A1E',
                },

                headerTintColor: '#ffffffff',
              }}>
              <Stack.Protected guard={!!session}>
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
              </Stack.Protected>
              <Stack.Protected guard={!session}>
                <Stack.Screen name="login/index" options={{ headerShown: false }} />
              </Stack.Protected>
            </Stack>

          </KeyboardProvider>
        </GestureHandlerRootView>
      </WebSocketProvider>
    </>
  )

}
