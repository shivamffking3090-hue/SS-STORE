// src/screens/Admin/PendingAppsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PendingAppsScreen = () => {
  const [pendingApps, setPendingApps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingApps();
  }, []);

  const fetchPendingApps = async () => {
    try {
      const appsSnapshot = await firestore()
        .collection('apps')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPendingApps(appsList);
    } catch (error) {
      console.error('Error fetching pending apps:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingApps();
    setRefreshing(false);
  };

  const handleReview = (appId, status) => {
    Alert.alert(
      `Confirm ${status}`,
      `Are you sure you want to ${status} this app?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status.toUpperCase(),
          onPress: () => updateAppStatus(appId, status === 'approve' ? 'approved' : 'rejected'),
        },
      ]
    );
  };

  const updateAppStatus = async (appId, status) => {
    try {
      await firestore().collection('apps').doc(appId).update({
        status,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', `App ${status} successfully!`);
      fetchPendingApps();
    } catch (error) {
      Alert.alert('Error', 'Failed to update app status');
    }
  };

  const renderAppItem = ({ item }) => (
    <View style={styles.appCard}>
      <Image 
        source={{ uri: item.icon || 'https://via.placeholder.com/60' }}
        style={styles.appIcon}
      />
      
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDeveloper}>{item.developerName}</Text>
        <Text style={styles.appPackage}>{item.packageName}</Text>
        <Text style={styles.appCategory}>{item.category}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleReview(item.id, 'approve')}
        >
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReview(item.id, 'reject')}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingApps}
        renderItem={renderAppItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.emptyText}>No pending apps to review</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  appCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  appInfo: {
    flex: 1,
    marginLeft: 15,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appDeveloper: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appPackage: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  appCategory: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default PendingAppsScreen;
