import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SetupScreen() {
  const [time, setTime] = useState("60 MIN");
  const [mode, setMode] = useState("SOLO");
  const [budget, setBudget] = useState("<$10");

  const goToMystery = () => {
    router.push({
      pathname: "/mystery",
      params: {
        time,
        mode,
        budget,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
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

        <Text style={styles.title}>
          SET YOUR{"\n"}ADVENTURE
        </Text>

        <Text style={styles.subtitle}>
          Give us a few clues. We&apos;ll handle the rest.
        </Text>

        {/* TIME */}

        <Text style={styles.sectionTitle}>
          HOW MUCH TIME?
        </Text>

        <View style={styles.optionRow}>
          {["30 MIN", "60 MIN", "90 MIN"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  time === item &&
                    styles.selectedOption,
                ]}
                onPress={() => setTime(item)}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#171717"
                />

                <Text style={styles.optionText}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* MODE */}

        <Text style={styles.sectionTitle}>
          WHO&apos;S COMING?
        </Text>

        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              mode === "SOLO" &&
                styles.selectedOption,
            ]}
            onPress={() => setMode("SOLO")}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color="#171717"
            />

            <Text style={styles.optionText}>
              SOLO
            </Text>
          </TouchableOpacity>

          <View style={styles.lockedOption}>
            <Ionicons
              name="lock-closed"
              size={14}
              color="#888888"
            />

            <Text style={styles.lockedText}>
              DATE
            </Text>
          </View>

          <View style={styles.lockedOption}>
            <Ionicons
              name="lock-closed"
              size={14}
              color="#888888"
            />

            <Text style={styles.lockedText}>
              FRIENDS
            </Text>
          </View>
        </View>

        {/* BUDGET */}

        <Text style={styles.sectionTitle}>
          BUDGET
        </Text>

        <View style={styles.optionRow}>
          {["FREE", "<$10", "<$25"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  budget === item &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setBudget(item)
                }
              >
                <Text style={styles.optionText}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            YOUR ADVENTURE
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons
                name="time-outline"
                size={19}
                color="#171717"
              />

              <Text style={styles.summaryText}>
                {time}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#171717"
              />

              <Text style={styles.summaryText}>
                {mode}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons
                name="wallet-outline"
                size={19}
                color="#171717"
              />

              <Text style={styles.summaryText}>
                {budget}
              </Text>
            </View>
          </View>
        </View>

        {/* SURPRISE */}

        <TouchableOpacity
          style={styles.surpriseButton}
          onPress={goToMystery}
        >
          <Ionicons
            name="sparkles"
            size={21}
            color="#171717"
          />

          <Text style={styles.surpriseText}>
            SURPRISE ME
          </Text>

          <Ionicons
            name="arrow-forward"
            size={21}
            color="#171717"
          />
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
    paddingTop: 20,
    paddingBottom: 40,
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
    marginTop: 45,
    fontSize: 35,
    lineHeight: 40,
    fontWeight: "900",
    color: "#171717",
  },

  subtitle: {
    marginTop: 9,
    fontSize: 15,
    lineHeight: 21,
    color: "#777777",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 11,
    fontSize: 12,
    fontWeight: "900",
    color: "#171717",
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  selectedOption: {
    backgroundColor: "#C8FF3D",
    borderColor: "#171717",
  },

  optionText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#171717",
  },

  lockedOption: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#EBEBE6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    opacity: 0.65,
  },

  lockedText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#888888",
  },

  summaryCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#777777",
  },

  summaryRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  summaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#171717",
  },

  surpriseButton: {
    marginTop: 24,
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: "#C8FF3D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  surpriseText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#171717",
  },

  bottomSpace: {
    height: 20,
  },
});