import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";

import { router, useLocalSearchParams } from "expo-router";

import { useEffect, useState } from "react";

import Purchases from "react-native-purchases";
import RevenueCatUI, {
  PAYWALL_RESULT,
} from "react-native-purchases-ui";

import {
  ActivityIndicator,

  Alert,
  Linking,

  SafeAreaView,

  ScrollView,

  StyleSheet,

  Text,

  TouchableOpacity,

  View,
} from "react-native";

/*

 * =========================================

 * PLACE TYPE

 * =========================================

 */

type Place = {

  id: number;

  name: string;

  latitude: number;

  longitude: number;

  type: string;

  hint: string;

  distanceKm: number;

  walkingMinutes: number;

};

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

/*

 * =========================================

 * SCREEN

 * =========================================

 */

export default function MysteryScreen() {

  /*

   * Receive setup options

   */

  const params = useLocalSearchParams<{

    time?: string;

    mode?: string;

    budget?: string;

  }>();

  const time = params.time ?? "60 MIN";

  const mode = params.mode ?? "SOLO";

  const budget = params.budget ?? "<$10";

  /*

   * =========================================

   * STATE

   * =========================================

   */

  const [places, setPlaces] = useState<Place[]>([]);

  /*

   * Destination is selected ONCE

   * when nearby places are loaded.

   */

  const [

    selectedDestination,

    setSelectedDestination,

  ] = useState<Place | null>(null);

  const [loading, setLoading] =

    useState(true);

  const [error, setError] =

    useState<string | null>(null);

  /*

   * RevenueCat PRO Reveal

   */

  const [

    destinationRevealed,

    setDestinationRevealed,

  ] = useState(false);

  const [paywallLoading, setPaywallLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  /*

   * =========================================

   * TIME SETTINGS

   * =========================================

   */

  const getMaximumMinutes = () => {

    /*

     * Selected TIME represents the

     * whole adventure, not only walking.

     */

    if (time === "30 MIN") return 15;

    if (time === "60 MIN") return 30;

    if (time === "90 MIN") return 45;

    return 30;

  };

  const getSearchRadius = () => {

    if (time === "30 MIN") return 3000;

    if (time === "60 MIN") return 5000;

    if (time === "90 MIN") return 8000;

    return 5000;

  };

  /*

   * =========================================

   * HINT GENERATOR

   * =========================================

   */

  const getHint = (type: string) => {

    switch (type) {

      case "cafe":

        return "Follow the smell of coffee and look for somewhere locals like to slow down.";

      case "park":

        return "Look for a little more green and a little less concrete.";

      case "museum":

        return "Your destination has stories waiting inside.";

      case "gallery":

        return "Look for a place where creativity lives on the walls.";

      case "viewpoint":

        return "Keep going toward somewhere with a better view.";

      case "attraction":

        return "You're heading toward something worth stopping for.";

      default:

        return "Keep exploring. You're getting closer.";

    }

  };

  /*

   * =========================================

   * BUDGET FILTER

   * =========================================

   */

  const filterPlacesByBudget = (

    availablePlaces: Place[]

  ) => {

    let filtered: Place[] = [];

    if (budget === "FREE") {

      filtered = availablePlaces.filter(

        (place) =>

          [

            "park",

            "viewpoint",

            "attraction",

          ].includes(place.type)

      );

    }

    if (budget === "<$10") {

      filtered = availablePlaces.filter(

        (place) =>

          [

            "park",

            "viewpoint",

            "attraction",

            "cafe",

          ].includes(place.type)

      );

    }

    if (budget === "<$25") {

      filtered = availablePlaces.filter(

        (place) =>

          [

            "park",

            "viewpoint",

            "attraction",

            "cafe",

            "museum",

            "gallery",

          ].includes(place.type)

      );

    }

    /*

     * If budget filter produces nothing,

     * use all available places.

     */

    if (filtered.length === 0) {

      return availablePlaces;

    }

    return filtered;

  };

  /*

   * =========================================

   * LOAD NEARBY PLACES

   * =========================================

   */

  useEffect(() => {

    const loadPlaces = async () => {

      try {

        setLoading(true);

        setError(null);
        setPermissionDenied(false);
        setSelectedDestination(null);
        setPlaces([]);

        setDestinationRevealed(false);

        /*

         * LOCATION PERMISSION

         */

        const { status } =

          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setPermissionDenied(true);

          setError(

            "Location access is off. Enable it in Settings, then try again."

          );

          return;

        }

        /*

         * CURRENT LOCATION

         */

        const currentLocation =

          await Location.getCurrentPositionAsync({

            accuracy: Location.Accuracy.High,

          });

        const userLatitude =

          currentLocation.coords.latitude;

        const userLongitude =

          currentLocation.coords.longitude;

        const radius = getSearchRadius();

        /*

         * =====================================

         * OVERPASS API QUERY

         * =====================================

         */

        const query = `

          [out:json][timeout:25];

          (

            nwr["amenity"="cafe"](around:${radius},${userLatitude},${userLongitude});

            nwr["leisure"="park"](around:${radius},${userLatitude},${userLongitude});

            nwr["tourism"="museum"](around:${radius},${userLatitude},${userLongitude});

            nwr["tourism"="gallery"](around:${radius},${userLatitude},${userLongitude});

            nwr["tourism"="viewpoint"](around:${radius},${userLatitude},${userLongitude});

            nwr["tourism"="attraction"](around:${radius},${userLatitude},${userLongitude});

          );

          out center;

        `;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        let response: Response;
        try {
          response = await fetch(

          "https://overpass-api.de/api/interpreter",

          {

            method: "POST",

            headers: {

              "Content-Type":

                "application/x-www-form-urlencoded",

            },

            body:

              "data=" +

              encodeURIComponent(query),
            signal: controller.signal,

          }

        );
        } finally {
          clearTimeout(timeout);
        }

        if (!response.ok) {

          throw new Error(

            "Overpass request failed."

          );

        }

        const data = await response.json();

        /*

         * =====================================

         * FORMAT PLACES

         * =====================================

         */

        const formattedPlaces: Place[] =

          data.elements

            .map((element: any) => {

              const latitude =

                element.lat ??

                element.center?.lat;

              const longitude =

                element.lon ??

                element.center?.lon;

              const name =

                element.tags?.name;

              /*

               * Skip places without

               * coordinates or name.

               */

              if (

                !latitude ||

                !longitude ||

                !name

              ) {

                return null;

              }

              /*

               * Determine category

               */

              let type = "attraction";

              if (

                element.tags?.amenity ===

                "cafe"

              ) {

                type = "cafe";

              } else if (

                element.tags?.leisure ===

                "park"

              ) {

                type = "park";

              } else if (

                element.tags?.tourism ===

                "museum"

              ) {

                type = "museum";

              } else if (

                element.tags?.tourism ===

                "gallery"

              ) {

                type = "gallery";

              } else if (

                element.tags?.tourism ===

                "viewpoint"

              ) {

                type = "viewpoint";

              } else if (

                element.tags?.tourism ===

                "attraction"

              ) {

                type = "attraction";

              }

              /*

               * Straight-line distance

               */

              const distanceKm =

                calculateDistance(

                  userLatitude,

                  userLongitude,

                  latitude,

                  longitude

                );

              /*

               * Approximate walking time

               * at 5 km/h.

               */

              const walkingMinutes =

                Math.round(

                  (distanceKm / 5) * 60

                );

              return {

                id: element.id,

                name,

                latitude,

                longitude,

                type,

                hint: getHint(type),

                distanceKm,

                walkingMinutes,

              };

            })

            .filter(

              (

                place: Place | null

              ): place is Place =>

                place !== null

            );

        /*

         * =====================================

         * REMOVE DUPLICATE NAMES

         * =====================================

         */

        const uniquePlaces =

          formattedPlaces.filter(

            (

              place,

              index,

              array

            ) =>

              array.findIndex(

                (item) =>

                  item.name === place.name

              ) === index

          );

        /*

         * =====================================

         * TIME FILTER

         * =====================================

         */

        const maxMinutes =

          getMaximumMinutes();

        /*

         * Avoid destinations that are

         * basically right next door.

         */

        const idealPlaces =

          uniquePlaces.filter(

            (place) =>

              place.walkingMinutes >= 5 &&

              place.walkingMinutes <=

                maxMinutes

          );

        /*

         * If the 5 minute minimum removes

         * everything, still allow closer

         * destinations.

         */

        const timeSuitablePlaces =

          idealPlaces.length > 0

            ? idealPlaces

            : uniquePlaces.filter(

                (place) =>

                  place.walkingMinutes <=

                  maxMinutes

              );

        if (

          timeSuitablePlaces.length === 0

        ) {

          setPlaces([]);

          setSelectedDestination(null);

          setError(

            "We couldn't find a mystery destination within your selected adventure time. Try choosing a longer adventure."

          );

          return;

        }

        /*

         * =====================================

         * BUDGET FILTER

         * =====================================

         */

        const budgetSuitablePlaces =

          filterPlacesByBudget(

            timeSuitablePlaces

          );

        setPlaces(

          budgetSuitablePlaces

        );

        /*

         * =====================================

         * SELECT DESTINATION ONCE

         * =====================================

         */

        const randomIndex =

          Math.floor(

            Math.random() *

              budgetSuitablePlaces.length

          );

        const chosenDestination =

          budgetSuitablePlaces[

            randomIndex

          ];

        setSelectedDestination(

          chosenDestination

        );

      } catch (err) {

        console.log(

          "Mystery destination error:",

          err

        );

        setPlaces([]);

        setSelectedDestination(null);

        setError(
          err instanceof Error && err.name === "AbortError"
            ? "The search timed out. Check your connection and try again."
            : "We couldn't load nearby places. Check your internet connection and try again."
        );

      } finally {

        setLoading(false);

      }

    };

    loadPlaces();

  }, [retryCount]);

  /*

   * =========================================

   * START JOURNEY

   * =========================================

   */

  const startJourney = () => {

    if (!selectedDestination) {

      Alert.alert(

        "No Destination",

        "We couldn't choose a destination. Please try again."

      );

      return;

    }

    router.push({

      pathname: "/journey",

      params: {

        name:

          selectedDestination.name,

        latitude:

          selectedDestination.latitude.toString(),

        longitude:

          selectedDestination.longitude.toString(),

        hint:

          selectedDestination.hint,

        type:

          selectedDestination.type,

        time,

        mode,

        budget,

      },

    });

  };

  /*

   * =========================================

   * REVENUECAT PRO REVEAL

   * =========================================

   */

  const revealDestination = async () => {
    if (!selectedDestination || paywallLoading) {
      if (!selectedDestination) {
        Alert.alert("No Destination", "Your mystery destination is still being prepared.");
      }
      return;
    }

    setPaywallLoading(true);
    try {
      const existingInfo = await Purchases.getCustomerInfo();
      if (existingInfo.entitlements.active["one_more_stop_pro"]?.isActive) {
        setDestinationRevealed(true);
        return;
      }

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "one_more_stop_pro",
      });

      if (result === PAYWALL_RESULT.CANCELLED) return;
      if (result === PAYWALL_RESULT.ERROR) {
        Alert.alert("Paywall Error", "Please try again.");
        return;
      }

      // Verify entitlement even after a successful purchase or restore.
      const updatedInfo = await Purchases.getCustomerInfo();
      if (updatedInfo.entitlements.active["one_more_stop_pro"]?.isActive) {
        setDestinationRevealed(true);
      } else if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        Alert.alert("Purchase Not Confirmed", "PRO access hasn't been confirmed yet.");
      }
    } catch (err) {
      console.log("RevenueCat Paywall error:", err);
      Alert.alert("Paywall Error", "We couldn't check PRO access. Please try again.");
    } finally {
      setPaywallLoading(false);
    }
  };

  /*

   * =========================================

   * TRY AGAIN

   * =========================================

   */

  const tryAgain = () => {
    setRetryCount((count) => count + 1);
  };

  /*

   * =========================================

   * UI

   * =========================================

   */

  return (

    <SafeAreaView

      style={styles.container}

    >

      <ScrollView

        contentContainerStyle={

          styles.content

        }

        showsVerticalScrollIndicator={

          false

        }

        contentInsetAdjustmentBehavior="automatic"

      >

        {/* TOP */}

        <View style={styles.topBar}>

          <TouchableOpacity

            onPress={() =>

              router.back()

            }

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

          YOUR ADVENTURE

        </Text>

        <Text style={styles.title}>

          DESTINATION{"\n"}UNKNOWN

        </Text>

        <Text style={styles.subtitle}>

          That's the point.

        </Text>

        {/* MYSTERY VISUAL */}

        <View

          style={

            styles.mysteryCard

          }

        >

          {loading ? (

            <>

              <ActivityIndicator

                size="large"

                color="#171717"

              />

              <Text

                style={

                  styles.loadingTitle

                }

              >

                FINDING YOUR STOP

              </Text>

              <Text

                style={

                  styles.loadingDescription

                }

              >

                Searching nearby adventures...

              </Text>

            </>

          ) : error ? (

            <>

              <View

                style={

                  styles.iconCircle

                }

              >

                <Ionicons

                  name="alert-circle-outline"

                  size={40}

                  color="#171717"

                />

              </View>

              <Text

                style={

                  styles.errorTitle

                }

              >

                NO ADVENTURE FOUND

              </Text>

              <Text

                style={

                  styles.errorDescription

                }

              >

                {error}

              </Text>

              <TouchableOpacity

                style={

                  styles.retryButton

                }

                onPress={tryAgain}

              >

                <Text

                  style={

                    styles.retryText

                  }

                >

                  TRY AGAIN

                </Text>

              </TouchableOpacity>
              {permissionDenied && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => Linking.openSettings()}
                >
                  <Text style={styles.retryText}>OPEN SETTINGS</Text>
                </TouchableOpacity>
              )}

            </>

          ) : destinationRevealed &&

            selectedDestination ? (

            <>

              {/* REVEALED */}

              <View

                style={

                  styles.revealedIcon

                }

              >

                <Ionicons

                  name="location"

                  size={42}

                  color="#171717"

                />

              </View>

              <Text

                style={

                  styles.revealedLabel

                }

              >

                DESTINATION REVEALED

              </Text>

              <Text

                style={

                  styles.destinationName

                }

              >

                {

                  selectedDestination.name

                }

              </Text>

              <View

                style={

                  styles.destinationMeta

                }

              >

                <View

                  style={

                    styles.metaItem

                  }

                >

                  <Ionicons

                    name="walk-outline"

                    size={16}

                    color="#555555"

                  />

                  <Text

                    style={

                      styles.metaText

                    }

                  >

                    {

                      selectedDestination.walkingMinutes

                    }{" "}

                    MIN

                  </Text>

                </View>

                <View

                  style={

                    styles.metaDot

                  }

                />

                <Text

                  style={

                    styles.metaText

                  }

                >

                  {selectedDestination.type.toUpperCase()}

                </Text>

              </View>

              <Text

                style={

                  styles.revealedHint

                }

              >

                {

                  selectedDestination.hint

                }

              </Text>

            </>

          ) : (

            <>

              {/* HIDDEN */}

              <View

                style={

                  styles.questionCircle

                }

              >

                <Text

                  style={

                    styles.questionMark

                  }

                >

                  ?

                </Text>

              </View>

              <Text

                style={

                  styles.mysteryTitle

                }

              >

                IT'S A SECRET

              </Text>

              <Text

                style={

                  styles.mysteryDescription

                }

              >

                We've picked a place nearby.

                You'll discover it when you

                arrive.

              </Text>

              <View

                style={

                  styles.readyBadge

                }

              >

                <View

                  style={

                    styles.readyDot

                  }

                />

                <Text

                  style={

                    styles.readyText

                  }

                >

                  DESTINATION READY

                </Text>

              </View>

            </>

          )}

        </View>

        {/* SETTINGS */}

        {!loading &&

          !error && (

            <>

              <Text

                style={

                  styles.sectionLabel

                }

              >

                YOUR SETTINGS

              </Text>

              <View

                style={

                  styles.settingsCard

                }

              >

                <View

                  style={

                    styles.setting

                  }

                >

                  <Ionicons

                    name="time-outline"

                    size={20}

                    color="#171717"

                  />

                  <Text

                    style={

                      styles.settingValue

                    }

                  >

                    {time}

                  </Text>

                  <Text

                    style={

                      styles.settingLabel

                    }

                  >

                    TIME

                  </Text>

                </View>

                <View

                  style={

                    styles.divider

                  }

                />

                <View

                  style={

                    styles.setting

                  }

                >

                  <Ionicons

                    name="person-outline"

                    size={20}

                    color="#171717"

                  />

                  <Text

                    style={

                      styles.settingValue

                    }

                  >

                    {mode}

                  </Text>

                  <Text

                    style={

                      styles.settingLabel

                    }

                  >

                    MODE

                  </Text>

                </View>

                <View

                  style={

                    styles.divider

                  }

                />

                <View

                  style={

                    styles.setting

                  }

                >

                  <Ionicons

                    name="wallet-outline"

                    size={20}

                    color="#171717"

                  />

                  <Text

                    style={

                      styles.settingValue

                    }

                  >

                    {budget}

                  </Text>

                  <Text

                    style={

                      styles.settingLabel

                    }

                  >

                    BUDGET

                  </Text>

                </View>

              </View>

              {/* NUMBER OF MATCHES */}

              <Text

                style={

                  styles.matchText

                }

              >

                {places.length} nearby spots

                matched your adventure

              </Text>

              {/* START */}

              <TouchableOpacity

                style={

                  styles.startButton

                }

                onPress={

                  startJourney

                }

              >

                <Text

                  style={

                    styles.startButtonText

                  }

                >

                  START THE JOURNEY

                </Text>

                <Ionicons

                  name="arrow-forward"

                  size={21}

                  color="#FFFFFF"

                />

              </TouchableOpacity>

              {/* PRO REVEAL */}

              {!destinationRevealed ? (

                <TouchableOpacity

                  style={

                    styles.proButton

                  }

                  onPress={

                    revealDestination

                  }

                 disabled={paywallLoading}
                >

                  {paywallLoading && <ActivityIndicator size="small" color="#171717" />}
                <Ionicons

                    name="eye-outline"

                    size={19}

                    color="#171717"

                  />

                  <Text

                    style={

                      styles.proButtonText

                    }

                  >

                    REVEAL DESTINATION

                  </Text>

                  <View

                    style={

                      styles.proBadge

                    }

                  >

                    <Text

                      style={

                        styles.proBadgeText

                      }

                    >

                      PRO

                    </Text>

                  </View>

                </TouchableOpacity>

              ) : (

                <View

                  style={

                    styles.proUsed

                  }

                >

                  <Ionicons

                    name="checkmark-circle"

                    size={18}

                    color="#78A800"

                  />

                  <Text

                    style={

                      styles.proUsedText

                    }

                  >

                    DESTINATION REVEALED

                  </Text>

                </View>

              )}

              <Text

                style={

                  styles.prototypeText

                }

              >

                ONE MORE STOP PRO · PREMIUM FEATURE

              </Text>

            </>

          )}

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

    marginTop: 42,

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1.5,

    color: "#78A800",

  },

  title: {

    marginTop: 7,

    fontSize: 35,

    lineHeight: 40,

    fontWeight: "900",

    color: "#171717",

  },

  subtitle: {

    marginTop: 8,

    fontSize: 16,

    color: "#777777",

  },

  mysteryCard: {

    marginTop: 25,

    minHeight: 310,

    borderRadius: 26,

    backgroundColor: "#FFFFFF",

    padding: 28,

    alignItems: "center",

    justifyContent: "center",

  },

  questionCircle: {

    width: 96,

    height: 96,

    borderRadius: 48,

    backgroundColor: "#C8FF3D",

    alignItems: "center",

    justifyContent: "center",

  },

  questionMark: {

    fontSize: 54,

    fontWeight: "900",

    color: "#171717",

  },

  mysteryTitle: {

    marginTop: 20,

    fontSize: 18,

    fontWeight: "900",

    color: "#171717",

  },

  mysteryDescription: {

    marginTop: 8,

    maxWidth: 270,

    textAlign: "center",

    fontSize: 12,

    lineHeight: 18,

    color: "#777777",

  },

  readyBadge: {

    marginTop: 18,

    flexDirection: "row",

    alignItems: "center",

    gap: 6,

    backgroundColor: "#F7F7F2",

    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: 999,

  },

  readyDot: {

    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor: "#C8FF3D",

  },

  readyText: {

    fontSize: 9,

    fontWeight: "900",

    color: "#171717",

  },

  loadingTitle: {

    marginTop: 18,

    fontSize: 16,

    fontWeight: "900",

    color: "#171717",

  },

  loadingDescription: {

    marginTop: 7,

    fontSize: 12,

    color: "#777777",

  },

  iconCircle: {

    width: 80,

    height: 80,

    borderRadius: 40,

    backgroundColor: "#F1F1EC",

    alignItems: "center",

    justifyContent: "center",

  },

  errorTitle: {

    marginTop: 18,

    fontSize: 16,

    fontWeight: "900",

    color: "#171717",

  },

  errorDescription: {

    marginTop: 8,

    textAlign: "center",

    fontSize: 12,

    lineHeight: 18,

    color: "#777777",

  },

  retryButton: {

    marginTop: 18,

    backgroundColor: "#171717",

    paddingHorizontal: 18,

    paddingVertical: 11,

    borderRadius: 12,

  },

  retryText: {

    fontSize: 10,

    fontWeight: "900",

    color: "#FFFFFF",

  },

  revealedIcon: {

    width: 82,

    height: 82,

    borderRadius: 41,

    backgroundColor: "#C8FF3D",

    alignItems: "center",

    justifyContent: "center",

  },

  revealedLabel: {

    marginTop: 17,

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1,

    color: "#78A800",

  },

  destinationName: {

    marginTop: 6,

    fontSize: 23,

    lineHeight: 29,

    fontWeight: "900",

    color: "#171717",

    textAlign: "center",

  },

  destinationMeta: {

    marginTop: 11,

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

  },

  metaItem: {

    flexDirection: "row",

    alignItems: "center",

    gap: 4,

  },

  metaDot: {

    width: 4,

    height: 4,

    borderRadius: 2,

    backgroundColor: "#AAAAAA",

  },

  metaText: {

    fontSize: 10,

    fontWeight: "800",

    color: "#555555",

  },

  revealedHint: {

    marginTop: 15,

    maxWidth: 270,

    fontSize: 11,

    lineHeight: 17,

    textAlign: "center",

    color: "#777777",

  },

  sectionLabel: {

    marginTop: 22,

    marginBottom: 10,

    fontSize: 11,

    fontWeight: "900",

    color: "#171717",

  },

  settingsCard: {

    minHeight: 88,

    borderRadius: 20,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

  },

  setting: {

    flex: 1,

    alignItems: "center",

  },

  settingValue: {

    marginTop: 5,

    fontSize: 11,

    fontWeight: "900",

    color: "#171717",

  },

  settingLabel: {

    marginTop: 3,

    fontSize: 7,

    fontWeight: "800",

    color: "#999999",

  },

  divider: {

    width: 1,

    height: 42,

    backgroundColor: "#E5E5E0",

  },

  matchText: {

    marginTop: 11,

    textAlign: "center",

    fontSize: 10,

    color: "#999999",

  },

  startButton: {

    marginTop: 18,

    minHeight: 59,

    borderRadius: 18,

    backgroundColor: "#171717",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 9,

  },

  startButtonText: {

    fontSize: 14,

    fontWeight: "900",

    color: "#FFFFFF",

  },

  proButton: {

    marginTop: 10,

    minHeight: 55,

    borderRadius: 18,

    borderWidth: 1.5,

    borderColor: "#171717",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

  },

  proButtonText: {

    fontSize: 12,

    fontWeight: "900",

    color: "#171717",

  },

  proBadge: {

    marginLeft: 3,

    backgroundColor: "#C8FF3D",

    paddingHorizontal: 7,

    paddingVertical: 4,

    borderRadius: 6,

  },

  proBadgeText: {

    fontSize: 7,

    fontWeight: "900",

    color: "#171717",

  },

  proUsed: {

    marginTop: 10,

    minHeight: 50,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

  },

  proUsedText: {

    fontSize: 10,

    fontWeight: "900",

    color: "#171717",

  },

  prototypeText: {

    marginTop: 9,

    textAlign: "center",

    fontSize: 9,

    color: "#AAAAAA",

  },

  bottomSpace: {

    height: 25,

  },

});