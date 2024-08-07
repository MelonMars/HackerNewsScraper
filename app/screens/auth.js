import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from "../firebase";

export function LoginScreen() {
    return (
        <View style={styles.container}>
            <Text>Login Screen</Text>
            <StatusBar style="auto" />
        </View>
    );
}

export function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        if (email && password) {
            try {
                await createUserWithEmailAndPassword(
                    auth, email, password
                );
            } catch (e) {
                console.log("handleSubmit error: ", e.message);
            }
        }
    }

    return(<View style={styles.container}>
        <TextInput
            value={email}
            onChangeText={value => setEmail(value)}
            placeholder='Enter email'
        />
        <TextInput
            value={password}
            onChangeText={value => setPassword(value)}
            placeholder='Enter password'
        />
        <TouchableOpacity onPress={handleSubmit}>
            <Text>Sign up</Text>
        </TouchableOpacity>
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});