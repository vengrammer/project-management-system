const generateToken = (id) => {
  const now = new Date();

  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // next midnight

  const secondsUntilMidnight = Math.floor((midnight - now) / 1000);

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: secondsUntilMidnight,
  });
};