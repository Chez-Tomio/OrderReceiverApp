import React from 'react';
import { View } from 'react-native';

export const Spacer: React.FC<{
    size?: number;
    direction?: 'vertical' | 'horizontal';
}> = ({ size = 10, direction = 'vertical' }) => (
    <View
        style={{
            [({ vertical: 'height', horizontal: 'width' } as const)[direction]]: size,
        }}
    />
);
