import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm';
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultVariant: {
    backgroundColor: '#3B82F6',
  },
  ghostVariant: {
    backgroundColor: 'transparent',
  },
  defaultSize: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  smSize: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defaultText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  ghostText: {
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const Button: React.FC<ButtonProps> = ({ onPress, children, variant = 'default', size = 'default' }) => {
  const containerStyle = [
    styles.base,
    variant === 'ghost' ? styles.ghostVariant : styles.defaultVariant,
    size === 'sm' ? styles.smSize : styles.defaultSize,
  ];

  const textStyle = variant === 'ghost' ? styles.ghostText : styles.defaultText;

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};
