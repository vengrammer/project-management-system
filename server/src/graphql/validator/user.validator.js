// validators/user.validator.js
import { z } from "zod";

export const userValidator = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(5, "Username must be at least 6 characters").max(30),
  password: z.string().min(5, "Password must be at least 6 characters"),
  department: z.string(z.string()),
  role: z.string(z.enum(["admin", "manager", "user"])).default(["user"]),
});