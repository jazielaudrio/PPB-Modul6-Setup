import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { HumidityScreen } from "./src/screens/HumidityScreen.js"; // Impor layar baru
import { assertConfig } from "./src/services/config.js";

const Tab = createBottomTabNavigator();

enableScreens(true);

// Peta ikon untuk tab
const tabIcons = {
  Monitoring: "analytics",
  Humidity: "water",
  Control: "options",
};

export default function App() {
  useEffect(() => {
    assertConfig();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            headerTitle: "IOTWatch",
            headerTitleAlign: "center",
            headerTintColor: "#1f2937",
            headerStyle: { backgroundColor: "#f8f9fb" },
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            tabBarActiveTintColor: "#2563eb",
            tabBarInactiveTintColor: "#94a3b8",
            tabBarIcon: ({ color, size }) => {
              const iconName = tabIcons[route.name] || "alert-circle";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Monitoring" component={MonitoringScreen} />
          <Tab.Screen name="Humidity" component={HumidityScreen} />
          <Tab.Screen name="Control" component={ControlScreen} />
        </Tab.Navigator>
      </NavigationContainer>  
    </SafeAreaProvider>
  );
}