import select from "@inquirer/select";
import input from "@inquirer/input";
import tiged from "tiged";
import { getAvailableBoxes, replacePaths } from "../utils.js";
import chalk from "chalk";
import axios from "axios";
const { log } = console;

export async function chooseAndCloneBox(tag, version) {
  const availableBoxes = await getAvailableBoxes(tag, version);
  const appType = await select({
    message: `Please choose your Aztec boilerplate:`,
    choices: availableBoxes.map((box) => {
      return { value: box.name, name: box.description };
    }),
  });

  if (appType === "skip") return;

  log(chalk.yellow(`You chose: ${appType}`));

  try {
    // STEP 1: Clone the box
    const appName = await input({
      message: "Your app name:",
      default: "my-aztec-app",
    });

    chalk.blue("Cloning the boilerplate code...");
    const emitter = tiged(
      // same as the nargo dependencies above:
      // "master" and "latest" both mean "master" for the github repo
      // but if the user has set a semver version, we want that tag (i.e. aztec-packages-v0.23.0)
      `AztecProtocol/aztec-packages/boxes/${appType}${["latest", "master"].includes(tag) ? "" : `#${tag}`}`,
    );

    emitter.on("info", (info) => {
      log(info.message);
    });

    await emitter.clone(`./${appName}`).then(() => {
      replacePaths(`./${appName}`, tag, version);
      log(chalk.bgGreen("Your code is ready!"));
    });
  } catch (error) {
    log(chalk.bgRed(error.message));
    process.exit(1);
  }
}
