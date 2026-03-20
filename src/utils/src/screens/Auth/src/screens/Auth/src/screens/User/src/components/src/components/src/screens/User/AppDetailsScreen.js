// src/screens/User/AppDetailsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const AppDetailsScreen = ({ route, navigation }) => {
  const { app } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download
      setTimeout(async () => {
        // Update download count
        await firestore().collection('apps').doc(app.id).update({
          downloads: (app.downloads || 0) + 1,
        });

        // Update user download history
        const user = auth().currentUser;
        if (user) {
          await firestore().collection('users').doc(user.uid).update({
            downloads: firestore.FieldValue.increment(1),
          });
        }

        Alert.alert('Success', 'App downloaded successfully!');
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to download app');
      setIsDownloading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: app.icon || 'https://via.placeholder.com/120' }}
          style={styles.appIcon}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.appName}>{app.name}</Text>
          <Text style={styles.developer}>{app.developerName}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{app.rating || '4.5'}</Text>
            <Text style={styles.downloads}>{app.downloads || 0}+ downloads</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.installButton, isDownloading && styles.downloadingButton]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        <Text style={styles.installButtonText}>
          {isDownloading ? 'DOWNLOADING...' : 'INSTALL'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this app</Text>
        <Text style={styles.description}>{app.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screenshots</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {app.screenshots && app.screenshots.map((screenshot, index) => (
            <Image
              key={index}
              source={{ uri: screenshot }}
              style={styles.screenshot}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Updated on</Text>
          <Text style={styles.infoValue}>
            {app.updatedAt ? new Date(app.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{app.version || '1.0.0'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category</Text>
          <Text style={styles.infoValue}>{app.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Size</Text>
          <Text style={styles.infoValue}>{app.size || 'Varies with device'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Package Name</Text>
          <Text style={styles.infoValue}>{app.packageName}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  developer: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rating: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
    marginRight: 15,
  },
  downloads: {
    fontSize: 14,
    color: '#999',
  },
  installButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadingButton: {
    backgroundColor: '#ff9800',
  },
  installButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  screenshot: {
    width: width * 0.7,
    height: width * 1.2,
    borderRadius: 10,
    marginRight: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default AppDetailsScreen;
