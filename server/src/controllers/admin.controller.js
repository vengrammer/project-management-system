import User from "../model/User.js";

// const testing = async (req, res) => {
//   try {
//     const {name, email, password} = req.body;
 
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     const user = await Admin.create({ name, email, password });
//     res.status(201).json(user);
//     console.log("Send Successfully");
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   };
// };

// create account
const createAccount = async (req, res) => {
  try {
    const { fullname, department, role, email, username, password } = req.body;

    if (!fullname || !department || !role || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const account = await User.create({
      fullname,
      department,
      role,
      email,
      username,
      password,
    });

    res.status(201).json({
      message: "Account successfully saved!",
      account: {
        id: account._id,
        fullname: account.fullname,
        department: account.department,
        role: account.role,
        email: account.email,
        username: account.username,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {  createAccount };