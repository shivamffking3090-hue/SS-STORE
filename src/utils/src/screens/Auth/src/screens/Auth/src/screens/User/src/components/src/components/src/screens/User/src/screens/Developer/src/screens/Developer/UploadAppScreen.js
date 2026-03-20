// src/screens/Developer/UploadAppScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UploadAppScreen = ({ navigation }) => {
  const [appData, setAppData] = useState({
    name: '',
    packageName: '',
    version: '1.0.0',
    category: '',
    description: '',
    size: '',
    icon: null,
    screenshots: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    'Games', 'Social', 'Productivity', 'Entertainment', 
    'Education', 'Music', 'Photography', 'Shopping'
  ];

  const selectIcon = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        setAppData({ ...appData, icon: response.assets[0] });
      }
    });
  };

  const selectScreenshots = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 5,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        setAppData({ ...appData, screenshots: [...appData.screenshots, ...response.assets] });
      }
    });
  };

  const uploadFile = async (file, path) => {
    const reference = storage().ref(path);
    const task = reference.putFile(file.uri);

    return new Promise((resolve, reject) => {
      task.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await reference.getDownloadURL();
          resolve(url);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!appData.name || !appData.packageName || !appData.category || !appData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      let iconUrl = null;
      let screenshotUrls = [];

      // Upload icon
      if (appData.icon) {
        const iconPath = `apps/${user.uid}/${Date.now()}_icon.jpg`;
        iconUrl = await uploadFile(appData.icon, iconPath);
      }

      // Upload screenshots
      for (const screenshot of appData.screenshots) {
        const screenshotPath = `apps/${user.uid}/${Date.now()}_screenshot.jpg`;
        const url = await uploadFile(screenshot, screenshotPath);
        screenshotUrls.push(url);
      }

      // Save app data to Firestore
      await firestore().collection('apps').add({
        ...appData,
        icon: iconUrl,
        screenshots: screenshotUrls,
        developerId: user.uid,
        developerName: user.displayName || 'Unknown Developer',
        status: 'pending',
        downloads: 0,
        rating: 0,
        featured: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert(
        'Success', 
        'App uploaded successfully! It will be reviewed by admin.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload app: ' + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TouchableOpacity style={styles.iconSelector} onPress={selectIcon}>
          {appData.icon ? (
            <Image source={{ uri: appData.icon.uri }} style={styles.selectedIcon} />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Icon name="add-photo-alternate" size={40} color="#999" />
              <Text style={styles.iconPlaceholderText}>Add App Icon</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="App Name *"
          value={appData.name}
          onChangeText={(text) => setAppData({ ...appData, name: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Package Name * (e.g., com.example.app)"
          value={appData.packageName}
          onChangeText={(text) => setAppData({ ...appData, packageName: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Version"
          value={appData.version}
          onChangeText={(text) => setAppData({ ...appData, version: text })}
        />

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  appData.category === category && styles.categoryChipActive
                ]}
                onPress={() => setAppData({ ...appData, category })}
              >
                <Text style={[
                  styles.categoryChipText,
                  appData.category === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={appData.description}
          onChangeText={(text) => setAppData({ ...appData, description: text }}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Size (e.g., 25 MB)"
          value={appData.size}
          onChangeText={(text) => setAppData({ ...appData, size: text })}
        />

        <TouchableOpacity style={styles.screenshotButton} onPress={selectScreenshots}>
          <Icon name="add-a-photo" size={24} color="#4CAF50" />
          <Text style={styles.screenshotButtonText}>Add Screenshots (Max 5)</Text>
        </TouchableOpacity>

        {appData.screenshots.length > 0 && (
          <ScrollView horizontal style={styles.screenshotPreview}>
            {appData.screenshots.map((screenshot, index) => (
              <Image
                key={index}
                source={{ uri: screenshot.uri }}
                style={styles.previewImage}
              />
            ))}
          </ScrollView>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  iconSelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  iconPlaceholderText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  screenshotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  screenshotButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 10,
  },
  screenshotPreview: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  progressContainer: {
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UploadAppScreen;
