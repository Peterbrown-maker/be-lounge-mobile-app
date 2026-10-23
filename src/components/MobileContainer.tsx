import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MobileContainerProps {
  children: ReactNode;
}

export const MobileContainer = ({ children }: MobileContainerProps) => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};
