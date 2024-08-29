import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useRoute} from "@react-navigation/native";

export default function FeedPage({ route }) {
    const { description } = route.params;

    return (
        <View>
            <Text>{description}</Text>
        </View>
    );

}