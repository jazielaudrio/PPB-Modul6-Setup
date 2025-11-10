import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import  mqtt  from "mqtt";
import { Buffer } from "buffer";
// Pastikan mengimpor variabel yang BENAR
import { MQTT_BROKER_URL, MQTT_TOPIC_HUMIDITY } from "../services/config.js";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

const clientOptions = {
  reconnectPeriod: 5000,
  connectTimeout: 30_000,
  protocolVersion: 4,
};

const HISTORY_LIMIT = 20;

export function useMqttHumidity() {
  const [state, setState] = useState({
    readings: [], // Akan menyimpan 20 data terakhir
    connectionState: "disconnected",
    error: null,
  });

  const clientRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // Cek apakah konfigurasi sudah benar
    if (!MQTT_BROKER_URL || !MQTT_TOPIC_HUMIDITY) {
      setState((prev) => ({
        ...prev,
        error: "MQTT humidity config missing. Check app.json and config.js",
      }));
      return;
    }

    const clientId = `rn-humidity-monitor-${Math.random().toString(16).slice(2)}`;
    const client = mqtt.connect(MQTT_BROKER_URL, {
      ...clientOptions,
      clientId,
      clean: true,
    });
    clientRef.current = client;

    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        client.reconnect();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    client.on("connect", () => {
      setState((prev) => ({ ...prev, connectionState: "connected", error: null }));
      // Subscribe ke topik kelembapan
      client.subscribe(MQTT_TOPIC_HUMIDITY, { qos: 0 }, (err) => {
        if (err) {
          setState((prev) => ({ ...prev, error: err.message }));
        }
      });
    });

    client.on("reconnect", () => {
      setState((prev) => ({ ...prev, connectionState: "reconnecting" }));
    });

    client.on("error", (error) => {
      setState((prev) => ({ ...prev, error: error.message, connectionState: "error" }));
    });

    client.on("message", (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        
        // Pastikan kita mendapatkan data 'humidity'
        if (typeof payload.humidity !== 'number') {
          // Jika payload tidak ada 'humidity', jangan lakukan apa-apa
          // Ini mungkin pesan yang salah format
          console.warn("Received MQTT message without humidity data:", payload);
          return; 
        }

        const newReading = {
          id: payload.timestamp ?? new Date().toISOString(),
          humidity: payload.humidity,
          timestamp: payload.timestamp ?? new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          readings: [newReading, ...prev.readings].slice(0, HISTORY_LIMIT),
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: error.message }));
      }
    });

    return () => {
      subscription.remove();
      client.end(true);
    };
  }, []);

  return state;
}