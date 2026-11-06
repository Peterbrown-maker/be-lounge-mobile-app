import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Let the user pick a square photo from their library and copy it into the app's
 * document directory, so it survives cache clears. Returns the saved file URI,
 * or null if the user cancelled / denied permission.
 */
export async function pickAndSaveProfilePhoto(uid: string): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.length) return null;

  const picked = result.assets[0].uri;
  const dir = FileSystem.documentDirectory;
  if (!dir) return picked; // web: keep the picker URI

  // New filename each time so <Image> doesn't show a cached old picture.
  const ext = picked.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${dir}profile-${uid}-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: picked, to: dest });
  return dest;
}

/** Best-effort removal of a previously saved photo file. */
export async function deleteProfilePhotoFile(uri: string | null | undefined) {
  if (!uri || !FileSystem.documentDirectory || !uri.startsWith(FileSystem.documentDirectory)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}
