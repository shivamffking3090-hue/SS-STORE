// src/screens/Developer/DeveloperDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeveloperDashboard = ({ navigation }) => {
  const [myApps, setMyApps] = useState([]);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalDownloads: 0,
    approvedApps: 0,
    pendingApps: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyApps();
  }, []);

  const fetchMyApps = async () => {
    try {
      const user = auth().currentUser;
      const appsSnapshot = await firestore()
        .collection('apps')
        .where('developerId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMyApps(appsList);

      // Calculate stats
      const totalDownloads = appsList.reduce((sum, app) => sum + (app.downloads || 0), 0);
      const approvedApps = appsList.filter(app => app.status === 'approved').length;
      const pendingApps = appsList.filter(app => app.status === 'pending').length;

      setStats({
        totalApps: appsList.length,
        totalDownloads,
        approvedApps,
        pendingApps,
      });
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyApps();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#999';
    }
  };

  const renderAppItem = ({ item }) => (
    <TouchableOpacity style={styles.appCard}>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appPackage}>{item.packageName}</Text>
        <View style={styles.appStats}>
          <Text style={styles.appDownloads}>📥 {item.downloads || 0}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalApps}</Text>
          <Text style={styles.statLabel}>Total Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDownloads}</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.approvedApps}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingApps}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('UploadApp')}
      >
        <Icon name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload New App</Text>
      </TouchableOpacity>

      <View style={styles.appsContainer}>
        <Text style={styles.sectionTitle}>My Apps</Text>
        <FlatList
          data={myApps}
          renderItem={renderAppItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="apps" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No apps uploaded yet</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
  },
  statCard: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  appsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appPackage: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  appStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  appDownloads: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default DeveloperDashboard;
