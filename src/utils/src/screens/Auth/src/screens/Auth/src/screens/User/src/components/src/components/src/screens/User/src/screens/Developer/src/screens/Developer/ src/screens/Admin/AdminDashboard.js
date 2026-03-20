// src/screens/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalApps: 0,
    totalUsers: 0,
    totalDevelopers: 0,
    pendingApps: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecentApps();
  }, []);

  const fetchStats = async () => {
    try {
      const appsSnapshot = await firestore().collection('apps').get();
      const usersSnapshot = await firestore().collection('users').get();
      const pendingAppsSnapshot = await firestore()
        .collection('apps')
        .where('status', '==', 'pending')
        .get();

      const developers = usersSnapshot.docs.filter(
        doc => doc.data().role === 'developer'
      ).length;

      setStats({
        totalApps: appsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalDevelopers: developers,
        pendingApps: pendingAppsSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentApps = async () => {
    try {
      const appsSnapshot = await firestore()
        .collection('apps')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecentApps(appsList);
    } catch (error) {
      console.error('Error fetching recent apps:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentApps()]);
    setRefreshing(false);
  };

  const handleAppAction = (appId, action) => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} this app?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.toUpperCase(),
          onPress: () => updateAppStatus(appId, action === 'approve' ? 'approved' : 'rejected'),
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
      fetchRecentApps();
      fetchStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to update app status');
    }
  };

  const renderAppItem = ({ item }) => (
    <View style={styles.appCard}>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDeveloper}>{item.developerName}</Text>
        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'pending' ? '#ff9800' : 
                     item.status === 'approved' ? '#4CAF50' : '#f44336' }
          ]}>
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleAppAction(item.id, 'approve')}
          >
            <Icon name="check" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleAppAction(item.id, 'reject')}
          >
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalApps}</Text>
          <Text style={styles.statLabel}>Total Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDevelopers}</Text>
          <Text style={styles.statLabel}>Developers</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statCard, styles.pendingCard]}
          onPress={() => navigation.navigate('PendingApps')}
        >
          <Text style={styles.statNumber}>{stats.pendingApps}</Text>
          <Text style={styles.statLabel}>Pending Reviews</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent App Submissions</Text>
        <FlatList
          data={recentApps}
          renderItem={renderAppItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No apps submitted yet</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '50%',
    padding: 10,
  },
  pendingCard: {
    width: '100%',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  recentSection: {
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
    flexDirection: 'row',
    alignItems: 'center',
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
  appDeveloper: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});

export default AdminDashboard;
