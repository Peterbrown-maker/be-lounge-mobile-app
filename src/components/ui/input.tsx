import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    fontSize: 16,
  },
});

export const Input: React.FC<InputProps> = ({ placeholder, value, onChangeText }) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
    />
  );
};
