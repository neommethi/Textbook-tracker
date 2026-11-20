import "dotenv/config";
import supabase from "./config/supabase.js";

console.log("URL being used:", process.env.SUPABASE_URL);
console.log(
  "Key starts with:",
  (process.env.SUPABASE_SECRET_KEY || "").slice(0, 10),
);

const result = await supabase
  .from("textbooks")
  .select("id", { count: "exact", head: true });

console.log("status:", result.status, result.statusText);
console.log("error:", result.error);
console.log("count:", result.count);
