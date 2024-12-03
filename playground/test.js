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
        metadata[key.toLowerCase()] = value.join(" ").trim() || true;
        lines.shift();
      }

      return {
        name: metadata.title || `Test case #${index + 1}`,
        input: lines.join("\n"),
        expect: metadata.expect ? JSON.parse(metadata.expect) : null,
        disabled: !!metadata.disable,
      };
    })
    // Filter out disabled tests and empty/invalid tests
    .filter((testCase) => !testCase.disabled && testCase.input.trim() && testCase.expect);
}

const testCases = loadTestCases();
let failures = [];
let results = [];

testCases.forEach(({ name, input, expect }) => {
  try {
    const parsed = DerpyJSON.parse(input);
    const isEqual = JSON.stringify(parsed) === JSON.stringify(expect);

    if (!isEqual) {
      results.push(`❌ ${name}`);
      failures.push({
        input,
        name,
        expected: expect,
        received: parsed
      });
    } else {
      results.push(`✅ ${name}`);
    }
  } catch (error) {
    results.push(`❌ ${name}`);
    failures.push({
      input,
      name,
      error: error.message
    });
  }
});

// Print summary first
console.log("\n📊 Test Results Summary:");
results.forEach(result => console.log(result));

// Then print detailed failures if any
if (failures.length > 0) {
  console.log("\n🔍 Failure Details:");
  failures.forEach(failure => {
    console.log(`\n📌 ${failure.name}`);
    if (failure.error) {
      console.log(`💥 Error: ${failure.error}`);
    } else {
      console.log("📄 Input was:\n", failure.input);
      console.log("🎯 Expected:\n", JSON.stringify(failure.expected, null, 2));
      console.log("🔴 Got:\n", JSON.stringify(failure.received, null, 2));
    }
  });
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed!");
}
