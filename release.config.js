/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ["main", { name: "develop", prerelease: "beta", channel: "beta" }],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: true }],
    ["@semantic-release/git", { assets: ["CHANGELOG.md"] }],
    "@semantic-release/github",
  ],
};
