import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMqttHumidity } from "../hooks/useMqttHumidity.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function HumidityScreen() {
  // Hook MQTT (untuk data live di kartu atas)
  const { readings: liveReadings, connectionState, error: mqttError } = useMqttHumidity();
  
  // State untuk Database (riwayat yang disimpan)
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Ambil data terbaru dari MQTT untuk kartu atas
  const latestReading = liveReadings[0] || {};
  const { humidity, timestamp } = latestReading;

  // Fungsi untuk fetch riwayat dari API
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getHumidityReadings();
      setHistory(data ?? []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch riwayat saat layar dibuka
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  // Fungsi 'Pull-to-refresh'
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHistory();
    } finally {
      setRefreshing(false);
    }
  }, [fetchHistory]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Kartu ini TETAP menampilkan data LIVE dari MQTT */}
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Humidity</Text>
          <View style={styles.valueRow}>
            <Text style={styles.humidityText}>
              {typeof humidity === "number" ? `${humidity.toFixed(2)}%` : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError}</Text>}
        </View>

        {/* Tabel ini sekarang menampilkan data HISTORY dari DATABASE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved History</Text>
          {loading && <ActivityIndicator />}
        </View>
        {apiError && <Text style={styles.errorText}>Failed to load history: {apiError}</Text>}
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) => (value ? new Date(value).toLocaleString() : "--"),
            },
            {
              key: "humidity",
              title: "Humidity (%)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
          ]}
          data={history} // Data dari database
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  humidityText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#007aff",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});