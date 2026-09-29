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
import MapView, { Marker } from "react-native-maps";

export default function RevealScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    latitude?: string;
    longitude?: string;
    distance?: string;
    time?: string;
    questCompleted?: string;
  }>();

  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const destination = {
    name: params.name ?? "Mystery Destination",

    latitude: Number.isFinite(latitude)
      ? latitude
      : -31.9766,

    longitude: Number.isFinite(longitude)
      ? longitude
      : 115.9057,

    distance: params.distance ?? "Unknown",

    time: params.time ?? "60 MIN",

    questCompleted:
      params.questCompleted === "true",
  };

  /*
   * XP
   *
   * Destination = 150 XP
   * Side Quest = 50 XP
   */

  const destinationXP = 150;

  const sideQuestXP =
    destination.questCompleted ? 50 : 0;

  const totalXP =
    destinationXP + sideQuestXP;

  const goToComplete = () => {
    router.push({
      pathname: "/complete",

      params: {
        name: destination.name,

        distance:
          destination.distance,

        time:
          destination.time,

        questCompleted:
          destination.questCompleted
            ? "true"
            : "false",

        xp:
          totalXP.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* TOP */}

        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#171717"
            />
          </TouchableOpacity>

          <Text style={styles.logo}>
            ONE MORE STOP
          </Text>
        </View>

        {/* TITLE */}

        <Text style={styles.eyebrow}>
          MYSTERY SOLVED
        </Text>

        <Text style={styles.title}>
          DESTINATION{"\n"}REVEALED
        </Text>

        <Text style={styles.subtitle}>
          You made it.
        </Text>

        {/* MAP */}

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude:
                destination.latitude,

              longitude:
                destination.longitude,

              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          >
            <Marker
              coordinate={{
                latitude:
                  destination.latitude,

                longitude:
                  destination.longitude,
              }}
              title={
                destination.name
              }
              description="Your mystery destination"
            />
          </MapView>

          <View
            style={styles.revealedBadge}
            pointerEvents="none"
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#171717"
            />

            <Text
              style={
                styles.revealedBadgeText
              }
            >
              DESTINATION REVEALED
            </Text>
          </View>
        </View>

        {/* DESTINATION */}

        <View
          style={
            styles.destinationCard
          }
        >
          <View
            style={
              styles.pinCircle
            }
          >
            <Ionicons
              name="location"
              size={25}
              color="#171717"
            />
          </View>

          <View
            style={
              styles.destinationInfo
            }
          >
            <Text
              style={
                styles.destinationLabel
              }
            >
              YOUR DESTINATION
            </Text>

            <Text
              style={
                styles.destinationName
              }
            >
              {destination.name}
            </Text>

            <Text
              style={
                styles.destinationDistance
              }
            >
              {destination.distance}
            </Text>
          </View>
        </View>

        {/* XP */}

        <View style={styles.xpCard}>
          <View>
            <Text
              style={styles.xpLabel}
            >
              ADVENTURE XP
            </Text>

            <Text
              style={styles.xpDescription}
            >
              Destination discovered
            </Text>
          </View>

          <Text style={styles.xpNumber}>
            +{destinationXP}
          </Text>
        </View>

        {/* SIDE QUEST XP */}

        {destination.questCompleted && (
          <View
            style={
              styles.sideQuestCard
            }
          >
            <View
              style={
                styles.sideQuestIcon
              }
            >
              <Ionicons
                name="camera"
                size={20}
                color="#171717"
              />
            </View>

            <View
              style={
                styles.sideQuestContent
              }
            >
              <Text
                style={
                  styles.sideQuestTitle
                }
              >
                SIDE QUEST COMPLETE
              </Text>

              <Text
                style={
                  styles.sideQuestDescription
                }
              >
                You captured something new.
              </Text>
            </View>

            <Text
              style={
                styles.sideQuestXP
              }
            >
              +50 XP
            </Text>
          </View>
        )}

        {/* TOTAL */}

        <View
          style={styles.totalCard}
        >
          <Text
            style={styles.totalLabel}
          >
            TOTAL XP
          </Text>

          <Text
            style={styles.totalXP}
          >
            +{totalXP} XP
          </Text>
        </View>

        {/* BUTTON */}

        <TouchableOpacity
          style={styles.startButton}
          onPress={goToComplete}
        >
          <Text
            style={styles.startText}
          >
            COMPLETE ADVENTURE
          </Text>

          <Ionicons
            name="arrow-forward"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View
          style={styles.bottomSpace}
        />
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
    paddingTop: 20,
    paddingBottom: 45,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  logo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
  },

  eyebrow: {
    marginTop: 40,
    fontSize: 11,
    fontWeight: "900",
    color: "#78A800",
    letterSpacing: 1.5,
  },

  title: {
    marginTop: 7,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    color: "#171717",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#777777",
  },

  mapCard: {
    marginTop: 22,
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E8EFE8",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  revealedBadge: {
    position: "absolute",
    top: 15,
    alignSelf: "center",
    backgroundColor: "#C8FF3D",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  revealedBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#171717",
  },

  destinationCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  pinCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C8FF3D",
    alignItems: "center",
    justifyContent: "center",
  },

  destinationInfo: {
    flex: 1,
    marginLeft: 14,
  },

  destinationLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#999999",
  },

  destinationName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: "#171717",
  },

  destinationDistance: {
    marginTop: 4,
    fontSize: 11,
    color: "#777777",
  },

  xpCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  xpLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#171717",
  },

  xpDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#888888",
  },

  xpNumber: {
    fontSize: 23,
    fontWeight: "900",
    color: "#78A800",
  },

  sideQuestCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  sideQuestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C8FF3D",
    alignItems: "center",
    justifyContent: "center",
  },

  sideQuestContent: {
    flex: 1,
    marginLeft: 12,
  },

  sideQuestTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#171717",
  },

  sideQuestDescription: {
    marginTop: 3,
    fontSize: 9,
    color: "#888888",
  },

  sideQuestXP: {
    fontSize: 14,
    fontWeight: "900",
    color: "#78A800",
  },

  totalCard: {
    marginTop: 10,
    backgroundColor: "#C8FF3D",
    borderRadius: 20,
    padding: 19,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#171717",
  },

  totalXP: {
    fontSize: 21,
    fontWeight: "900",
    color: "#171717",
  },

  startButton: {
    marginTop: 17,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  startText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  bottomSpace: {
    height: 20,
  },
});