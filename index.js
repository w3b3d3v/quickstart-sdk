#!/usr/bin/env node

// Import from the new modular structure
const { init } = require("./src/cli");
const { displayWelcomeArt } = require("./src/utils/ascii-art");
const { setupFrontendWithPolkadotDapp } = require("./src/frontend/setup");

// Export functions for testing and backward compatibility
module.exports = {
  displayWelcomeArt,
  setupFrontendWithPolkadotDapp,
  init,
};

// Run the CLI if this file is executed directly
if (require.main === module) {
  init();
}
