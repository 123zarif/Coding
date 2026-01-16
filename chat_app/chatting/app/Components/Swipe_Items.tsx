import { TouchableOpacity } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Reanimated, {
    type SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

export const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
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
                    backgroundColor: '#09090b',
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
                <FontAwesome6 name="reply" size={20} color='#e4e4e7' />
            </TouchableOpacity>
        </Reanimated.View>
    );
}


export const LeftAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
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
                    backgroundColor: '#09090b',
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
                <FontAwesome6 name="edit" size={20} color='#e4e4e7' />
            </TouchableOpacity>
        </Reanimated.View>
    );
};