import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';

export default function App() {
    const [draggables, setDraggables] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
    const [receptacles, setReceptacles] = useState([
        { id: 1, items: [] },
        { id: 2, items: [] },
        { id: 3, items: [] }
    ]);

    const handleDrop = (payload, receptacleId) => {
        setReceptacles((prevReceptacles) =>
            prevReceptacles.map((receptacle) => {
                if (receptacle.id === receptacleId) {
                    return { ...receptacle, items: [...receptacle.items, payload] };
                }
                return receptacle;
            })
        );
        setDraggables((prevDraggables) => prevDraggables.filter(item => item !== payload));
    };

    const handleDragEnd = (payload) => {
        if (!receptacles.some(receptacle => receptacle.items.includes(payload))) {
            // Remove or reset the duplicate if it was not dropped into a receptacle
            setDraggables((prevDraggables) => [...prevDraggables, payload]);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <DraxProvider>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.draggablesContainer}>
                        {draggables.map((item, index) => (
                            <DraxView
                                key={index}
                                style={styles.draggable}
                                onDragStart={() => {
                                    console.log('start drag');
                                }}
                                onDragEnd={() => handleDragEnd(item)}
                                payload={item}
                            >
                                <Text style={styles.text}>{item}</Text>
                            </DraxView>
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
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    draggablesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    draggable: {
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    receptaclesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    receptacle: {
        width: 120,
        height: 120,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        padding: 5,
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    receptacleItem: {
        color: 'yellow',
        fontSize: 12,
    },
});
