// src/components/AppCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AppCard = ({ app, onPress }) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: app.icon || 'https://via.placeholder.com/80' }}
          style={styles.icon}
        />
        
        <View style={styles.info}>
          <Text style={styles.name}>{app.name}</Text>
          <Text style={styles.developer}>{app.developerName}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{app.rating || '4.5'}</Text>
            <Text style={styles.downloads}>
              {app.downloads || 0} downloads
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.installButton}>
          <Text style={styles.installText}>INSTALL</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  developer: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  downloads: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  installButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  installText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AppCard;
