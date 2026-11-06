// Single source of truth for the JWT secret so signing and verifying always match.
// Set JWT_SECRET in backend/.env for production.
const jwtSecret =
  process.env.JWT_SECRET ||
  'f2f196462f5247b49f94033b16bde25403a4d4efbcc684f65667f180d1619aae932888d4998a183e5f9d1c9c4a4203427a1cb6863f94cdb8642487ce0e02b214';

module.exports = { jwtSecret };
