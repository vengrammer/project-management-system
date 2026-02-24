import app from "./App.js";
import connectDB from "./config/db.js";

const PORT = 5000;

connectDB();

http: app.listen(PORT, () => {
  console.log(`graphql running at http://localhost:${PORT}/graphql`);
});

