import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {auth,googleProvider} from "../firebase";
//import { GoogleSignin } from '@react-native-google-signin/google-signin';

/*GoogleSignin.configure({
    webClientId: '99431625311-687254gqjdo95mup6apcasmfaudtatoh.apps.googleusercontent.com',
});
*/


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
            }
        }
    }

    const signInWithGoogle = async () => {
        try {
            /*const { idToken } = await GoogleSignin.signIn();
            const googleCredential = googleProvider.credential(idToken);
            await auth.signInWithCredential(googleCredential);
            */
            console.log("Sign in with google");
        } catch (err){
            console.error(err);
        }
    };

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
        <TouchableOpacity onPress={signInWithGoogle}>
            <Text>Log in with Google</Text>
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