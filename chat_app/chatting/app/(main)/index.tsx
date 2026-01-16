import { useCallback, useEffect, useState, useRef } from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useWebSocket } from "../../context/WebSocketContext";
import * as SecureStore from 'expo-secure-store';
import Reanimated, {
  FadeInDown,
  FadeOutDown
} from 'react-native-reanimated';
import MessageItem from "../Components/Message";
import secureFetch from "@/hooks/secureFetch";



export default function Index() {
  const { ws } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const [crrPage, setCrrPage] = useState<number>(0);
  const [messages, setMessages] = useState<any>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const getMessages = useCallback(async () => {
    try {
      if (loading) return;
      setLoading(true);
      const data = await secureFetch(`${process.env.EXPO_PUBLIC_PROTOCOL}${process.env.EXPO_PUBLIC_API_URL}/messages?page=${crrPage + 1}`, {
        method: 'GET',
      });

      if (!data.success) return;

      setMessages((prev: any) => [...prev, ...data.messages]);
      setCrrPage((prev) => prev + 1);
      setLoading(false);
      return;

    } catch {
      console.log("Error fetching messages");
    } finally {
      setLoading(false);
    }
  }, [loading, crrPage])

  useEffect(() => {
    if (ws) {
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "text") {
          setMessages((prev: any) => [{
            id: Date.now().toString() + Math.random().toString(), // Ensure unique ID
            userid: data.userid,
            name: data.name,
            data: data.data,
            type: data.type,
            replied: data.replied
          }, ...prev]);
        }
      }
    }
  }, [ws]);

  useEffect(() => {
    getMessages()
  }, [])

  const optimizedRenderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const show_pfp =
      index === messages.length - 1 ||
      (messages[index + 1]?.userid !== item?.userid &&
        !(index === 0 && messages[1]?.userid == messages[0]?.userid));

    const replied_to = item.replied ? messages.find((msg: any) => msg.id === item.replied) : null;

    return (
      <MessageItem
        item={item}
        show_pfp={show_pfp}
        onReply={onReply}
        replied_to={replied_to}
      />
    );
  }, [messages]);

  const onReply = useCallback((item: any) => {
    setReplyingTo(item);
  }, []);


  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={{ flex: 1, flexDirection: "column", backgroundColor: '#09090b' }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#09090b' }} behavior="padding" keyboardVerticalOffset={90} enabled={true}>
        <FlatList
          data={messages}
          style={{ flex: 1, flexDirection: "column", marginLeft: 0, marginRight: 0 }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          inverted
          keyExtractor={(item) => item.id.toString()}
          renderItem={optimizedRenderItem}
          initialNumToRender={25}
          maxToRenderPerBatch={25}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={getMessages}
          ListFooterComponent={() => {
            return <Text style={{ color: '#a1a1aa', fontSize: 13, textAlign: 'center', padding: 10 }}> {loading ? 'Loading...' : 'No more messages'}</Text>;
          }}
        />

        <View style={{ marginTop: 10 }}>
          {replyingTo && (
            <Reanimated.View
              entering={FadeInDown.duration(200)}
              exiting={FadeOutDown.duration(200)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: '#27272a',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#a1a1aa', fontSize: 13, fontWeight: '600' }}>Replying to {replyingTo.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 4 }}>
                <FontAwesome6 name="xmark" size={16} color='#a1a1aa' />
              </TouchableOpacity>
            </Reanimated.View>
          )}

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: '#09090b',
            borderTopColor: '#27272a',
            borderTopWidth: 1
          }}>
            <TouchableOpacity style={{ padding: 10, marginRight: 5, backgroundColor: '#404249', borderRadius: 20 }}>
              <FontAwesome6 name="plus" size={16} color='#e4e4e7' />
            </TouchableOpacity>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#27272a',
              borderRadius: 20,
              paddingHorizontal: 15,
              height: 45
            }}>
              <TextInput
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                id="input"
                value={text}
                onChangeText={setText}
                style={{
                  flex: 1,
                  color: '#e4e4e7',
                  fontSize: 15,
                  height: '100%'
                }}
                placeholder={`Message @${messages[0]?.name || 'channel'}`}
                placeholderTextColor='#a1a1aa'
              />
              <TouchableOpacity onPress={() => {
                if (ws) {
                  ws.send(JSON.stringify({ event: "sendMsg", data: text, type: "text", replied: replyingTo ? replyingTo.id : null }));
                  setText("");
                  setReplyingTo(null);
                }
              }} style={{ marginLeft: 8 }}>
                <FontAwesome6 name="paper-plane" size={20} color={text.length > 0 ? '#8b5cf6' : '#a1a1aa'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
