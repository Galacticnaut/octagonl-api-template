import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

/**
 * GET /v1/example
 * Example authenticated route — replace with your own.
 */
router.get("/", (req, res) => {
  const user = (req as AuthenticatedRequest).user;

  res.json({
    message: "Hello from Octagonl API",
    user: {
      oid: user.oid,
      email: user.email,
      name: user.name,
    },
  });
});

export default router;
