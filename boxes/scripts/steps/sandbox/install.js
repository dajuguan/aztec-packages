import confirm from "@inquirer/confirm";
import { execSync } from "child_process";
import pty from "node-pty";
import { updatePathEnvVar } from "../../utils.js";
import chalk from "chalk";
const { log } = console;

const runPty = async (command, { success, error }) => {
  try {
    const ptySession = new Promise((resolve, reject) => {
      const ptyProcess = pty.spawn("bash", [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env,
      });

      ptyProcess.on("data", function (data) {
        process.stdout.write(data);
      });

      ptyProcess.write(command);

      ptyProcess.on("exit", function (exitCode, signal) {
        updatePathEnvVar();
        resolve();
        if (exitCode === 0) {
          log(chalk.bgGreen(success));
        } else {
          reject(chalk.bgRed(error));
        }
      });
    });

    await ptySession;
  } catch (error) {
    log(chalk.bgRed(error));
  }
};

export async function sandboxInstallOrUpdate(stable, version) {
  // Checking for docker
  try {
    execSync("docker info >/dev/null 2>&1");
  } catch (error) {
    log(
      chalk.bgRed(
        "Doesn't seem like Docker is installed or running. Please start it or visit https://docs.aztec.network for more information",
      ),
    );
    process.exit(1);
  }

  let sandboxVersion;
  try {
    const dockerOutput = execSync(
      "docker image inspect aztecprotocol/aztec 2>&1",
      {
        encoding: "utf8",
      },
    );
    sandboxVersion = JSON.parse(dockerOutput)[0]
      .Config.Env.find((env) => env.includes("COMMIT_TAG"))
      .split("=")[1];
    console.log(sandboxVersion);
  } catch (error) {
    sandboxVersion == null;
  }

  // Checking for the Aztec Sandbox
  if (!sandboxVersion) {
    const answer = await confirm({
      message:
        "Seems like you don't have the Aztec Sandbox installed. Do you want to install it?",
      default: true,
    });

    if (answer) {
      await runPty(
        "echo y | bash -i <(curl -s install.aztec.network); exit\n",
        {
          success: "The Sandbox is installed!",
          error:
            "Failed to install the Sandbox. Please visit the docs at https://docs.aztec.network",
        },
      );
    }
  } else if (
    sandboxVersion === stable &&
    sandboxVersion !== version &&
    !["latest", "master"].includes(version)
  ) {
    const answer = await confirm({
      message: `The sandbox is version ${sandboxVersion} but your chosen version is ${version}. Do you want to install version ${version}?`,
      default: true,
    });

    if (answer) {
      execSync(
        `${["latest", "master"].includes(version) ? "VERSION=master" : ""} $HOME/.aztec/bin/aztec-up`,
        { stdio: "inherit" },
      );
    }
  } else if (sandboxVersion !== stable) {
    const answer = await confirm({
      message: `The Sandbox is not up to date. Do you want to update it to ${stable}?`,
      default: true,
    });

    if (answer) {
      execSync(
        `${["latest", "master"].includes(version) ? "VERSION=master" : ""} $HOME/.aztec/bin/aztec-up latest`,
        { stdio: "inherit" },
      );
    }
  }
}
