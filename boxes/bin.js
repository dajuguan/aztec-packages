#!/usr/bin/env node
import { Command } from "commander";
const program = new Command();
import path from "path";
import os from "os";
import axios from "axios";
import { chooseAndCloneBox } from "./scripts/steps/chooseBox.js";
import { sandboxRun } from "./scripts/steps/sandbox/run.js";
import { sandboxInstallOrUpdate } from "./scripts/steps/sandbox/install.js";

const { GITHUB_TOKEN } = process.env;

const axiosOpts = {};
if (GITHUB_TOKEN) {
  axiosOpts.headers = { Authorization: `token ${GITHUB_TOKEN}` };
}

const { data } = await axios.get(
  `https://api.github.com/repos/AztecProtocol/aztec-packages/releases`,
  axiosOpts,
);

// versioning is confusing here because "latest" and "master" point to the same thing at times
// so let's clarify a bit:
//
// if the user has set a version (ex. "master" or "0.23.0"), use that
// otherwise use the stable release (ex. 0.24.0)
const stable = `${data[0].tag_name.split("-v")[1]}`;
const version = process.env.VERSION || stable;

// if the user has set a semver version (matches the regex), fetch that tag (i.e. aztec-packages-v0.23.0)
// otherwise use the version as the tag
const tag = version.match(/^\d+\.\d+\.\d+$/)
  ? `aztec-packages-v${version}`
  : version;

program.action(async () => {
  // STEP 1: Choose the boilerplate
  await chooseAndCloneBox(tag, version);

  // STEP 2: Install the Sandbox
  await sandboxInstallOrUpdate(stable, version);

  // STEP 3: Running the Sandbox
  await sandboxRun(version);
});

program.parse();
