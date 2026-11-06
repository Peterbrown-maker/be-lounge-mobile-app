import { Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';

interface ProfileAvatarProps {
  size?: number;
  /** Corner radius; defaults to a circle. */
  radius?: number;
}

/** The signed-in user's profile picture, falling back to their initial. */
export const ProfileAvatar = ({ size = 40, radius }: ProfileAvatarProps) => {
  const { userProfile } = useAuth();
  const borderRadius = radius ?? size / 2;
  const photo = userProfile?.profile_image;

  if (photo) {
    return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius }} />;
  }

  const initial = (userProfile?.display_name || userProfile?.email || '?').charAt(0).toUpperCase();
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  initial: { color: '#FFFFFF', fontWeight: '700' },
});

export default ProfileAvatar;
