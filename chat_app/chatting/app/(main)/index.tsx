import { memo, useCallback, useEffect, useState, useRef } from "react";
import { Text, View, FlatList, TextInput, TouchableHighlight } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useWebSocket } from "../../context/WebSocketContext";
import * as SecureStore from 'expo-secure-store';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  type SharedValue,
  useAnimatedStyle,
  FadeInDown,
  FadeOutDown
} from 'react-native-reanimated';


const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 90 }],
    };
  });

  return (
    <Reanimated.View
      style={[
        styleAnimation,
        {
          backgroundColor: "#000000ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 80,
          height: "100%",
        },
      ]}
    >
      <TouchableHighlight
        onPress={() => console.log("Replied to message")}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome6 name="reply" size={15} color="#ffffff" />
      </TouchableHighlight>
    </Reanimated.View>
  );
}

const MessageItem = memo(({ item, show_pfp, onReply }: { item: any, show_pfp: boolean, onReply: (item: any) => void }) => {
  const swipeableRef = useRef<any>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1}
      overshootRight={false}
      enableTrackpadTwoFingerGesture
      rightThreshold={80}
      dragOffsetFromRightEdge={50}
      renderRightActions={RightAction}
      containerStyle={{ marginTop: show_pfp ? 20 : 0 }}
      onSwipeableOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        swipeableRef.current?.close();
        onReply(item);
      }}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}>
        {show_pfp && (
          <Image
            style={{
              width: 40,
              height: 40,
              borderRadius: 40,
              borderColor: "#ffffff",
              borderWidth: 1,
              backgroundColor: "#0553",
              marginRight: 10,
            }}
            source={`https://ui-avatars.com/api/?name=${item.name ? item.name : 'User'}&background=random`}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        )}
        <View
          style={{
            flex: 1,
            height: "100%",
            padding: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {show_pfp && (
            <Text
              style={{
                color: "#F7F7F7",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {item.name}
            </Text>
          )}
          <Text
            style={{
              marginLeft: show_pfp ? 0 : 50,
              color: "#DADADB",
              fontSize: 18,
              fontWeight: "semibold",
            }}
          >
            {item.data}
          </Text>
        </View>
      </View>
    </ReanimatedSwipeable>
  )
});


export default function Index() {
  const { ws } = useWebSocket();
  const [messages, setMessages] = useState<any>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);

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

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const show_pfp =
      index === messages.length - 1 ||
      (messages[index + 1]?.userid !== item?.userid &&
        !(index === 0 && messages[1]?.userid == messages[0]?.userid));

    return (
      <MessageItem item={item} show_pfp={show_pfp} onReply={setReplyingTo} />
    )
  }, [messages]);

  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={{ flex: 1, backgroundColor: "#1A1A1E" }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#242121ff", borderTopColor: '#29292D', borderTopWidth: 2 }} behavior="padding" keyboardVerticalOffset={90} enabled={true}>
        <FlatList
          data={messages}
          style={{ flex: 1, marginLeft: 15, marginRight: 15 }}
          inverted
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />

        {replyingTo && (
          <Reanimated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutDown.duration(300)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              backgroundColor: '#29292D',
              borderTopColor: '#333337',
              borderTopWidth: 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F7F7F7', fontWeight: 'bold' }}>Replying to {replyingTo.name}</Text>
              <Text style={{ color: '#DADADB' }} numberOfLines={1}>{replyingTo.data}</Text>
            </View>
            <TouchableHighlight onPress={() => setReplyingTo(null)} style={{ padding: 5 }}>
              <FontAwesome6 name="xmark" size={20} color="#DADADB" />
            </TouchableHighlight>
          </Reanimated.View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 1, paddingBottom: 1, marginTop: replyingTo ? 0 : 10, borderTopColor: '#333337', borderTopWidth: replyingTo ? 0 : 1 }}>
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
              ws.send(JSON.stringify({ event: "sendMsg", data: text, type: "text", replyTo: replyingTo ? replyingTo.id : null }));
              setText("");
              setReplyingTo(null);
            }
          }} style={{ padding: 10 }}>
            <FontAwesome6 name="paper-plane" size={24} color="#ffffff" />
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
