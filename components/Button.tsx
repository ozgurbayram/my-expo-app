import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import BaseText from './BaseText';

interface IButtonProps extends PressableProps {
  onPress?: () => void;
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  scaleAnimation?: {
    enabled?: boolean;
    value?: number;
  };
}

const Button = ({
  onPress,
  title,
  icon,
  children,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  iconPosition = 'left',
  loading = false,
  scaleAnimation = { enabled: true, value: 0.95 },
  className,
  textClassName,
  ...props
}: IButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (scaleAnimation.enabled) {
      scale.value = withSpring(scaleAnimation.value ?? 0.95);
    }
  };

  const handlePressOut = () => {
    if (scaleAnimation.enabled) {
      scale.value = withSpring(1);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-700';
      case 'outline':
        return 'bg-transparent border border-indigo-500';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-indigo-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8 px-3';
      case 'large':
        return 'h-14 px-6';
      default:
        return 'h-12 px-4';
    }
  };

  const getTextClasses = () => {
    let classes = 'text-base font-semibold';

    switch (variant) {
      case 'outline':
        classes += 'text-indigo-500';
        break;
      case 'secondary':
        classes += 'text-white';
        break;
      case 'ghost':
        classes += 'text-indigo-500';
        break;
      default:
        classes += 'text-white';
    }

    return classes;
  };

  const renderContent = () => {
    if (children) return children;

    return (
      <View className="flex-row items-center justify-center">
        {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
        {title && (
          <BaseText variant="body" className={`${getTextClasses()} ${textClassName}`}>
            {title}
          </BaseText>
        )}
        {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
      </View>
    );
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        className={`flex-row items-center justify-center rounded-lg ${getVariantClasses()} ${getSizeClasses()} ${disabled ? 'opacity-50' : ''} ${className}`}
        {...props}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? '#6366f1' : '#ffffff'}
          />
        ) : (
          renderContent()
        )}
      </Pressable>
    </Animated.View>
  );
};

Button.displayName = 'Button';

export default Button;
