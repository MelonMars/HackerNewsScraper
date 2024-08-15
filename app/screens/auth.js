import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {auth,googleProvider} from "../firebase";


export function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        if (email && password) {
            try {
                await signInWithEmailAndPassword(
                    auth, email, password
                );
            } catch (e) {
                console.log("handleSubmit error: ", e.message);
                Alert.alert("Wrong username or password! Or possibly you used something else to log in with?")
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
            <Text>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text>Go to Signup</Text>
        </TouchableOpacity>
    </View>)
}

export function SignupScreen({navigation}) {
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
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text>Go to Login</Text>
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