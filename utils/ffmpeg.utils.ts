import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { FFmpegKit, FFmpegKitConfig, FFprobeKit, ReturnCode } from 'ffmpeg-kit-react-native';

/**
 * Interface for video crop parameters
 */
interface ICropVideoParams {
  inputPath: string;
  outputPath: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  onProgress?: (progress: number) => void;
}

/**
 * Interface for video metadata
 */
interface IVideoMetadata {
  title?: string;
  author?: string;
  copyright?: string;
  comment?: string;
  [key: string]: string | undefined;
}

/**
 * Crops a video from startTime to endTime
 * @param params The parameters for cropping the video
 * @returns Promise that resolves with the output path on success
 */
export const cropVideo = async (params: ICropVideoParams): Promise<string> => {
  const { inputPath, outputPath, startTime, endTime, onProgress } = params;

  // Calculate duration
  const duration = endTime - startTime;

  if (duration <= 0) {
    throw new Error('End time must be greater than start time');
  }

  // Generate a unique output path if not provided
  let finalOutputPath = outputPath;
  if (!finalOutputPath || finalOutputPath === '') {
    const timestamp = new Date().getTime();
    const fileExtension = inputPath.split('.').pop();
    finalOutputPath = `${FileSystem.cacheDirectory}cropped_${timestamp}.${fileExtension}`;
  }

  // Ensure output directory exists
  const outputDir = finalOutputPath.substring(0, finalOutputPath.lastIndexOf('/'));
  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true }).catch(() => {});

  // Build FFmpeg command
  const command = `-ss ${startTime} -i "${inputPath}" -t ${duration} -c:v copy -c:a copy "${finalOutputPath}"`;

  try {
    // Execute FFmpeg command
    const session = await FFmpegKit.executeAsync(
      command,
      async (session) => {
        const returnCode = await session.getReturnCode();
        if (!ReturnCode.isSuccess(returnCode)) {
          throw new Error(`FFmpeg process exited with code ${returnCode}`);
        }
      },
      (log) => {
        // Optional logging can be implemented here
      },
      (statistics) => {
        if (onProgress) {
          const timeInMilliseconds = statistics.getTime();
          const progressPercent = Math.min((timeInMilliseconds / (duration * 1000)) * 100, 100);
          onProgress(progressPercent);
        }
      }
    );

    return finalOutputPath;
  } catch (error) {
    throw error;
  }
};

/**
 * Saves a video with metadata
 * @param inputPath Path to the input video
 * @param outputPath Path where the output video will be saved
 * @param metadata Metadata to add to the video
 * @returns Promise that resolves with the output path on success
 */
export const saveVideoWithMetadata = async (
  inputPath: string,
  outputPath: string,
  metadata: IVideoMetadata
): Promise<string> => {
  const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true }).catch(() => {});

  const metadataArgs = Object.entries(metadata)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `-metadata ${key}="${value}"`)
    .join(' ');

  const command = `-i "${inputPath}" -c:v copy -c:a copy ${metadataArgs} "${outputPath}"`;

  try {
    return new Promise((resolve, reject) => {
      FFmpegKit.executeAsync(
        command,
        async (session) => {
          if (!session) {
            reject(new Error('FFmpeg session is null'));
            return;
          }

          const returnCode = await session.getReturnCode();

          if (ReturnCode.isSuccess(returnCode)) {
            try {
              const asset = await MediaLibrary.createAssetAsync(outputPath);
              await MediaLibrary.createAlbumAsync('VideoDiary', asset, false);
              console.log('Video saved to media library:', asset);
            } catch (mediaError) {
              console.error('Error saving to media library:', mediaError);
            }

            resolve(outputPath);
          } else if (ReturnCode.isCancel(returnCode)) {
            reject(new Error('Video saving was cancelled'));
          } else {
            reject(new Error(`Video saving failed with code ${returnCode}`));
          }
        },
        (log) => {
          console.log('FFmpeg log:', log?.getMessage());
        },
        (statistics) => {
          // Optional: Track progress
        }
      );
    });
  } catch (error) {
    console.error('Error during video saving:', error);
    throw error;
  }
};

/**
 * Gets video information using FFprobe
 * @param videoPath Path to the video file
 * @returns Promise that resolves with video information as a JSON object
 */
export const getVideoInfo = async (videoPath: string): Promise<any> => {
  const command = `-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 -i "${videoPath}"`;

  try {
    const info = await new Promise<string>((resolve, reject) => {
      FFmpegKit.executeAsync(
        command,
        async (session) => {
          const returnCode = await session.getReturnCode();
          const output = await session.getOutput();

          if (ReturnCode.isSuccess(returnCode)) {
            resolve(output);
          } else {
            reject(new Error(`Failed to get video info with code ${returnCode}`));
          }
        },
        (log) => {
          // console.log('FFprobe log:', log.getMessage());
        }
      );
    });

    return JSON.parse(info);
  } catch (error) {
    // console.error('Error getting video info:', error);
    throw error;
  }
};

/**
 * Initializes FFmpegKit
 * This should be called early in your app's lifecycle
 */
export const initFFmpeg = async (): Promise<void> => {
  try {
    // Get FFmpeg version
    const version = await FFmpegKitConfig.getFFmpegVersion();
    // console.log('FFmpeg version:', version);

    // Set log level
    // await FFmpegKitConfig.setLogLevel(LogLevel.AV_LOG_INFO);

    // Set up any other configurations as needed

    console.log('FFmpeg initialized successfully');
  } catch (error) {
    console.error('Error initializing FFmpeg:', error);
    throw error;
  }
};

/**
 * Saves a video file to the device's media library
 * @param fileUri URI of the video file to save
 * @param album Optional album name to save the video to
 * @returns Promise that resolves with the saved asset
 */
export const saveToMediaLibrary = async (
  fileUri: string,
  album?: string
): Promise<MediaLibrary.Asset> => {
  try {
    const mediaGradnte = await MediaLibrary.requestPermissionsAsync();
    const fileSystemGrant =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!mediaGradnte.granted || !fileSystemGrant.granted) {
      throw new Error('Media library permission not granted');
    }

    const asset = await MediaLibrary.createAssetAsync(fileUri);

    if (album) {
      const albumObj =
        (await MediaLibrary.getAlbumAsync(album)) ||
        (await MediaLibrary.createAlbumAsync(album, asset, false));

      if (albumObj && asset) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], albumObj, false);
      }
    }

    console.log('Video saved to media library successfully');
    return asset;
  } catch (error) {
    console.error('Error saving to media library:', error);
    throw error;
  }
};

/**
 * Gets the duration of a video
 * @param videoPath Path to the video file
 * @returns Promise that resolves with the duration of the video in seconds
 */
export const getVideoDuration = async (videoPath: string): Promise<number> => {
  try {
    const session = await FFprobeKit.getMediaInformation(videoPath);
    const mediaInfo = session.getMediaInformation();
    const durationStr = mediaInfo.getDuration();

    return durationStr;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

export const getVideoThumbnails = async (videoPath: string, count = 5): Promise<string[]> => {
  try {
    // Get video duration first
    const duration = await getVideoDuration(videoPath);
    console.log('Video duration:', duration);

    if (duration <= 0) {
      console.warn('Could not determine video duration, using default of 10 seconds');
    }

    // Calculate interval based on duration and desired count
    const interval = Math.max(1, Math.floor(duration / count));

    // Create thumbnails directory in cache with timestamp to avoid conflicts
    const timestamp = new Date().getTime();
    const outputDir = `${FileSystem.cacheDirectory}thumbnails_${timestamp}`;
    await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

    const session = await FFmpegKit.executeAsync(
      `-i "${videoPath}" -vf "select=eq(n\,${interval})" -vframes 1 "${outputDir}/thumb_${timestamp}.jpg"`
    );
    const returnCode = await session.getReturnCode();

    console.log('return code for thumnail', session);

    const thumbnails: string[] = [];
    return thumbnails;
  } catch (error) {
    console.error('Error getting video thumbnails:', error);
    return [];
  }
};

// FFmpeg log levels
enum LogLevel {
  AV_LOG_QUIET = -8,
  AV_LOG_PANIC = 0,
  AV_LOG_FATAL = 8,
  AV_LOG_ERROR = 16,
  AV_LOG_WARNING = 24,
  AV_LOG_INFO = 32,
  AV_LOG_VERBOSE = 40,
  AV_LOG_DEBUG = 48,
  AV_LOG_TRACE = 56,
}
