import { memo, useRef } from "react";
import { Text, View } from "react-native";
import { Image } from 'expo-image';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import { LeftAction, RightAction } from "./Swipe_Items";



const MessageItem = memo(({ item, show_pfp, onReply, replied_to }: { item: any, show_pfp: boolean, onReply: (item: any) => void, replied_to: any }) => {
    const swipeableRef = useRef<any>(null);

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            friction={1}
            overshootRight={false}
            overshootLeft={false}
            enableTrackpadTwoFingerGesture
            rightThreshold={40}
            leftThreshold={40}
            dragOffsetFromRightEdge={40}
            renderRightActions={RightAction}
            renderLeftActions={LeftAction}
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
            <View style={{ flex: 1 }}>
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
                    <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', opacity: 0.9 }}>
                        Replies to
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', opacity: 0.9 }}>
                            Replies to
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#a1a1aa', fontSize: 12, marginLeft: 4, opacity: 0.7, maxWidth: '80%', overflow: 'hidden', textAlign: 'left' }}>
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
                                backgroundColor: '#18181b',
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
                                <Text style={{ color: '#fafafa', fontSize: 20, fontWeight: "700", marginRight: 8, letterSpacing: 0.2 }}>
                                    {item.name}
                                </Text>
                                <Text style={{ color: '#fafafa', fontSize: 11, fontWeight: '500' }}>
                                    {item.timestamp}
                                </Text>
                            </View>
                        )}
                        <Text
                            style={{
                                color: show_pfp ? '#e4e4e7' : '#d4d4d8',
                                fontSize: 19,
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


export default MessageItem;