#!/usr/bin/env node

// Import from the compiled TypeScript modules
const {
  init,
  displayWelcomeArt,
  setupFrontendWithPolkadotDapp,
} = require("./dist/index");

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
