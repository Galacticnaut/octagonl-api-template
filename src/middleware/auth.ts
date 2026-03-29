import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Request, Response, NextFunction } from "express";
import { getEnv } from "../config.js";

// ── Types ───────────────────────────────────────────────────

export interface AuthenticatedUser {
  /** Entra Object ID – stable across all Octagonl apps */
  oid: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// ── JWKS cache ──────────────────────────────────────────────

let _jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let _issuer: string | undefined;

async function getOidcConfig() {
  if (_jwks && _issuer) return { jwks: _jwks, issuer: _issuer };

  const env = getEnv();
  const metadataUrl =
    env.OIDC_ISSUER.replace(/\/$/, "") +
    "/.well-known/openid-configuration";
  const res = await fetch(metadataUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch OIDC metadata from ${metadataUrl}: ${res.status}`,
    );
  }
  const metadata = (await res.json()) as {
    jwks_uri: string;
    issuer: string;
  };

  _jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
  _issuer = metadata.issuer;

  return { jwks: _jwks, issuer: _issuer };
}

// ── Middleware ───────────────────────────────────────────────

export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.slice(7);
    const env = getEnv();

    try {
      const { jwks, issuer } = await getOidcConfig();
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: env.OIDC_AUDIENCE,
        clockTolerance: 30,
      });

      // Use oid claim (NOT sub) as stable identity
      const oid = (payload as JWTPayload & { oid?: string }).oid;
      if (!oid) {
        res.status(401).json({ error: "Token missing oid claim" });
        return;
      }

      (req as AuthenticatedRequest).user = {
        oid,
        email:
          ((payload as Record<string, unknown>).email as string | undefined) ??
          ((payload as Record<string, unknown>).preferred_username as
            | string
            | undefined),
        name: (payload as Record<string, unknown>).name as string | undefined,
      };

      next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Token validation failed";
      res.status(401).json({ error: message });
    }
  };
}
