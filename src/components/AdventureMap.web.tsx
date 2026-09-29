import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
};

export default function AdventureMap({
  latitude,
  longitude,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="map-outline"
        size={36}
        color="#171717"
      />

      <Text style={styles.title}>
        MAP PREVIEW
      </Text>

      <Text style={styles.subtitle}>
        Live map is available on mobile.
      </Text>

      <Text style={styles.coordinates}>
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EFE8",
  },

  title: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#171717",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#777777",
  },

  coordinates: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#171717",
  },
});