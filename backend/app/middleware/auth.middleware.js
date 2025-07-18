import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) return res.sendStatus(403);
    console.log("auth error:", err);

    req.user = decodedUser;
    next();
  });
}
