import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Modal, TextInput, Button,
    TouchableWithoutFeedback, ActivityIndicator, StyleSheet
} from 'react-native';
import {auth, db} from '../firebase'; // Assuming you're importing these from your firebase setup
import { signOut } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

export default function HomeScreen() {
    const [userId, setUserId] = useState(null);
    const [addItemVisible, setAddItemVisible] = useState(false);
    const [addItemPosition, setAddItemPosition] = useState({ top: 0, left: 0 });
    const [inputVisible, setInputVisible] = useState(false);
    const [inputPrompt, setInputPrompt] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const addButtonRef = useRef(null);
    const [inputResolver, setInputResolver] = useState(null);
    const [fetchingFeed, setFetchingFeed] = useState(false);
    
    useEffect(() => {
        const user = auth.currentUser;
        if (user) setUserId(user.uid);
    }, []);

    useEffect(() => {
        console.log("inputVisible updated:", inputVisible);
    }, [inputVisible]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleAddItem = () => {
        addButtonRef.current.measure((fx, fy, width, height, px, py) => {
            setAddItemPosition({ top: py + height, left: px });
        });
        setAddItemVisible(true);
    };

    const handleCloseAddItem = () => {
        setAddItemVisible(false);
    };

    const handleCloseInput = () => {
        setInputVisible(false);
    };

    const showInputModal = (prompt) => {
        setAddItemVisible(false);
        console.log(prompt);
        setInputPrompt(prompt);
        console.log(inputPrompt);
        setInputVisible(true);

        return new Promise((resolve) => {
            setInputResolver(() => resolve);
        });
    };

    const handleInputSubmit = () => {
        if (inputResolver) {
            inputResolver(inputValue);
            setInputValue(''); // Clear input for next use
            setInputVisible(false);
        }
    };

    const addFeed = async () => {
        console.log("ADDFEED");
        setLoading(true);
        try {
            const feedTitle = await showInputModal("Enter feed name:");
            console.log("Feed Title:", feedTitle);

            const feedUrl = await showInputModal("Enter feed url:");
            console.log("Feed URL:", feedUrl);

            const response = await fetch("http://192.168.1.176:8000/checkFeed/?feedUrl=" + feedUrl);
            const feed = await response.json();

            alert(feed.response);
            console.log(feed.response);


            if (feed.response === "BOZO") {
                alert("INVALID FEED URL");
            } else {
                const validFeedUrl = feed.response;
                const dataSnapshot = await getDoc(doc(db, 'userData', userId));
                const updates = {};
                updates[`feeds.${feedTitle}`] = [{feed: validFeedUrl, type: "feed"}];
                await updateDoc(dataSnapshot.ref, updates);
                const data = dataSnapshot.data();
                const feeds = data.feeds;
                console.log(feeds);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Welcome to Home Screen!</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
            <Text>Your user id is {userId}</Text>
            <TouchableOpacity ref={addButtonRef} onPress={handleAddItem}>
                <Text>+</Text>
            </TouchableOpacity>
            <Modal
                visible={addItemVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseAddItem}
            >
                <TouchableWithoutFeedback onPress={handleCloseAddItem}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modal, addItemPosition]}>
                                <Text>Choose an option:</Text>
                                <TouchableOpacity onPress={addFeed}>
                                    <Text>Add Feed</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text>Add Folder</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                visible={inputVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCloseInput}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text>
                            {inputPrompt}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={inputPrompt}
                            value={inputValue}
                            onChangeText={setInputValue}
                            onSubmitEditing={handleInputSubmit}
                        />
                        <Button title="Submit" onPress={handleInputSubmit} />
                    </View>
                </View>
            </Modal>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        position: 'absolute',
        width: 150,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    inputModal: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        width: 200,
        marginVertical: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
});
