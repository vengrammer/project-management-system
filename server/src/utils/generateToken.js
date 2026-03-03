import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const now = new Date();

  // Set next midnight
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  // Calculate seconds until midnight
  const secondsUntilMidnight = Math.floor((midnight - now) / 1000);

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: secondsUntilMidnight,//expire the token every
  });
};

export default generateToken;
