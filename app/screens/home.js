import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function HomeScreen() {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserId(user.uid);
        }
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <View style={styles.container}>
            <Text>Welcome to Home Screen!</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
            <Text>Your user id is {userId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
