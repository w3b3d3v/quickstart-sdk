#!/usr/bin/env node

// Import from the modular TypeScript structure
import { init } from "./cli";
import { displayWelcomeArt } from "./utils/ascii-art";
import { setupFrontendWithPolkadotDapp } from "./frontend/setup";

// Export functions for testing and backward compatibility
export { displayWelcomeArt, setupFrontendWithPolkadotDapp, init };

// Run the CLI if this file is executed directly
if (require.main === module) {
  init().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
