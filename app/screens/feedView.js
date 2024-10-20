import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useRoute} from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';

const FeedScreen = () => {
    const route = useRoute();
    const { feedData } = route.params;
    console.log(feedData);
    console.log(feedData.response);
    const feeds = feedData.response.entries;
    const navigation = useNavigation();
    return (
        <ScrollView>
            {feeds.map((item, index) => {
                console.log('Item params:', item);

                return (
                    <View key={index}>
                        <TouchableOpacity onPress={() => navigation.navigate('FeedPage', {
                            description: item.description,
                            title: item.title,
                            link: item.link,
                        })}>
                            <Text>{item.title}</Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export default FeedScreen;