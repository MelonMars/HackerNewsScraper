import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {auth, db} from '../firebase';
import {signOut} from 'firebase/auth';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';

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
    const [feeds, setFeeds] = useState([]);
    const [dataFeeds, setDataFeeds] = useState([]);
    const navigation = useNavigation();
    const [expandedFolders, setExpandedFolders] = useState({});

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
            setInputValue('');
            setInputVisible(false);
        }
    };

    const fetchFeeds = async () => {
        console.log(db);
        console.log(auth.currentUser.uid);
        try {
            const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
            if (dataSnapshot.exists()) {
                console.log("Datasnapshot: ", dataSnapshot.data());
            } else {
                console.log("No such document!");
            }
        } catch (err) {
            console.log("Error in dataSnap: " + err);
        }
        try {
            const dataSnapshot = await getDoc(doc(db, 'userData', auth.currentUser.uid));
            const feedsData = dataSnapshot.exists() ? dataSnapshot.data().feeds : {};
            setDataFeeds(feedsData);
            console.log(feedsData);
            setFeeds(Object.keys(feedsData));
        } catch (error) {
            console.error("Error fetching feeds: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    const addFeed = async () => {
        console.log("ADDFEED");
        setLoading(true);
        try {
            const feedTitle = await showInputModal("Enter feed name:");
            console.log("Feed Title:", feedTitle);

            let feedUrl = await showInputModal("Enter feed url:");
            console.log("Feed URL:", feedUrl);
            feedUrl = feedUrl.replace(" ", "");
            const response = await fetch("http://192.168.56.1:8000/checkFeed/?feedUrl=" + feedUrl);
            const feed = await response.json();

            console.log(feed.response);


            if (feed.response === "BOZO") {
                alert("INVALID FEED URL");
            } else {
                alert("Found feed, adding!");
                const validFeedUrl = feed.response;
                const dataSnapshot = await getDoc(doc(db, 'userData', userId));
                const updates = {};
                updates[`feeds.${feedTitle}`] = [{feed: validFeedUrl, type: "feed"}];
                await updateDoc(dataSnapshot.ref, updates);
                const data = dataSnapshot.data();
                const feeds = data.feeds;
                console.log(feeds);
                await fetchFeeds();
            }
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const addFolder = async () => {
        console.log("ADDFOLDER");
        setLoading(true);
        try {
            const folderName = await showInputModal("Enter folder name:");
            console.log("Folder name:", folderName);

            const dataSnapshot = await getDoc(doc(db, 'userData', userId));
            const updates = {};
            updates[`feeds.${folderName}`] = [{ feeds: {}, type: "folder" }];
            await updateDoc(dataSnapshot.ref, updates);
            alert("Added folder: " + folderName);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    const fetchFeed = async (url) => {
        try {
            const response = await fetch("http://192.168.56.1:8000/feed?feed="+url);
            console.log(url)
            const feedData = await response.json();
            navigation.navigate('Feed', { feedData });
            console.log(feedData);
        } catch (e) {
            alert("Unable to fetch (in createFeedDB): " + e);
        }
    }

    const handleFolderPress = (item) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [item]: !prev[item],
        }));
    };

    const handleDrop = (from, to, data) => {
        console.log('DataFeeds before drop:', dataFeeds);
        console.log(from);
        console.log(to);
        console.log("Data:", data);
        console.log('From item:', dataFeeds[data[from]]);
        console.log('To item:', dataFeeds[data[to]]);
        let newDataFeeds = { ...dataFeeds };

        const fromItem = newDataFeeds[data[from]];
        const toItem = newDataFeeds[data[to]];

        if (toItem && toItem.feeds) {
            toItem.feeds.push(fromItem);
        }

        delete newDataFeeds[data[from]];

        setDataFeeds(newDataFeeds);
        console.log("new data feeds: ", newDataFeeds);
        console.log("DataFeeds after drop:", dataFeeds);
    };


    const FeedItem = ({ item, drag, isActive }) => (
        <TouchableOpacity
            onLongPress={drag}
            onPress={() => {
                if ('feed' in dataFeeds[item][0]) {
                    fetchFeed(dataFeeds[item][0].feed);
                } else if ('feeds' in dataFeeds[item][0]) {
                    handleFolderPress(item);
                }
            }}
            style={{
                backgroundColor: isActive ? 'lightgray' : 'white',
                padding: 10,
            }}
        >
            <Text>{item}</Text>
            {/* Render feeds */}
            {expandedFolders[item] &&
                dataFeeds[item][0].feeds.map((feed, index) => (
                    <Text key={index} style={{ paddingLeft: 20 }}>
                        {feed}
                    </Text>
                ))}
        </TouchableOpacity>
    );

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
            <DraggableFlatList
                data={Object.keys(dataFeeds)}
                renderItem={({ item, drag, isActive }) => (
                    <FeedItem item={item} drag={drag} isActive={isActive} />
                )}
                keyExtractor={(item) => item}
                onDragEnd={({ data, from, to }) => handleDrop(from, to, data)}
            />

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
                                <TouchableOpacity onPress={addFolder}>
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
