import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwake } from 'expo-keep-awake';
import parsePhoneNumber from 'libphonenumber-js';
import React from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import {
    InterfaceType,
    StarConnectionSettings,
    StarIO10Error,
    StarPrinter,
    StarXpandCommand,
} from 'react-native-star-io10';
import { RNEventSource } from 'rn-eventsource-reborn';

import { CollapsibleSection } from './components/CollapsibleSection';
import { OrdersListItem } from './components/OrdersListItem';
import { Section } from './components/Section';
import { SettingsForm } from './components/SettingsForm';
import { Spacer } from './components/Spacer';
import { NUM_ORDERS } from './constants';
import { Order } from './interfaces/order';
import { AppSettings } from './interfaces/settings';

interface AppState {
    settings: AppSettings;
    orders: Order[];
    newOrderEventSource?: RNEventSource;
    newOrderEventSourceError: boolean;
}

export default class App extends React.Component<Record<string, never>, AppState> {
    state: AppState = {
        settings: {
            interfaceType: InterfaceType.Lan,
            identifier: '',
            url: '',
            token: '',
        },
        orders: [],
        newOrderEventSource: undefined,
        newOrderEventSourceError: false,
    };

    async componentDidMount() {
        activateKeepAwake();
        await this.loadSettings();
    }

    private async markOrderAsCompleted(order: Order) {
        const { url, token } = this.state.settings;
        try {
            const response = await fetch(
                `${url}/api/order-receiver-app/orders/complete/${order.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!response.ok) throw await response.json();
            order.completed = await response.json();
            this.setState({ orders: this.state.orders });
        } catch (error) {
            Alert.alert('Could not mark order as completed', error.toString());
        }
    }

    private updateNewOrderEventSource(settings: AppSettings) {
        this.state.newOrderEventSource?.close();

        const { url, token } = settings;

        const source = new RNEventSource(
            `${url}/api/order-receiver-app/order-stream?limit=${NUM_ORDERS}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );

        source.addEventListener('message', async (event) => {
            try {
                const { data: orderId } = event as Event & { data?: string };
                if (!orderId || orderId === '') return;
                const response = await fetch(`${url}/api/order-receiver-app/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw await response.json();
                const order = await response.json();
                this.setState({
                    orders: [
                        order,
                        ...this.state.orders.filter((o, i) => !(o.completed && i >= NUM_ORDERS)),
                    ],
                });
            } catch (error) {
                Alert.alert('Could not load new order', error.toString());
            }
        });

        source.addEventListener('error', () => {
            this.setState({ newOrderEventSourceError: true });
        });

        this.setState({ orders: [], newOrderEventSource: source, newOrderEventSourceError: false });
    }

    private async loadSettings() {
        try {
            const settings = JSON.parse((await AsyncStorage.getItem('settings')) ?? '{}');
            if (
                typeof settings.identifier === 'string' &&
                typeof settings.url === 'string' &&
                typeof settings.token === 'string' &&
                settings.interfaceType in InterfaceType
            ) {
                this.setState({ settings });
                this.updateNewOrderEventSource(settings);
            } else {
                this.setState({ newOrderEventSourceError: true });
            }
        } catch (error) {
            Alert.alert('Could not load settings', error.toString());
        }
    }

    private async updateSettings(partialSettings: Partial<App['state']['settings']>) {
        try {
            const settings = { ...this.state.settings, ...partialSettings };
            this.updateNewOrderEventSource(settings);
            this.setState({ settings });
            await AsyncStorage.setItem('settings', JSON.stringify(settings));
        } catch (error) {
            Alert.alert('Could not update settings', error.toString());
        }
    }

    private async printOrder(order: Order) {
        const printerSettings = new StarConnectionSettings();
        printerSettings.interfaceType = this.state.settings.interfaceType;
        printerSettings.identifier = this.state.settings.identifier;
        const printer = new StarPrinter(printerSettings);

        try {
            const builder = new StarXpandCommand.StarXpandCommandBuilder().addDocument(
                new StarXpandCommand.DocumentBuilder().addPrinter(
                    new StarXpandCommand.PrinterBuilder()
                        .styleInternationalCharacter(
                            StarXpandCommand.Printer.InternationalCharacterType.Usa,
                        )
                        .styleCharacterSpace(0)
                        .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                        .styleBold(true)
                        .actionPrintText(`Order #${order.id}\n`)
                        .actionPrintText(
                            `Contact Phone Number: ${parsePhoneNumber(
                                order.contactPhoneNumber,
                            )?.formatInternational()}\n\n`,
                        )
                        .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
                        .actionPrintText('Products:\n')
                        .styleBold(false)
                        .actionPrintText(
                            order.products
                                .map((p) => `${p.title}\n${p.extras.map((e) => `\t${e.title}\n`)}`)
                                .join('\n'),
                        )
                        .actionPrintText('\n')
                        .styleAlignment(StarXpandCommand.Printer.Alignment.Right)
                        .actionPrintText(new Date().toLocaleString())
                        .actionCut(StarXpandCommand.Printer.CutType.Partial),
                ),
            );
            const commands = await builder.getCommands();
            await printer.open();
            await printer.print(commands);
        } catch (error) {
            if (error instanceof StarIO10Error) {
                Alert.alert('Could not print', error.message);
            }
        } finally {
            await printer.close();
            await printer.dispose();
        }
    }

    render() {
        return (
            <>
                <SafeAreaView style={{ margin: 50 }}>
                    <StatusBar />

                    <View style={{ flexDirection: 'column', height: '100%' }}>
                        <CollapsibleSection
                            title={<Text style={{ fontWeight: 'bold' }}>Settings</Text>}
                        >
                            <SettingsForm
                                initialValues={this.state.settings}
                                onSubmit={this.updateSettings.bind(this)}
                            />
                            <Spacer size={30} />
                        </CollapsibleSection>

                        <Section style={{ flex: 1 }}>
                            {this.state.orders.length < NUM_ORDERS && (
                                <Text>Fetching old orders...</Text>
                            )}
                            <FlatList
                                data={this.state.orders}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item: order }) => (
                                    <OrdersListItem
                                        order={order}
                                        onPrint={this.printOrder.bind(this)}
                                        onMarkAsCompleted={this.markOrderAsCompleted.bind(this)}
                                    />
                                )}
                            />
                        </Section>
                    </View>
                </SafeAreaView>
                <View style={{ position: 'absolute', top: 5, left: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                        Connection Status:{' '}
                        {this.state.newOrderEventSourceError === undefined
                            ? '...'
                            : this.state.newOrderEventSourceError
                            ? 'Disconnected'
                            : 'Connected'}
                    </Text>
                    {this.state.newOrderEventSourceError && (
                        <TouchableHighlight
                            onPress={() => this.updateNewOrderEventSource(this.state.settings)}
                            underlayColor="white"
                        >
                            <Text style={{ textAlign: 'center' }}>Retry</Text>
                        </TouchableHighlight>
                    )}
                </View>
            </>
        );
    }
}
