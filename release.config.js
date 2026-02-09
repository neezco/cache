/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ["main", { name: "develop", prerelease: "beta", channel: "beta" }],
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        changelogFile: "CHANGELOG.md",
        writerOpts: {
          types: [
            { type: "feat", section: "✨ Features", hidden: false },
            { type: "fix", section: "🐛 Fixes", hidden: false },
            { type: "docs", section: "📝 Documentation", hidden: false },
            { type: "style", section: "💈 Styling", hidden: false },
            { type: "refactor", section: "⚡ Refactoring", hidden: false },
            { type: "perf", section: "⏩ Performance", hidden: false },
            { type: "test", section: "✅ Tests", hidden: false },
            { type: "chore", section: "🛠️ Internal", hidden: false },
          ],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle:
          "# Changelog\n\nAll notable changes to this project will be documented in this file.",
      },
    ],
    ["@semantic-release/npm", { npmPublish: true }],
    ["@semantic-release/git", { assets: ["CHANGELOG.md"] }],
    "@semantic-release/github",
  ],
};
