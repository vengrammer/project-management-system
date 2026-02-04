import Admin from "../model/Admin.js";

const testing = async (req, res) => {
  try {
    const {name, email, password} = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await Admin.create({ name, email, password });
    res.status(201).json(user);
    console.log("Send Successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  };
};
// Export functions
export { testing };