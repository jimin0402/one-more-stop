import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompleteScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    distance?: string;
    time?: string;
    questCompleted?: string;
    xp?: string;
  }>();

  const name =
    params.name ?? "Mystery Destination";

  const distance =
    params.distance ?? "Unknown";

  const time =
    params.time ?? "60 MIN";

  const questCompleted =
    params.questCompleted === "true";

  const totalXP =
    Number(params.xp) ||
    (questCompleted ? 200 : 150);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* LOGO */}

        <Text style={styles.logo}>
          ONE MORE STOP
        </Text>

        {/* SUCCESS */}

        <View style={styles.checkCircle}>
          <Ionicons
            name="checkmark"
            size={46}
            color="#171717"
          />
        </View>

        <Text style={styles.smallTitle}>
          ADVENTURE COMPLETE
        </Text>

        <Text style={styles.title}>
          YOU MADE IT.
        </Text>

        <Text style={styles.subtitle}>
          One more stop. One more story.
        </Text>

        {/* XP */}

        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>
            XP EARNED
          </Text>

          <Text style={styles.xpNumber}>
            +{totalXP} XP
          </Text>
        </View>

        {/* TODAY */}

        <Text style={styles.sectionTitle}>
          TODAY&apos;S ADVENTURE
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              1
            </Text>

            <Text style={styles.statLabel}>
              PLACE
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {distance}
            </Text>

            <Text style={styles.statLabel}>
              DISTANCE
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {time.replace(" MIN", "")}
            </Text>

            <Text style={styles.statLabel}>
              MIN
            </Text>
          </View>
        </View>

        {/* DESTINATION */}

        <View style={styles.placeCard}>
          <View style={styles.placeIcon}>
            <Ionicons
              name="location"
              size={25}
              color="#171717"
            />
          </View>

          <View style={styles.placeContent}>
            <Text style={styles.placeLabel}>
              NEW PLACE DISCOVERED
            </Text>

            <Text style={styles.placeName}>
              {name}
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={25}
            color="#78A800"
          />
        </View>

        {/* SIDE QUEST */}

        <View style={styles.questCard}>
          <View>
            <Text style={styles.questLabel}>
              SIDE QUEST
            </Text>

            <Text style={styles.questStatus}>
              {questCompleted
                ? "Completed"
                : "Not completed"}
            </Text>
          </View>

          <Text style={styles.questXP}>
            {questCompleted
              ? "+50 XP"
              : "0 XP"}
          </Text>
        </View>

        {/* MESSAGE */}

        <View style={styles.messageCard}>
          <Ionicons
            name="sparkles"
            size={23}
            color="#171717"
          />

          <Text style={styles.message}>
            Your city just got a little less
            familiar.
          </Text>
        </View>

        {/* HOME */}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() =>
            router.replace("/")
          }
        >
          <Text style={styles.homeText}>
            BACK TO HOME
          </Text>

          <Ionicons
            name="home-outline"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* ANOTHER */}

        <TouchableOpacity
          style={styles.anotherButton}
          onPress={() =>
            router.replace("/setup")
          }
        >
          <Ionicons
            name="refresh"
            size={18}
            color="#171717"
          />

          <Text style={styles.anotherText}>
            START ANOTHER ADVENTURE
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 45,
    alignItems: "center",
  },

  logo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#171717",
  },

  checkCircle: {
    marginTop: 42,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#C8FF3D",
    alignItems: "center",
    justifyContent: "center",
  },

  smallTitle: {
    marginTop: 23,
    fontSize: 11,
    fontWeight: "900",
    color: "#78A800",
    letterSpacing: 1.4,
  },

  title: {
    marginTop: 7,
    fontSize: 38,
    fontWeight: "900",
    color: "#171717",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: "#777777",
  },

  xpCard: {
    width: "100%",
    marginTop: 25,
    backgroundColor: "#171717",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
  },

  xpLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#BBBBBB",
  },

  xpNumber: {
    marginTop: 5,
    fontSize: 29,
    fontWeight: "900",
    color: "#C8FF3D",
  },

  sectionTitle: {
    width: "100%",
    marginTop: 24,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "900",
    color: "#171717",
  },

  statsCard: {
    width: "100%",
    height: 88,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#171717",
  },

  statLabel: {
    marginTop: 5,
    fontSize: 8,
    fontWeight: "800",
    color: "#999999",
  },

  divider: {
    width: 1,
    height: 37,
    backgroundColor: "#E6E6E1",
  },

  placeCard: {
    width: "100%",
    marginTop: 12,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  placeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#C8FF3D",
    alignItems: "center",
    justifyContent: "center",
  },

  placeContent: {
    flex: 1,
    marginLeft: 12,
  },

  placeLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#999999",
  },

  placeName: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "900",
    color: "#171717",
  },

  questCard: {
    width: "100%",
    marginTop: 12,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  questLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#999999",
  },

  questStatus: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#171717",
  },

  questXP: {
    fontSize: 15,
    fontWeight: "900",
    color: "#78A800",
  },

  messageCard: {
    width: "100%",
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#C8FF3D",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#171717",
  },

  homeButton: {
    width: "100%",
    minHeight: 58,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  homeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  anotherButton: {
    width: "100%",
    minHeight: 54,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  anotherText: {
    color: "#171717",
    fontSize: 12,
    fontWeight: "900",
  },

  bottomSpace: {
    height: 20,
  },
});