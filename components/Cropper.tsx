import React, { forwardRef, useImperativeHandle } from 'react';
import { Dimensions, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CROP_RAIL_WIDTH = SCREEN_WIDTH - 40;

interface CropperProps {
  videoUri: string;
  duration: number;
  maxDuration: number;
  onSelectionEnd?: (startTime: number, endTime: number) => void;
}

export interface CropperRef {
  getStartTime: () => number;
  getEndTime: () => number;
}

const Cropper = forwardRef<CropperRef, CropperProps>(
  ({ videoUri, duration, maxDuration, onSelectionEnd }, ref) => {
    const startPosition = useSharedValue(0);
    const calculatedEndPosition = Math.min(
      (maxDuration / duration) * CROP_RAIL_WIDTH,
      CROP_RAIL_WIDTH
    );
    const endPosition = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      getStartTime: () =>
        parseFloat(((startPosition.value / CROP_RAIL_WIDTH) * duration).toFixed(2)),
      getEndTime: () => parseFloat(((endPosition.value / CROP_RAIL_WIDTH) * duration).toFixed(2)),
    }));

    const selectionGestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: { startX: number }) => {
        ctx.startX = startPosition.value;
      },
      onActive: (event, ctx) => {
        let newStartPosition = ctx.startX + event.translationX;
        let newEndPosition = newStartPosition + calculatedEndPosition;

        if (newStartPosition < 0) {
          newStartPosition = 0;
          newEndPosition = calculatedEndPosition;
        }
        if (newEndPosition > CROP_RAIL_WIDTH) {
          newEndPosition = CROP_RAIL_WIDTH;
          newStartPosition = CROP_RAIL_WIDTH - calculatedEndPosition;
        }

        startPosition.value = newStartPosition;
        endPosition.value = newEndPosition;
      },
      onEnd: () => {
        startPosition.value = withSpring(startPosition.value);
        endPosition.value = withSpring(endPosition.value);

        if (onSelectionEnd) {
          const startTime = (startPosition.value / CROP_RAIL_WIDTH) * duration;
          const endTime = (endPosition.value / CROP_RAIL_WIDTH) * duration;
          runOnJS(onSelectionEnd)(startTime, endTime);
        }
      },
    });

    const selectedAreaStyle = useAnimatedStyle(() => ({
      left: startPosition.value,
      width: endPosition.value - startPosition.value,
    }));

    React.useEffect(() => {
      endPosition.value = withSpring(calculatedEndPosition, {
        damping: 20,
        stiffness: 90,
      });
    }, [maxDuration, duration]);

    return (
      <View>
        <View className="relative h-[50px] rounded-lg bg-slate-200">
          <Animated.View className="bg-primary/30 absolute h-full" style={selectedAreaStyle} />
          <PanGestureHandler onGestureEvent={selectionGestureHandler}>
            <Animated.View
              className="absolute z-10 h-full bg-transparent"
              style={selectedAreaStyle}
            />
          </PanGestureHandler>
        </View>
      </View>
    );
  }
);

export default Cropper;
