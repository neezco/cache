/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ["main", { name: "beta", prerelease: "beta", channel: "beta" }],
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "🚀 New Features", hidden: false },
            { type: "fix", section: "🐞 Bug Fixes", hidden: false },
            { type: "docs", section: "📚 Documentation Improvements", hidden: false },
            { type: "style", section: "🎨 Code Style & Formatting", hidden: false },
            { type: "refactor", section: "🔧 Code Refactoring", hidden: false },
            { type: "perf", section: "⚡ Performance Improvements", hidden: false },
            { type: "test", section: "🧪 Test Updates", hidden: false },
            { type: "chore", section: "🌀 Miscellaneous", hidden: false },
          ],
        },
      },
    ],
    ["@semantic-release/npm", { npmPublish: true }],
    [
      "@semantic-release/github",
      {
        assets: ["dist/**/*", "docs/**/*", "package.json", "CHANGELOG.md", "README.md", "LICENSE"],
      },
    ],
  ],
};
