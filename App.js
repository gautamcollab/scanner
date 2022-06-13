import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, Pressable, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker'; 
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [pickedImagePath, setPickedImagePath] = useState('');

  const showImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
  
    if (permissionResult.granted === false) {
      alert("App does not have permission to access Camera roll")
      return;
    }

    console.log(permissionResult); 

    if (!permissionResult.cancelled){
      setPickedImagePath(permissionResult.uri);
      console.log(permissionResult.uri) 
    }
  }

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Please allow  access to the Camera in your settings!</Text>
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (photo) {
    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.cameraContainer} ref={cameraRef}>
      <View>
        <Pressable style={styles.cameraButton} onPress={takePic}>
        <Text style={styles.cameraButton}> TAKE PIC </Text>
        <Button onPress={showImagePicker} title="Select an image"/> 

        <View style={styles.imageContainer}>
          {
            pickedImagePath !== '' && <Image source={{ uri: pickedImagePath }} style={styles.image}
            />
           }
        </View>
        </Pressable> 
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    color: "#f0f8ff", 
    fontSize: 60,
    letterSpacing: 0.50,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  }, 
  imageContainer: {
    padding: 30
  },
});