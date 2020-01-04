"use strict";

const execa = require("execa");
const semver = require("semver");

(async () => {
  const { stdout } = await execa(`${__dirname}/gradlew`, ["-q", "showVersion"]);
  let [, clutzVersion, clutzGitCommit, closureVersion] = /^([\d.]+):(\w+):(.+)$/.exec(stdout);
  const clutzSemver = semver.coerce(clutzVersion);
  const { major, minor, patch, prerelease } = semver(require(`${__dirname}/package.json`).version);
  if (major === clutzSemver.major && minor === clutzSemver.minor) {
    if (prerelease.length > 0) {
      // bump patch version
      clutzVersion = `${major}.${minor}.${patch + 1}`;
    } else {
      // first version
      clutzVersion = `${major}.${minor}.${patch}`;
    }
  } else {
    // use clutz version
    clutzVersion = clutzSemver.toString();
  }
  if (closureVersion === "1.0-SNAPSHOT") {
    closureVersion = `v${new Date()
      .toISOString()
      .replace(/\..*$/, "")
      .replace(/[-:]/g, "")}`;
  }
  const newVersion = `${clutzVersion}-${clutzGitCommit}.${closureVersion}`;
  await execa("npm", ["version", newVersion]);
  console.log(`bump version to v${newVersion}`);
})();
