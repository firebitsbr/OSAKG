// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Synthetic authentication service entrypoint for testing code parsing
// License: MIT
// =====================================================================

// Synthetic Auth Service - Ground Truth Fixture
// Exposes /api/v1/auth/login and /api/v1/auth/verify

export interface LoginRequest {
  username: string;
  passwordHash: string;
}

export interface AuthToken {
  token: string;
  expiresIn: number;
}

export function handleLogin(req: LoginRequest): AuthToken {
  if (!req.username || !req.passwordHash) {
    throw new Error("Invalid credentials payload");
  }
  return {
    token: "synthetic-jwt-token-preview",
    expiresIn: 3600,
  };
}

export function verifyToken(token: string): boolean {
  return token.startsWith("synthetic-jwt-");
}

