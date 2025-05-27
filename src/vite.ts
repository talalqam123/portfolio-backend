import express, { type Express } from "express";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// These functions are now stubs since we're not serving the frontend from the backend
export async function setupVite(_app: Express, _server: any) {
  // No longer needed as frontend is separate
  return;
}

export function serveStatic(_app: Express) {
  // No longer needed as frontend is separate
  return;
}
