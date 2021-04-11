import React from 'react';
import { View } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';

export const Section: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
    <View style={[{ borderColor: 'black', borderWidth: 4, padding: 15 }, style]}>{children}</View>
);
