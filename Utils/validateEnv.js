import dotenv from "dotenv";

dotenv.config({ quiet: true });

const REQUIRED_ENV_VARS = [
  "DATABASE",
  "PORT",
  "JWT_SECRET",
  "CLIENT_URL",
];

export const validateEnv = () => {
  const missing = [];
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar] || !process.env[envVar].trim()) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("FATAL CONFIG ERROR: Missing required environment variables:");
    missing.forEach((v) => console.error(`  - ${v}`));
    console.error("Server execution halted for security. Please set these in your .env file.");
    process.exit(1);
  }

  // Ensure JWT_SECRET has sufficient entropy
  if (process.env.JWT_SECRET.length < 10) {
    console.error("FATAL CONFIG ERROR: JWT_SECRET is too short (minimum 10 characters required).");
    process.exit(1);
  }
};
