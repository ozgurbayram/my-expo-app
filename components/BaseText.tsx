import React from 'react';
import { Text } from 'react-native';

interface BaseTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

const BaseText = ({ children, className = '', variant = 'body' }: BaseTextProps) => {
  const variantClasses = {
    body: 'text-base font-normal text-gray-900 dark:text-gray-100',
    title: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
    subtitle: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
    caption: 'text-xs font-light text-gray-700 dark:text-gray-300',
  };

  return <Text className={`${variantClasses[variant]} ${className}`}>{children}</Text>;
};

export default BaseText;
