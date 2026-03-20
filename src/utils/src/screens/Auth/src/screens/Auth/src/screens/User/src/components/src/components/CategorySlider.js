// src/components/CategorySlider.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const categories = [
  { id: 1, name: 'Games', icon: 'sports-esports', color: '#FF6B6B' },
  { id: 2, name: 'Social', icon: 'people', color: '#4ECDC4' },
  { id: 3, name: 'Productivity', icon: 'work', color: '#45B7D1' },
  { id: 4, name: 'Entertainment', icon: 'movie', color: '#96CEB4' },
  { id: 5, name: 'Education', icon: 'school', color: '#FFEAA7' },
  { id: 6, name: 'Music', icon: 'music-note', color: '#D4A5A5' },
  { id: 7, name: 'Photography', icon: 'camera-alt', color: '#9B59B6' },
  { id: 8, name: 'Shopping', icon: 'shopping-cart', color: '#3498DB' },
];

const CategorySlider = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem}>
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Icon name={category.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
});

export default CategorySlider;
