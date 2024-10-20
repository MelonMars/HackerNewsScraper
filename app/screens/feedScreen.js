import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Alert,
    Dimensions,
    ScrollView,
    Button,
    ActivityIndicator
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import * as WebBrowser from 'expo-web-browser'
import RenderHtml from 'react-native-render-html';

export default function FeedPage({ route }) {
    const { description, title, link } = route.params;
    const { width } = Dimensions.get('window');
    const [isReaderMode, setIsReaderMode] = useState(false);
    const [readerContent, setReaderContent] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const sleep = async (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout))
    }

    const openLink = async () => {
        try {
            if (await InAppBrowser.isAvailable()) {
                //From: https://github.com/proyecto26/react-native-inappbrowser
                const result = await InAppBrowser.open(link, {
                    // iOS Properties
                    dismissButtonStyle: 'cancel',
                    preferredBarTintColor: '#453AA4',
                    preferredControlTintColor: 'white',
                    readerMode: false,
                    animated: true,
                    modalPresentationStyle: 'fullScreen',
                    modalTransitionStyle: 'coverVertical',
                    modalEnabled: true,
                    enableBarCollapsing: false,
                    // Android Properties
                    showTitle: true,
                    toolbarColor: '#6200EE',
                    secondaryToolbarColor: 'black',
                    navigationBarColor: 'black',
                    navigationBarDividerColor: 'white',
                    enableUrlBarHiding: true,
                    enableDefaultShare: true,
                    forceCloseOnRedirection: false,
                    // Specify full animation resource identifier(package:anim/name)
                    // or only resource name(in case of animation bundled with app).
                    animations: {
                        startEnter: 'slide_in_right',
                        startExit: 'slide_out_left',
                        endEnter: 'slide_in_left',
                        endExit: 'slide_out_right'
                    },
                    headers: {
                        'my-custom-header': 'my custom header value'
                    }
                })
                await sleep(800);
                Alert.alert(JSON.stringify(result))
            } else Linking.openURL(link);
        } catch (error) {
            console.error(error);
            WebBrowser.openBrowserAsync(link, {showTitle: true})
        }
    };

    const makeSummary = async () => {
        setLoading(true); // Start loading
        try {
            const response = await fetch('http://192.168.56.1:8000/getSummary/?link=' + link);
            const summData = await response.json();
            if (summData.result === "ERROR") {
                setSummary("Couldn't make summary!");
            } else {
                console.log(summData);
                setSummary(summData.result);
            }
        } catch (error) {
            setSummary("Couldn't make summary!");
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const toggleReaderMode = async () => {
        if (!isReaderMode) {
            try {
                const response = await fetch(link);
                const html = await response.text();
                setReaderContent(html);
            } catch (error) {
                console.error('Error fetching HTML:', error);
            }
        }
        setIsReaderMode(!isReaderMode);
    };

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={openLink}>
                <Text>{title}</Text>
            </TouchableOpacity>
            <ScrollView>
                <RenderHtml
                    contentWidth={width}
                    source={{ html: isReaderMode && readerContent ? readerContent : description }}
                />
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />
                ) : (
                    summary && (
                        <View style={{ marginTop: 10 }}>
                            <Text>{summary}</Text>
                        </View>
                    )
                )}
            </ScrollView>
            <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#f8f8f8', padding: 10 }}>
                <Button title="Toggle Reader Mode" onPress={toggleReaderMode} />
                <Button title="Summary" onPress={makeSummary} />
            </View>
        </View>
    );
};

