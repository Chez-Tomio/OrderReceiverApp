import React, { useState } from 'react';
import { TouchableHighlight } from 'react-native';
import Collapsible from 'react-native-collapsible';

export const CollapsibleSection: React.FC<{ title: JSX.Element }> = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <>
            <TouchableHighlight onPress={() => setIsCollapsed(!isCollapsed)} underlayColor="white">
                {title}
            </TouchableHighlight>
            <Collapsible collapsed={isCollapsed}>{children}</Collapsible>
        </>
    );
};
