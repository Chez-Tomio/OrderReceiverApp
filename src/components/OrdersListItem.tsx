import React from 'react';
import { Button, Text, View } from 'react-native';

import { Order } from '../interfaces/order';
import { CollapsibleSection } from './CollapsibleSection';
import { Spacer } from './Spacer';

export const OrdersListItem = React.memo<{
    order: Order;
    onPrint: (order: Order) => void;
    onMarkAsCompleted: (order: Order) => void;
}>(({ order, onPrint, onMarkAsCompleted }) => (
    <View>
        <CollapsibleSection
            title={
                <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
                    Order #{order.id} ({order.contactPhoneNumber}) (
                    {new Date(order.time).toLocaleString()})
                </Text>
            }
        >
            {order.products.map((p) => (
                <View key={p.id}>
                    <Text style={{ fontSize: 20 }}>{p.title}</Text>
                    {p.extras.length > 0 && (
                        <Text
                            style={{
                                fontStyle: 'italic',
                                fontSize: 18,
                            }}
                        >
                            Extras: {p.extras.map((e) => e.title).join(', ')}
                        </Text>
                    )}
                </View>
            ))}
        </CollapsibleSection>
        <View style={{ flexDirection: 'row' }}>
            <Button title="Print" onPress={onPrint.bind(undefined, order)} />
            <Spacer size={10} direction="horizontal" />
            <Button
                title="Mark as completed"
                disabled={order.completed}
                onPress={onMarkAsCompleted.bind(undefined, order)}
                color="green"
            />
        </View>
        <Spacer size={20} />
    </View>
));
