const fs = require("fs");
const path = require("path");
const { DerpyJSON } = require("../dist/index.js");

console.log("🚀 Loading test cases...");

function loadTestCases() {
  const testCasesFile = fs.readFileSync(
    path.join(__dirname, "test-cases.txt"),
    "utf8"
  );
  return testCasesFile
    .split("\n---\n")
    .map((testCase, index) => {
      const lines = testCase.trim().split("\n");
      const metadata = {};

      // Parse metadata
      while (lines.length && lines[0].startsWith("#")) {
        const [key, ...value] = lines[0].substring(1).split(" ");
        metadata[key.toLowerCase()] = value.join(" ");
        lines.shift();
      }

      return {
        name: metadata.title || `Test case #${index + 1}`,
        input: lines.join("\n"),
        expect: metadata.expect ? JSON.parse(metadata.expect) : null,
      };
    })
    .filter((testCase) => testCase.input.trim() && testCase.expect);
}

const testCases = loadTestCases();
let failures = 0;

testCases.forEach(({ name, input, expect }) => {
  console.log(`\n🔍 Testing: ${name}`);

  try {
    const parsed = DerpyJSON.parse(input);
    const isEqual = JSON.stringify(parsed) === JSON.stringify(expect);

    if (!isEqual) {
      console.log(`❌ Test failed`);
      console.log("🎯 Expected:", JSON.stringify(expect, null, 2));
      console.log("📄 Got:", JSON.stringify(parsed, null, 2));
      failures++;
    } else {
      console.log("✅ Test passed");
    }
  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`);
    failures++;
  }
});

if (failures === 0) {
  console.log("\n🎉 All tests passed!");
} else {
  console.log(`\n❌ ${failures} test${failures === 1 ? "" : "s"} failed`);
  process.exit(1);
}
