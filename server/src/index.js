import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST, before any other imports
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log(
  "[index.js] dotenv.config called, JWT_SECRET:",
  !!process.env.JWT_SECRET,
);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not found in .env file");
}

import app from "./App.js";
import connectDB from "./config/db.js";

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`graphql running at http://localhost:${PORT}/graphql`);
});
