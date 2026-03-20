// src/screens/User/UserDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppCard from '../../components/AppCard';
import CategorySlider from '../../components/CategorySlider';

const UserDashboard = ({ navigation }) => {
  const [apps, setApps] = useState([]);
  const [featuredApps, setFeaturedApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    fetchApps();
    fetchCategories();
  }, []);

  const fetchApps = async () => {
    try {
      const appsSnapshot = await firestore()
        .collection('apps')
        .where('status', '==', 'approved')
        .orderBy('downloads', 'desc')
        .get();
      
      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setApps(appsList);
      setFeaturedApps(appsList.filter(app => app.featured).slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await firestore().collection('categories').get();
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApps();
    await fetchCategories();
    setRefreshing(false);
  };

  const filteredApps = apps.filter(app =>
    app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [150, 80],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <CategorySlider categories={categories} />

        {featuredApps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Apps</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredApps.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('AppDetails', { app })}
                >
                  <Image 
                    source={{ uri: app.icon || 'https://via.placeholder.com/100' }}
                    style={styles.featuredIcon}
                  />
                  <Text style={styles.featuredName}>{app.name}</Text>
                  <Text style={styles.featuredCategory}>{app.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Apps</Text>
          {filteredApps.map(app => (
            <AppCard key={app.id} app={app} onPress={() => navigation.navigate('AppDetails', { app })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuredIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginBottom: 10,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  featuredCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default UserDashboard;
