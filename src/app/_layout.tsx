import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export default function RootLayout() {
  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        // RevenueCat debug logs
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        // RevenueCat is only configured on iOS / Android
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Purchases.configure({
            apiKey: "test_TDlUDxgcNbjSySbRSRqvwAkuXPi",
          });

          console.log("RevenueCat configured successfully!");
        }
      } catch (error) {
        console.log("RevenueCat configuration error:", error);
      }
    };

    setupRevenueCat();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="mystery" />
      <Stack.Screen name="journey" />
      <Stack.Screen name="reveal" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}