import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  TextInputProps 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  iconName: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  passwordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  isError?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  iconName,
  isPassword = false,
  passwordVisible = false,
  onTogglePasswordVisibility,
  isError = false,
  ...textInputProps
}) => {
  return (
    <View style={[styles.inputContainer, isError && styles.inputError]}>
      <View style={styles.inputIconContainer}>
        <Ionicons name={iconName} size={20} color="#8E8E93" />
      </View>
      
      <TextInput
        style={styles.input}
        placeholderTextColor="#8E8E93"
        secureTextEntry={isPassword && !passwordVisible}
        {...textInputProps}
      />
      
      {isPassword && (
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={onTogglePasswordVisibility}
          disabled={textInputProps.editable === false}
        >
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#8E8E93"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginBottom: 16,
    height: 56,
    // Subtle inner shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  inputIconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#000000',
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
});

export default FormInput;