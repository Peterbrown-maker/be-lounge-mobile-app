import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/auth/AuthContext";
import Index from "./src/pages/Index";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Index />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('main', () => App);
