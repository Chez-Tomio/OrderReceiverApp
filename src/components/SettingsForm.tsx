import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { InterfaceType } from 'react-native-star-io10';

import { AppSettings } from '../interfaces/settings';
import { Section } from './Section';
import { Spacer } from './Spacer';

export const SettingsForm: React.FC<{
    initialValues: AppSettings;
    onSubmit: (settings: AppSettings) => void;
}> = ({ initialValues, onSubmit }) => (
    <Section>
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => onSubmit(values)}
            enableReinitialize={true}
        >
            {({ handleChange, handleSubmit, values }) => (
                <>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>Interface Type</Text>
                            <View style={{ borderWidth: 2, borderColor: 'grey' }}>
                                <Picker
                                    style={{ height: 50 }}
                                    selectedValue={values.interfaceType}
                                    onValueChange={handleChange('interfaceType')}
                                >
                                    <Picker.Item label="LAN" value={InterfaceType.Lan} />
                                    <Picker.Item
                                        label="Bluetooth"
                                        value={InterfaceType.Bluetooth}
                                    />
                                    <Picker.Item
                                        label="Bluetooth LE"
                                        value={InterfaceType.BluetoothLE}
                                    />
                                    <Picker.Item label="USB" value={InterfaceType.Usb} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>Identifier</Text>
                            <View style={{ borderWidth: 2, borderColor: 'grey' }}>
                                <TextInput
                                    style={{ marginLeft: 5, height: 50 }}
                                    value={values.identifier}
                                    onChangeText={handleChange('identifier')}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>URL</Text>
                            <View style={{ borderWidth: 2, borderColor: 'grey' }}>
                                <TextInput
                                    keyboardType="url"
                                    style={{ marginLeft: 5, height: 50 }}
                                    value={values.url}
                                    onChangeText={handleChange('url')}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>Token</Text>
                            <View style={{ borderWidth: 2, borderColor: 'grey' }}>
                                <TextInput
                                    keyboardType="visible-password"
                                    style={{ marginLeft: 5, height: 50 }}
                                    value={values.token}
                                    onChangeText={handleChange('token')}
                                />
                            </View>
                        </View>
                    </View>
                    <Spacer size={10} />
                    <Button onPress={handleSubmit} title="Save" />
                </>
            )}
        </Formik>
    </Section>
);
