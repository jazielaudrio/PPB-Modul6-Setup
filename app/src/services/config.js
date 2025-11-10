import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const BACKEND_URL = extra.backendUrl;
export const MQTT_BROKER_URL = extra.mqtt?.brokerUrl;

// Variabel untuk temperatur (dari file asli Anda)
export const MQTT_TOPIC = extra.mqtt?.topic; 

// Variabel BARU untuk kelembapan (dari app.json)
export const MQTT_TOPIC_HUMIDITY = extra.mqtt?.topicHumidity;

export function assertConfig() {
  if (!BACKEND_URL) {
    console.warn("Backend URL missing from Expo config.");
  }
  // Pastikan kedua topik ada
  if (!MQTT_BROKER_URL || !MQTT_TOPIC || !MQTT_TOPIC_HUMIDITY) {
    console.warn("MQTT broker URL or topics missing from Expo config.");
  }
}