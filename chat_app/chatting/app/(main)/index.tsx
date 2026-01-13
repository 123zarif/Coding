import { useEffect, useState } from "react";
import { Text, View, FlatList, TextInput, TouchableHighlight } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useWebSocket } from "../../context/WebSocketContext";
import { Link } from "expo-router";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const { ws } = useWebSocket();
  const [messages, setMessages] = useState<any>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (ws) {
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "text") {
          setMessages((prev: any) => [{
            id: Date.now(),
            userid: data.userid,
            name: data.name,
            data: data.data,
            type: data.type
          }, ...prev]);
        }
      }
    }
  }, [ws]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        let token = await SecureStore.getItemAsync("token");
        const req = await fetch(`${process.env.EXPO_PUBLIC_PROTOCOL}${process.env.EXPO_PUBLIC_API_URL}/messages`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        const res = await req.json();
        setMessages(res.messages);
      } catch {
        console.log("Error fetching messages");
      }
    }

    getMessages()
  }, [])

  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={{ flex: 1, backgroundColor: "#1A1A1E" }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#242121ff", borderTopColor: '#29292D', borderTopWidth: 2 }} behavior="padding" keyboardVerticalOffset={90} enabled={true}>
        <FlatList
          data={messages}
          style={{ flex: 1, marginLeft: 15, marginRight: 15 }}
          inverted
          renderItem={({ item, index }) => {
            const show_pfp = index === messages.length - 1 || messages[index + 1]?.userid !== item?.userid && !(index === 0 && messages[1]?.userid == messages[0]?.userid);
            const show_next_pfp = index == 0 || (messages[index - 1] && messages[index - 2] && messages[index - 1]?.userid !== messages[index - 2]?.userid)

            return <View style={{ flex: 1, flexDirection: 'row', marginTop: show_pfp ? 20 : 0, marginBottom: show_next_pfp ? 10 : 0, alignItems: 'flex-start' }}>
              {show_pfp && <Image
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 40,
                  borderColor: '#ffffff',
                  borderWidth: 1,
                  backgroundColor: '#0553',
                  marginRight: 10,
                }}
                source="https://picsum.photos/45"
                contentFit="contain"
              />}
              <View style={{ flex: 1 }}>
                {show_pfp && <Text style={{ color: '#F7F7F7', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>}
                <Text style={{ marginLeft: show_pfp ? 0 : 55, color: '#DADADB', fontSize: 18, fontWeight: 'semibold' }}>{item.data}</Text>
              </View>
            </View>
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 1, paddingBottom: 1, borderTopColor: '#333337', borderTopWidth: 1 }}>
          <Link href="/login" style={{ marginRight: 10 }}>Go to</Link>
          <TextInput
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            id="input"
            value={text}
            onChangeText={setText}
            style={{
              flex: 1,
              height: 40,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              borderColor: '#555555',
              borderRadius: 10,
              color: '#ffffff',
              backgroundColor: '#29292D',
            }}
            placeholder="Message @Unsaved Document #4"
          />
          <TouchableHighlight onPress={() => {
            if (ws) {
              ws.send(JSON.stringify({ event: "sendMsg", data: text, type: "text" }));
              setText("");
            }
          }} style={{ padding: 10 }}>
            <FontAwesome6 name="paper-plane" size={24} color="#ffffff" />
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
