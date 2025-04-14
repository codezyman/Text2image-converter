import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.headers.token || req.query.token;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    console.log("Received token:", token);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return res.json({ success: false, message: "Internal Server Error" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      // Ensure req.body is defined
      req.body = req.body || {};
      req.body.userId = tokenDecode.id;
      next();
    } else {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
