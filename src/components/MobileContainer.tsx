import { ReactNode, useEffect, useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MobileContainerProps {
  children: ReactNode;
  /** Colour behind the status bar / home indicator. */
  background?: string;
}

// Android only scrolls the text line into view, not the box drawn around it, so
// leave room for the rest of the field above the keyboard.
const KEYBOARD_GAP = 24;

/**
 * With edge-to-edge on, Android no longer resizes the app when the keyboard
 * opens, so it covers whatever is underneath. Shrinking the root here fixes
 * every screen: ScrollViews get shorter and Android scrolls the focused input
 * into view. iOS is left to each screen's KeyboardAvoidingView.
 */
const useAndroidKeyboardHeight = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
};

export const MobileContainer = ({ children, background = "#FFFFFF" }: MobileContainerProps) => {
  // Reported height excludes the navigation bar, which the bottom edge below already pads for.
  const keyboardHeight = useAndroidKeyboardHeight();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: background }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1, paddingBottom: keyboardHeight > 0 ? keyboardHeight + KEYBOARD_GAP : 0 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};
