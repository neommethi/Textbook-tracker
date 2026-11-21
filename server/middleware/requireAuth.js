import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in server/.env");
}

// Checks the login token and sets req.user = { id, role }.
// Rules we agreed with Neo:
//  - the login route signs a token whose payload has { id, role }
//  - it is signed with JWT_SECRET from .env
//  - the browser sends it as:  Authorization: Bearer <token>
export default function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please log in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!payload.id || !payload.role) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
