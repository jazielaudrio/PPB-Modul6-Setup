import { supabase } from "../config/supabaseClient.js";

const TABLE = "humidity_readings"; // Diubah

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    humidity: row.humidity === null ? null : Number(row.humidity), // Diubah
  };
}

export const HumidityReadingsModel = { // Diubah
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, humidity, recorded_at") // Diubah
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, humidity, recorded_at") // Diubah
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  async create(payload) {
    const { humidity } = payload; // Diubah

    if (typeof humidity !== "number") { // Diubah
      throw new Error("humidity must be a number"); // Diubah
    }

    const newRow = {
      humidity, // Diubah
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(newRow)
      .select("id, humidity, recorded_at") // Diubah
      .single();

    if (error) throw error;
    return normalize(data);
  },
};