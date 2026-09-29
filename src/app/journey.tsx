import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView from "react-native-maps";

/*
 * =========================================
 * DISTANCE CALCULATION
 * =========================================
 */

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

export default function JourneyScreen() {
  /*
   * =========================================
   * RECEIVE DESTINATION
   * =========================================
   */

  const params = useLocalSearchParams<{
    name?: string;
    latitude?: string;
    longitude?: string;
    hint?: string;
    type?: string;
    time?: string;
    mode?: string;
    budget?: string;
  }>();

  const destinationLatitude = Number(params.latitude);
  const destinationLongitude = Number(params.longitude);

  const destination = {
    name: params.name ?? "Mystery Destination",

    latitude: Number.isFinite(destinationLatitude)
      ? destinationLatitude
      : -31.9766,

    longitude: Number.isFinite(destinationLongitude)
      ? destinationLongitude
      : 115.9057,

    hint:
      params.hint ??
      "Keep exploring. You're getting closer.",

    type: params.type ?? "place",
  };

  /*
   * =========================================
   * STATE
   * =========================================
   */

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  /*
   * Remaining distance to destination
   */
  const [distanceKm, setDistanceKm] =
    useState<number | null>(null);

  /*
   * Estimated remaining walking time
   */
  const [walkingMinutes, setWalkingMinutes] =
    useState<number | null>(null);

  /*
   * Actual distance travelled during
   * this adventure
   */
  const [travelledDistanceKm, setTravelledDistanceKm] =
    useState(0);

  const [showHint, setShowHint] =
    useState(false);

  const [questCompleted, setQuestCompleted] =
    useState(false);

  const [questPhoto, setQuestPhoto] =
    useState<string | null>(null);

  const [isNearDestination, setIsNearDestination] =
    useState(false);

  /*
   * =========================================
   * REFS
   * =========================================
   */

  const mapRef =
    useRef<MapView | null>(null);

  /*
   * Previous GPS point.
   *
   * Used to calculate how far the
   * user actually walked.
   */
  const previousLocationRef =
    useRef<Location.LocationObject | null>(null);

  /*
   * =========================================
   * UPDATE REMAINING DISTANCE
   * =========================================
   */

  const updateDistance = (
    currentLocation: Location.LocationObject
  ) => {
    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      destination.latitude,
      destination.longitude
    );

    setDistanceKm(distance);

    /*
     * Approximate walking time
     * using 5 km/h walking speed.
     */

    const minutes = Math.max(
      0,
      Math.round((distance / 5) * 60)
    );

    setWalkingMinutes(minutes);

    /*
     * Destination reached when
     * within 100 metres.
     */

    setIsNearDestination(distance <= 0.1);
  };

  /*
   * =========================================
   * LIVE GPS TRACKING
   * =========================================
   */

  useEffect(() => {
    let subscription:
      | Location.LocationSubscription
      | null = null;

    async function startTracking() {
      try {
        setLocationError(null);

        /*
         * Ask for location permission
         */

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError(
            "Location permission is required for your adventure."
          );

          return;
        }

        /*
         * =====================================
         * FIRST LOCATION
         * =====================================
         */

        const firstLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setLocation(firstLocation);

        updateDistance(firstLocation);

        /*
         * Save first location so we can
         * compare it with the next location.
         */

        previousLocationRef.current =
          firstLocation;

        /*
         * =====================================
         * WATCH LOCATION
         * =====================================
         */

        subscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,

              /*
               * Try to update every 5 seconds
               */

              timeInterval: 5000,

              /*
               * Or when user moves around 10m
               */

              distanceInterval: 10,
            },

            (newLocation) => {
              setLocation(newLocation);

              /*
               * =================================
               * ACTUAL TRAVELLED DISTANCE
               * =================================
               */

              if (previousLocationRef.current) {
                const previous =
                  previousLocationRef.current;

                const movedDistance =
                  calculateDistance(
                    previous.coords.latitude,
                    previous.coords.longitude,
                    newLocation.coords.latitude,
                    newLocation.coords.longitude
                  );

                /*
                 * GPS ACCURACY FILTER
                 *
                 * Ignore movements smaller
                 * than approximately 8 metres.
                 *
                 * This prevents GPS drift from
                 * counting as walking.
                 */

                const minimumMovementKm = 0.008;

                /*
                 * Also ignore unrealistic
                 * jumps greater than 500m
                 * between GPS updates.
                 */

                const maximumMovementKm = 0.5;

                if (
                  movedDistance >= minimumMovementKm &&
                  movedDistance <= maximumMovementKm
                ) {
                  setTravelledDistanceKm(
                    (currentDistance) =>
                      currentDistance +
                      movedDistance
                  );
                }
              }

              /*
               * Save current position
               * for next comparison.
               */

              previousLocationRef.current =
                newLocation;

              /*
               * Recalculate distance
               * remaining to destination.
               */

              updateDistance(newLocation);

              /*
               * Move map camera with user.
               */

              mapRef.current?.animateToRegion(
                {
                  latitude:
                    newLocation.coords.latitude,

                  longitude:
                    newLocation.coords.longitude,

                  latitudeDelta: 0.012,
                  longitudeDelta: 0.012,
                },
                700
              );
            }
          );
      } catch (error) {
        console.log(
          "Location tracking error:",
          error
        );

        setLocationError(
          "Unable to track your location."
        );
      }
    }

    startTracking();

    /*
     * Stop GPS tracking when
     * leaving Journey screen.
     */

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  /*
   * =========================================
   * SIDE QUEST CAMERA
   * =========================================
   */

  const takeQuestPhoto = async () => {
    try {
      /*
       * Ask for camera permission
       */

      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera access is required to complete the side quest."
        );

        return;
      }

      /*
       * Open camera
       */

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.8,
        });

      /*
       * User cancelled
       */

      if (result.canceled) {
        return;
      }

      /*
       * Photo taken successfully
       */

      if (result.assets.length > 0) {
        const photoUri =
          result.assets[0].uri;

        setQuestPhoto(photoUri);

        setQuestCompleted(true);
      }
    } catch (error) {
      console.log(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "We couldn't open the camera."
      );
    }
  };

  /*
   * =========================================
   * REVEAL DESTINATION
   * =========================================
   */

  const revealDestination = () => {
    /*
     * Format ACTUAL travelled distance.
     */

    const formattedTravelledDistance =
      travelledDistanceKm < 1
        ? `${Math.round(
            travelledDistanceKm * 1000
          )} M`
        : `${travelledDistanceKm.toFixed(
            1
          )} KM`;

    router.push({
      pathname: "/reveal",

      params: {
        /*
         * Destination
         */

        name: destination.name,

        latitude:
          destination.latitude.toString(),

        longitude:
          destination.longitude.toString(),

        /*
         * Actual distance walked
         */

        distance:
          formattedTravelledDistance,

        /*
         * Selected adventure time
         */

        time:
          params.time ?? "60 MIN",

        /*
         * Side Quest result
         */

        questCompleted:
          questCompleted
            ? "true"
            : "false",
      },
    });
  };

  /*
   * =========================================
   * UI
   * =========================================
   */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* TOP BAR */}

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

        <Text style={styles.title}>
          KEEP GOING
        </Text>

        <Text style={styles.subtitle}>
          Your destination is still a secret.
        </Text>

        {/* LIVE LOCATION */}

        <View style={styles.liveStatus}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE LOCATION
          </Text>
        </View>

        {/* MAP */}

        <View style={styles.mapCard}>
          {location ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude:
                  location.coords.latitude,

                longitude:
                  location.coords.longitude,

                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              showsUserLocation
              showsMyLocationButton
            />
          ) : (
            <View style={styles.loadingMap}>
              <Ionicons
                name="location-outline"
                size={34}
                color="#171717"
              />

              <Text style={styles.loadingText}>
                {locationError ??
                  "Finding your location..."}
              </Text>
            </View>
          )}

          {/* SECRET BADGE */}

          <View
            style={styles.secretBadge}
            pointerEvents="none"
          >
            <Ionicons
              name="lock-closed"
              size={14}
              color="#171717"
            />

            <Text style={styles.secretBadgeText}>
              DESTINATION HIDDEN
            </Text>
          </View>
        </View>

        {/* REMAINING DISTANCE */}

        <View style={styles.infoCard}>
          <View style={styles.stat}>
            <Text style={styles.infoNumber}>
              {distanceKm !== null
                ? distanceKm < 1
                  ? `${Math.round(
                      distanceKm * 1000
                    )} M`
                  : `${distanceKm.toFixed(1)} KM`
                : "--"}
            </Text>

            <Text style={styles.infoLabel}>
              LEFT
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.stat}>
            <Text style={styles.infoNumber}>
              {walkingMinutes !== null
                ? walkingMinutes <= 1
                  ? "< 1 MIN"
                  : `${walkingMinutes} MIN`
                : "--"}
            </Text>

            <Text style={styles.infoLabel}>
              WALK
            </Text>
          </View>

          <View style={styles.separator} />

          {/* ACTUAL DISTANCE WALKED */}

          <View style={styles.stat}>
            <Text style={styles.infoNumberSmall}>
              {travelledDistanceKm < 1
                ? `${Math.round(
                    travelledDistanceKm * 1000
                  )} M`
                : `${travelledDistanceKm.toFixed(
                    1
                  )} KM`}
            </Text>

            <Text style={styles.infoLabel}>
              WALKED
            </Text>
          </View>
        </View>

        {/* ARRIVAL */}

        {isNearDestination && (
          <View style={styles.arrivalCard}>
            <View style={styles.arrivalIcon}>
              <Ionicons
                name="location"
                size={23}
                color="#171717"
              />
            </View>

            <View style={styles.arrivalContent}>
              <Text style={styles.arrivalTitle}>
                YOU&apos;RE HERE!
              </Text>

              <Text
                style={
                  styles.arrivalDescription
                }
              >
                Your mystery destination is
                right nearby.
              </Text>
            </View>
          </View>
        )}

        {/* SIDE QUEST */}

        <Text style={styles.sectionLabel}>
          SIDE QUEST
        </Text>

        <View style={styles.questCard}>
          <View style={styles.questTop}>
            <View style={styles.questIcon}>
              <Ionicons
                name={
                  questCompleted
                    ? "checkmark"
                    : "camera-outline"
                }
                size={24}
                color="#171717"
              />
            </View>

            <View
              style={
                styles.questTitleArea
              }
            >
              <Text style={styles.questText}>
                Find something you&apos;ve never
                noticed before.
              </Text>

              <Text
                style={
                  styles.questSubtext
                }
              >
                Take a photo to complete the quest.
              </Text>
            </View>
          </View>

          {/* PHOTO PREVIEW */}

          {questPhoto && (
            <View
              style={
                styles.photoContainer
              }
            >
              <Image
                source={{
                  uri: questPhoto,
                }}
                style={
                  styles.questPhoto
                }
              />

              <View
                style={
                  styles.photoBadge
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color="#171717"
                />

                <Text
                  style={
                    styles.photoBadgeText
                  }
                >
                  QUEST COMPLETE
                </Text>
              </View>
            </View>
          )}

          {/* QUEST BOTTOM */}

          <View
            style={
              styles.questBottom
            }
          >
            <Text style={styles.xp}>
              {questCompleted
                ? "+50 XP EARNED"
                : "+50 XP"}
            </Text>

            <TouchableOpacity
              style={[
                styles.completeButton,

                questCompleted &&
                  styles.completedButton,
              ]}
              disabled={
                questCompleted
              }
              onPress={
                takeQuestPhoto
              }
            >
              <Ionicons
                name={
                  questCompleted
                    ? "checkmark-circle"
                    : "camera-outline"
                }
                size={16}
                color="#171717"
              />

              <Text
                style={
                  styles.completeText
                }
              >
                {questCompleted
                  ? "COMPLETED"
                  : "TAKE PHOTO"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HINT */}

        <TouchableOpacity
          style={styles.hintButton}
          onPress={() =>
            setShowHint(!showHint)
          }
        >
          <Ionicons
            name="bulb-outline"
            size={17}
            color="#555555"
          />

          <Text
            style={
              styles.hintButtonText
            }
          >
            {showHint
              ? "Hide hint"
              : "Give me a hint"}
          </Text>
        </TouchableOpacity>

        {/* HINT CONTENT */}

        {showHint && (
          <View style={styles.hintCard}>
            <Ionicons
              name="bulb"
              size={21}
              color="#171717"
            />

            <View
              style={
                styles.hintContent
              }
            >
              <Text
                style={
                  styles.hintLabel
                }
              >
                YOUR HINT
              </Text>

              <Text
                style={
                  styles.hintText
                }
              >
                {destination.hint}
              </Text>
            </View>
          </View>
        )}

        {/* I'M HERE */}

        <TouchableOpacity
          style={[
            styles.arrivedButton,

            isNearDestination &&
              styles.arrivedActiveButton,
          ]}
          onPress={
            revealDestination
          }
        >
          <Ionicons
            name={
              isNearDestination
                ? "checkmark-circle"
                : "location-outline"
            }
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.arrivedText
            }
          >
            {isNearDestination
              ? "REVEAL DESTINATION"
              : "I'M HERE"}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* PROTOTYPE TESTING */}

        <Text style={styles.testingText}>
          Prototype mode: you can continue without
          physically reaching the destination.
        </Text>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =========================================
 * STYLES
 * =========================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 50,
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

  title: {
    marginTop: 42,
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

  /*
   * LIVE
   */

  liveStatus: {
    alignSelf: "flex-start",
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C8FF3D",
  },

  liveText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#171717",
  },

  /*
   * MAP
   */

  mapCard: {
    marginTop: 16,
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E8EFE8",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  loadingMap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
  },

  secretBadge: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#C8FF3D",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },

  secretBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#171717",
  },

  /*
   * INFO
   */

  infoCard: {
    marginTop: 16,
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  infoNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#171717",
  },

  infoNumberSmall: {
    fontSize: 15,
    fontWeight: "900",
    color: "#171717",
  },

  infoLabel: {
    marginTop: 4,
    fontSize: 8,
    fontWeight: "800",
    color: "#777777",
  },

  separator: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E5E0",
  },

  /*
   * ARRIVAL
   */

  arrivalCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: "#C8FF3D",
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  arrivalIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  arrivalContent: {
    flex: 1,
    marginLeft: 12,
  },

  arrivalTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#171717",
  },

  arrivalDescription: {
    marginTop: 3,
    fontSize: 11,
    color: "#555555",
  },

  /*
   * QUEST
   */

  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "900",
    color: "#171717",
  },

  questCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  questTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  questIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F1EC",
    alignItems: "center",
    justifyContent: "center",
  },

  questTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  questText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#171717",
  },

  questSubtext: {
    marginTop: 3,
    fontSize: 10,
    color: "#888888",
  },

  /*
   * PHOTO
   */

  photoContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  questPhoto: {
    width: "100%",
    height: 190,
    borderRadius: 16,
  },

  photoBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "#C8FF3D",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  photoBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#171717",
  },

  questBottom: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  xp: {
    fontSize: 15,
    fontWeight: "900",
    color: "#78A800",
  },

  completeButton: {
    backgroundColor: "#C8FF3D",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  completedButton: {
    backgroundColor: "#E8E8E2",
  },

  completeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#171717",
  },

  /*
   * HINT
   */

  hintButton: {
    alignSelf: "center",
    paddingVertical: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  hintButtonText: {
    fontSize: 12,
    color: "#555555",
    textDecorationLine: "underline",
  },

  hintCard: {
    backgroundColor: "#C8FF3D",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  hintContent: {
    flex: 1,
    marginLeft: 12,
  },

  hintLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#171717",
  },

  hintText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: "#171717",
  },

  /*
   * MAIN BUTTON
   */

  arrivedButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  arrivedActiveButton: {
    minHeight: 62,
  },

  arrivedText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  testingText: {
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    color: "#999999",
  },

  bottomSpace: {
    height: 25,
  },
});