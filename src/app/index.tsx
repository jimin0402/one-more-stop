import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>ONE MORE STOP</Text>

        <View style={styles.hero}>
          <Text style={styles.title}>Good afternoon!</Text>
          <Text style={styles.subtitle}>
            Ready to go somewhere unexpected?
          </Text>
        </View>

        <View style={styles.exploreCard}>
          <Text style={styles.city}>PERTH</Text>
          <Text style={styles.percent}>12%</Text>
          <Text style={styles.explored}>EXPLORED</Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.mapPlaceholder}>
            <Ionicons name="location" size={24} color="#171717" />
            <Text style={styles.mapText}>Explore Perth</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="location" number="8" label="PLACES" />
          <StatCard icon="flash" number="14" label="QUESTS" />
          <StatCard icon="flame" number="3" label="STREAK" />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/setup")}
        >
          <Ionicons name="dice" size={22} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>START ADVENTURE</Text>
        </TouchableOpacity>

        <View style={styles.bottomNav}>
          <NavItem icon="home" label="Home" active />
          <NavItem icon="book-outline" label="Passport" />
          <NavItem icon="person-outline" label="Profile" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  number,
  label,
}: {
  icon: any;
  number: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color="#171717" />
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.navItem}>
      <Ionicons
        name={icon}
        size={24}
        color={active ? "#171717" : "#8A8A8A"}
      />
      <Text style={[styles.navText, active && styles.navTextActive]}>
        {label}
      </Text>
      {active && <View style={styles.activeIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },
  hero: {
    marginTop: 88,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#171717",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#444444",
  },
  exploreCard: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },
  city: {
    fontSize: 14,
    fontWeight: "600",
  },
  percent: {
    marginTop: 8,
    fontSize: 48,
    fontWeight: "800",
  },
  explored: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8E3",
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    width: "12%",
    height: "100%",
    backgroundColor: "#C8FF3D",
  },
  mapPlaceholder: {
    height: 125,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#ECECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    height: 90,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 22,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#171717",
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  bottomNav: {
    marginTop: 18,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    width: 80,
  },
  navText: {
    marginTop: 3,
    fontSize: 12,
    color: "#8A8A8A",
  },
  navTextActive: {
    color: "#171717",
    fontWeight: "700",
  },
  activeIndicator: {
    marginTop: 4,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C8FF3D",
  },
});