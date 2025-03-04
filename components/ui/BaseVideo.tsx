import { useVideoPlayer, VideoContentFit, VideoSource, VideoView } from 'expo-video';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface IBaseVideoProps {
  uri: string;
  height?: number;
  width?: number | string;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  useNativeControls?: boolean;
  contentFit?: VideoContentFit;
  allowsFullscreen?: boolean;
  allowsPictureInPicture?: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
  containerStyle?: StyleProp<ViewStyle>;
  videoStyle?: StyleProp<ViewStyle>;
  metadata?: {
    title?: string;
    artist?: string;
    artwork?: string;
  };
}

export interface BaseVideoRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setPosition: (positionMillis: number) => Promise<void>;
  getPlayer: () => any;
}

const BaseVideo = forwardRef<BaseVideoRef, IBaseVideoProps>((props, ref) => {
  const {
    uri,
    height = 240,
    width = '100%',
    shouldPlay = false,
    isLooping = false,
    isMuted = false,
    useNativeControls = true,
    contentFit = 'contain',
    allowsFullscreen = false,
    allowsPictureInPicture = false,
    onPlaybackStatusUpdate,
    containerStyle,
    videoStyle,
    metadata,
  } = props;

  const videoSource: VideoSource = metadata
    ? {
        uri,
        metadata: {
          title: metadata.title,
          artist: metadata.artist,
          artwork: metadata.artwork,
        },
      }
    : uri;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = isLooping;
    player.muted = isMuted;

    if (shouldPlay) {
      player.play();
    }
  });

  useEffect(() => {
    if (onPlaybackStatusUpdate) {
      const subscription = player.addListener('statusChange', onPlaybackStatusUpdate);
      return () => subscription.remove();
    }
  }, [player, onPlaybackStatusUpdate]);

  useImperativeHandle(ref, () => ({
    play: async () => {
      player.play();
    },
    pause: async () => {
      player.pause();
    },
    stop: async () => {
      player.pause();
      player.currentTime = 0;
    },
    setPosition: async (positionMillis: number) => {
      player.currentTime = positionMillis / 1000;
    },
    getPlayer: () => player,
  }));

  const widthStyle = typeof width === 'number' ? { width } : { width: '100%' };

  return (
    <View style={[styles.container, { height }, containerStyle]}>
      <VideoView
        player={player}
        style={[styles.video, widthStyle, videoStyle]}
        contentFit={contentFit}
        nativeControls={useNativeControls}
        allowsFullscreen={allowsFullscreen}
        allowsPictureInPicture={allowsPictureInPicture}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  video: {
    flex: 1,
  },
});

export default BaseVideo;
