import confirm from "@inquirer/confirm";
import { execSync } from "child_process";
import chalk from "chalk";
const { log } = console;

export async function sandboxRun(version) {
  try {
    await fetch("http://localhost:8080", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "node_getVersion",
        id: "null",
      }),
    });
  } catch (error) {
    const answer = await confirm({
      message:
        "I can't reach the Sandbox on port 8080. Do you want to start it?",
      default: true,
    });

    if (answer) {
      log(
        chalk.green("Starting the sandbox... This might take a few minutes."),
      );
      log(chalk.bgGreen(`Go and explore the boilerplate code while you wait!`));
      execSync(
        `${["latest", "master"].includes(version) ? "VERSION=master" : ""} $HOME/.aztec/bin/aztec sandbox`,
        { stdio: "inherit" },
      );
    }
  }
}
