import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Button,
    Modal,
    ScrollView,
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
import {useNavigation} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DraxProvider, DraxView} from 'react-native-drax';

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
    const [folders, setFolders] = useState([]);
    const [dataFeeds, setDataFeeds] = useState([]);
    const navigation = useNavigation();
    const [draggables, setDraggables] = useState(feeds.map(feed => feed));
    const [receptacles, setReceptacles] = useState(folders.map((folder, index) => ({ id: index + 1, items: [] })));
    const [draggingItem, setDraggingItem] = useState(null);
    const [expandedFolders, setExpandedFolders] = React.useState({});

    const toggleFolderExpansion = (id) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (user) setUserId(user.uid);
    }, []);

    useEffect(() => {
        if (userId === null) return;
        fetchFeedsAndFolders();
    }, [userId]);

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
        setInputPrompt(prompt);
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

    const fetchFeedsAndFolders = async () => {
        setLoading(true);
        try {
            console.log("Getting data snap");
            console.log("DB:", db);
            console.log("User ID:", userId);
            const dataSnapshot = await getDoc(doc(db, 'userData', userId));
            console.log("Got Data Snap!");
            const feedsData = dataSnapshot.exists() ? dataSnapshot.data().feeds : {};
            setDataFeeds(feedsData);

            console.log("Feed Data", feedsData);
            const feedItems = Object.keys(feedsData).filter(key =>
                Array.isArray(feedsData[key]) && feedsData[key][0]?.type === 'feed'
            );
            const folderItems = Object.keys(feedsData).filter(key =>
                typeof feedsData[key] === 'object' && 'feeds' in feedsData[key]
            );

            setFeeds(feedItems.sort());
            setFolders(folderItems);
        } catch (error) {
            console.error("Error fetching feeds: ", error);
        } finally {
            setLoading(false);
            console.log("Folders:", folders);
            console.log("Feeds:", feeds);
        }
    };


    const addFeed = async () => {
        setLoading(true);
        try {
            const feedTitle = await showInputModal("Enter feed name:");
            let feedUrl = await showInputModal("Enter feed url:");
            feedUrl = feedUrl.replace(" ", "");

            const response = await fetch("http://192.168.56.1:8000/checkFeed/?feedUrl=" + feedUrl);
            const feed = await response.json();

            if (feed.response === "BOZO") {
                const response = await fetch("http://192.168.56.1:8000/makeFeed/?feedUrl=" + feedUrl);
                const feed2 = await response.json();
                if (feed2.response === "BOZO") {
                    alert("INVALID FEED URL");
                } else {
                    const validFeedUrl = feed.response;
                    const dataSnapshot = await getDoc(doc(db, 'userData', userId));
                    const updates = {};
                    updates[`feeds.${feedTitle}`] = [{ feed: validFeedUrl, type: "feed"}];
                    await updateDoc(dataSnapshot.ref, updates);
                    await fetchFeedsAndFolders();
                }
            } else {
                const validFeedUrl = feed.response;
                const dataSnapshot = await getDoc(doc(db, 'userData', userId));
                const updates = {};
                updates[`feeds.${feedTitle}`] = [{ feed: validFeedUrl, type: "feed"}];
                await updateDoc(dataSnapshot.ref, updates);
                await fetchFeedsAndFolders();
            }
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const addFolder = async () => {
        setLoading(true);
        try {
            const folderName = await showInputModal("Enter folder name:");
            const dataSnapshot = await getDoc(doc(db, 'userData', userId));
            const updates = {};
            updates[`feeds.${folderName}`] = [{ feeds: {}, type: "folder" }];
            await updateDoc(dataSnapshot.ref, updates);
            await fetchFeedsAndFolders();
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    const fetchFeed = async (url) => {
        try {
            const response = await fetch("http://192.168.56.1:8000/feed?feed=" + url);
            console.log(url)
            const feedData = await response.json();
            navigation.navigate('Feed', {feedData});
            console.log(feedData);
        } catch (e) {
            alert("Unable to fetch (in fetchFeed): " + e);
        }
    }

    const handleDrop = async (draggedItem, folder) => {
        console.log("Got drop!");
        try {
            const dataSnapshot = await getDoc(doc(db, 'userData', userId));
            const updates = {};

            if (dataFeeds[folder][0].type === 'folder') {
                console.log("Dragged Snap:",dataSnapshot.data().feeds[draggedItem][0]);
                console.log("Data Snap:",dataSnapshot);
                updates[`feeds.${folder}.feeds.${draggedItem}`] = dataSnapshot.data().feeds[draggedItem][0];
                await updateDoc(dataSnapshot.ref, updates);
                await fetchFeedsAndFolders();
                alert(`Moved ${draggedItem} to ${folder}`);

                setDraggables(prevDraggables => prevDraggables.filter(item => item !== draggedItem));

                setReceptacles(prevReceptacles =>
                    prevReceptacles.map(receptacle => {
                        if (receptacle.id === folder) {
                            return { ...receptacle, items: [...receptacle.items, draggedItem] };
                        }
                        return receptacle;
                    })
                );
            }
        } catch (error) {
            console.error("Error moving feed to folder: ", error);
        }
    };

    useEffect(() => {
        const uniqueDraggables = Array.from(new Set(draggables));

        if (uniqueDraggables.length !== draggables.length ||
            !uniqueDraggables.every((item, index) => item === draggables[index])) {
            setDraggables(uniqueDraggables);
        }
    }, [draggables]);


    const handleDragEnd = (payload) => {
        if (!receptacles.some(receptacle => receptacle.items.includes(payload))) {
            setDraggables((prevDraggables) => [...prevDraggables, payload]);
        }
    };

    const renderFeedItem = ({ item, index }) => (
        <DraxView
            longPressDelay={250}
            key={item}
            style={styles.draggable}
            onDragEnd={() => {
                console.log("Item dragged:", item.dragged);

                handleDragEnd(item);
                console.log("Draggables:", draggables);
            }}
            payload={item}
            onDragStart={() => item.dragged = false}
            onDragOver={event => {
                console.log('start drag');
                if (event.dragTranslation.x || event.dragTranslation.y) {
                    item.dragged = true;
                }
            }}>
            <TouchableOpacity
            onPress={async () => {
                console.log("Pressed:", dataFeeds[item][0].feed);
                await fetchFeed(dataFeeds[item][0].feed);
            }}>
                <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
        </DraxView>
    );

    useEffect(() => {
        setDraggables(feeds.map(feed => feed));
        setReceptacles(folders.map((folder, index) => ({ id: folder, items: [] })));
    }, [feeds, folders]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <DraxProvider>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text>Welcome to Home Screen!</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text>Logout</Text>
                    </TouchableOpacity>
                    <Text>Your user id is {userId}</Text>
                    <TouchableOpacity onPress={handleAddItem} ref={addButtonRef}>
                        <Text>+</Text>
                    </TouchableOpacity>

                    <View style={styles.draggablesContainer}>
                        {draggables.map((item, index) => (
                            renderFeedItem({ item, index })
                        ))}
                    </View>

                    <View style={styles.receptaclesContainer}>
                        {receptacles.map((receptacle) => (
                            <DraxView
                                key={receptacle.id}
                                style={styles.receptacle}
                                onReceiveDragDrop={({ dragged: { payload } }) => {
                                    console.log(`Item "${payload}" dropped into Receptacle ${receptacle.id}`);
                                    handleDrop(payload, receptacle.id);
                                }}
                            >
                                <Text style={styles.text}>Receptacle {receptacle.id}</Text>
                                {receptacle.items.map((item, index) => (
                                    <Text key={index} style={styles.receptacleItem}>
                                        {item}
                                    </Text>
                                ))}
                            </DraxView>
                        ))}
                    </View>
                </ScrollView>
            </DraxProvider>

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
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    folderItem: {
        padding: 10,
        backgroundColor: 'lightgray',
        marginVertical: 5,
        borderRadius: 5,
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
        borderRadius: 5,
    },
    folder: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 5,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    hidden: {
        opacity: 0,
    },
    text: {
        color: 'white',
        fontSize: 16,},
    folderContainer: {
        width: '100%',
        marginVertical: 5,
    },
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
    },
    draggablesContainer: {
        flexDirection: 'column',  // Arrange items in a column
        justifyContent: 'flex-start',
        marginBottom: 20,
        width: '100%',
    },
    draggable: {
        width: '100%',  // Full width for row-like appearance
        height: 50,  // Adjust height for a row-like appearance
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'flex-start',  // Align text to the start (left)
        marginVertical: 5,  // Adjust margin for better spacing
        paddingHorizontal: 10,  // Add padding for text
    },
    receptaclesContainer: {
        flexDirection: 'column',  // Arrange items in a column
        justifyContent: 'flex-start',
        marginTop: 20,
        width: '100%',
    },
    receptacle: {
        width: '100%',  // Full width for row-like appearance
        height: 'auto',  // Auto height to fit content
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'flex-start',  // Align text to the start (left)
        marginVertical: 5,  // Adjust margin for better spacing
        padding: 10,  // Add padding for text
    },
    receptacleItem: {
        color: 'yellow',
        fontSize: 14,  // Slightly larger font for readability
        marginVertical: 2,  // Spacing between items within a folder
    },
});

