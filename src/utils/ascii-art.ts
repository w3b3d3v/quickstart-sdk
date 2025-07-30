import figlet from "figlet";

/**
 * Display welcome ASCII art and logo
 */
export function displayWelcomeArt(): Promise<void> {
  return new Promise((resolve, reject) => {
    figlet(
      "POLKADOT CLOUD STARTER",
      {
        font: "Small",
        horizontalLayout: "universal smushing",
        verticalLayout: "default",
        width: 120,
      },
      (err: Error | null, data?: string) => {
        if (err) {
          console.log("Something went wrong with figlet...");
          console.dir(err);
          reject(err);
          return;
        }

        if (!data) {
          reject(new Error("No data returned from figlet"));
          return;
        }

        const logo: string[] = [
          "             ..            ",
          "             ::::..        ",
          "          .:;;::::.        ",
          "     .+XXXXXXx;:::.        ",
          "     .:::;+xxXXx+;.        ",
          "     .::::::::;;:..        ",
          "     .:::::::::::::::.     ",
          "     ...:;+;:::::::::..    ",
          " .:+xxXXXXXXXxx+;::::..    ",
          " .:+++++++xxxXXXXXX+;..    ",
          " .:++++++++++++++;::..     ",
          "  .:;+++++++++++++++++++:. ",
          "    ....:+x+++++++++++++;. ",
          "   .+xxxxXXXXXXxxxx+++++;. ",
          "   .++++++++xxXXXXXXXXx+:. ",
          "   .++++++++++:..          ",
          "   ..:;++++++;             ",
          "         ..:;;             ",
        ];

        // Split the figlet text into lines
        const textLines = data.trim().split("\n");
        const terminalWidth = process.stdout.columns || 120;

        // Center the logo
        const centerLogo = (lines: string[]): string[] => {
          const maxLength = Math.max(...lines.map((line) => line.length));
          const padding = Math.max(
            0,
            Math.floor((terminalWidth - maxLength) / 2)
          );
          return lines.map((line) => " ".repeat(padding) + line);
        };

        // Center the text
        const centerText = (lines: string[]): string[] => {
          const maxLength = Math.max(...lines.map((line) => line.length));
          const padding = Math.max(
            0,
            Math.floor((terminalWidth - maxLength) / 2)
          );
          return lines.map((line) => " ".repeat(padding) + line);
        };

        console.log("\n");

        // Display the logo horizontally first
        const centeredLogo = centerLogo(logo);
        centeredLogo.forEach((line) => console.log(line));

        console.log("\n");

        // Then display the centered text
        const centeredText = centerText(textLines);
        centeredText.forEach((line) => console.log(line));

        console.log(
          "\nWelcome to Polkadot Cloud Project Starter by ⚡WEB3DEV ⚡\n"
        );
        resolve();
      }
    );
  });
}
