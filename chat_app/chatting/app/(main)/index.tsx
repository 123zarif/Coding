import { memo, useCallback, useEffect, useState, useRef } from "react";
import { Text, View, FlatList, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
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


const COLORS = {
  BACKGROUND: '#09090b',     // Deepest black-gray
  SURFACE: '#18181b',        // Slightly lighter for cards/sheets
  INPUT_BG: '#27272a',       // Input background
  TEXT_NORMAL: '#e4e4e7',    // Zn-200
  TEXT_HEADER: '#fafafa',    // Zn-50
  TEXT_MUTED: '#a1a1aa',     // Zn-400
  ACCENT: '#6366f1',         // Indigo-500 (More modern Blurple)
  ACCENT_BG: 'rgba(99, 102, 241, 0.15)',
  DANGER: '#ef4444',
  DIVIDER: '#27272a',
  MESSAGE_HOVER: '#18181b'
};



const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 60 }],
    };
  });

  return (
    <Reanimated.View
      style={[
        styleAnimation,
        {
          backgroundColor: COLORS.BACKGROUND,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: 60,
          height: "100%",
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => console.log("Replied to message")}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#404249',
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome6 name="reply" size={20} color={COLORS.TEXT_NORMAL} />
      </TouchableOpacity>
    </Reanimated.View>
  );
}

const LeftAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value - 60 }],
    };
  });

  return (
    <Reanimated.View
      style={[
        styleAnimation,
        {
          backgroundColor: COLORS.BACKGROUND,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: 60, // Width for the edit action
          height: "100%",
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => console.log("Edit action triggered")}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#4CAF50',
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesome6 name="edit" size={20} color={COLORS.TEXT_NORMAL} />
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const MessageItem = memo(({ item, show_pfp, onReply, replied_to, onLayout }: { item: any, show_pfp: boolean, onReply: (item: any) => void, replied_to: any, onLayout: (event: any) => void }) => {
  const swipeableRef = useRef<any>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1}
      overshootRight={false}
      overshootLeft={false}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      leftThreshold={40} // Threshold for triggering left actions
      dragOffsetFromRightEdge={40}
      renderRightActions={RightAction}
      renderLeftActions={LeftAction} // Updated left swipe to include only edit action
      containerStyle={{ flex: 1, flexDirection: 'column', marginTop: show_pfp ? 24 : 2, paddingHorizontal: 0 }}
      onSwipeableOpen={(dir) => {
        if (dir === 'left') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          swipeableRef.current?.close();
          onReply(item);
        }
        if (dir === 'right') {
          console.log("Edit action for message:", item.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          swipeableRef.current?.close();
        }
      }}
    >
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {replied_to && (<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 35, marginBottom: 4, opacity: 0.8 }}>
          <View style={{
            width: 34,
            height: 12,
            borderLeftWidth: 2,
            borderTopWidth: 2,
            borderTopLeftRadius: 6,
            borderColor: '#4b4b4b',
            marginRight: 6,
            marginTop: 8
          }} />
          <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 12, fontWeight: '600', opacity: 0.9 }}>
            Replies to
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 12, fontWeight: '600', opacity: 0.9 }}>
              Replies to
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: COLORS.TEXT_MUTED, fontSize: 12, marginLeft: 4, opacity: 0.7, maxWidth: '80%', overflow: 'hidden', textAlign: 'left' }}>
              {replied_to && replied_to.data}
            </Text>
          </View>
        </View>)}

        <View style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16 }}>
          {show_pfp ? (
            <Image
              style={{
                width: 42,
                height: 42,
                borderRadius: 24,
                backgroundColor: COLORS.SURFACE,
                marginRight: 14,
              }}
              source={`https://ui-avatars.com/api/?name=${item.name ? item.name : 'User'}&background=random`}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : <View style={{ width: 56 }} />}

          <View style={{ flex: 1 }}>
            {show_pfp && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: COLORS.TEXT_HEADER, fontSize: 16, fontWeight: "700", marginRight: 8, letterSpacing: 0.2 }}>
                  {item.name}
                </Text>
                <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 11, fontWeight: '500' }}>
                  {item.timestamp}
                </Text>
              </View>
            )}
            <Text
              style={{
                color: show_pfp ? COLORS.TEXT_NORMAL : '#d4d4d8',
                fontSize: 15.5,
                lineHeight: 22,
                fontWeight: '400',
                letterSpacing: 0.1
              }}
            >
              {item.data}
            </Text>
          </View>
        </View>
      </View>
    </ReanimatedSwipeable >
  )
});


export default function Index() {
  const { ws } = useWebSocket();
  const [messages, setMessages] = useState<any>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});

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

  const handleItemLayout = useCallback((id: string, height: number) => {
    setItemHeights((prev) => ({ ...prev, [id]: height }));
  }, []);

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
        onLayout={(event) => handleItemLayout(item.id, event.nativeEvent.layout.height)}
      />
    );
  }, [messages, handleItemLayout]);

  const onReply = useCallback((item: any) => {
    setReplyingTo(item);
  }, []);


  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={{ flex: 1, flexDirection: "column", backgroundColor: COLORS.BACKGROUND }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }} behavior="padding" keyboardVerticalOffset={90} enabled={true}>
        <FlatList
          data={messages}
          style={{ flex: 1, flexDirection: "column", marginLeft: 0, marginRight: 0 }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          inverted
          keyExtractor={(item) => item.id.toString()}
          renderItem={optimizedRenderItem}
          initialNumToRender={5} // Reduced initial render count for better performance
          maxToRenderPerBatch={3} // Reduced batch size to minimize rendering load
          windowSize={5} // Kept window size small for performance
          removeClippedSubviews={true} // Already enabled for performance
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
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
                backgroundColor: COLORS.DIVIDER,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 13, fontWeight: '600' }}>Replying to {replyingTo.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 4 }}>
                <FontAwesome6 name="xmark" size={16} color={COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            </Reanimated.View>
          )}

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: COLORS.BACKGROUND,
            borderTopColor: COLORS.DIVIDER,
            borderTopWidth: 1
          }}>
            <TouchableOpacity style={{ padding: 10, marginRight: 5, backgroundColor: '#404249', borderRadius: 20 }}>
              <FontAwesome6 name="plus" size={16} color={COLORS.TEXT_NORMAL} />
            </TouchableOpacity>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.INPUT_BG,
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
                  color: COLORS.TEXT_NORMAL,
                  fontSize: 15,
                  height: '100%'
                }}
                placeholder={`Message @${messages[0]?.name || 'channel'}`}
                placeholderTextColor={COLORS.TEXT_MUTED}
              />
              <TouchableOpacity onPress={() => {
                if (ws) {
                  ws.send(JSON.stringify({ event: "sendMsg", data: text, type: "text", replied: replyingTo ? replyingTo.id : null }));
                  setText("");
                  setReplyingTo(null);
                }
              }} style={{ marginLeft: 8 }}>
                <FontAwesome6 name="paper-plane" size={20} color={text.length > 0 ? COLORS.ACCENT : COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
