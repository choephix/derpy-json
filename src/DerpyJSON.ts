export namespace DerpyJSON {
  export function underp(str: string | null): any {
    if (str === null) return null;
    
    str = extractFirstJsonSegment(str);
    if (str === null) return null;

    str = removeComments(str);

    str = wrapJSONKeys(str);

    str = removeTrailingCommas(str);

    str = balanceBrackets(str);

    return str;
  }

  export function parse(str: string): any {
    str = underp(str);
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn("Unable to parse JSON segment:\n\n", str, e);
      return null;
    }
  }

  export function stringify(obj: any, space?: any): string {
    return JSON.stringify(obj, null, space);
  }
}

function extractFirstJsonSegment(str: string): string | null {
  const startIndex = str.indexOf("{");
  if (startIndex === -1) return null;

  let bracketCount = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "{") bracketCount++;
    else if (str[i] === "}") bracketCount--;

    if (bracketCount === 0) {
      return str.slice(startIndex, i + 1);
    }
  }

  return str.slice(startIndex);
}

function removeComments(str: string): string {
  // Remove // comments
  str = str.replace(/\/\/.*$/gm, "");
  // Remove # comments
  str = str.replace(/#.*$/gm, "");
  // Remove /* */ comments
  str = str.replace(/\/\*[\s\S]*?\*\//g, "");
  return str;
}

function balanceBrackets(str: string): string {
  // Function to check if a string is valid JSON
  function isValidJSON(s: string): boolean {
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  }

  // Function to calculate debt for a given substring
  function calculateDebt(substr: string): string {
    let stack: string[] = [];
    for (const char of substr) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" || char === "]") {
        if (
          stack.length === 0 ||
          (char === "}" && stack[stack.length - 1] !== "{") ||
          (char === "]" && stack[stack.length - 1] !== "[")
        ) {
          // Unmatched closing bracket, ignore it
          continue;
        }
        stack.pop();
      }
    }
    return stack
      .map((b) => (b === "{" ? "}" : "]"))
      .reverse()
      .join("");
  }

  // Start from the end and work backwards to find the largest valid JSON string
  for (let i = str.length; i >= 0; i--) {
    const substr = str.slice(0, i);
    const debt = calculateDebt(substr);
    const candidate = substr + debt;
    if (isValidJSON(candidate)) {
      return candidate;
    }
  }

  // If no valid JSON found, return the original string with its debt
  return str + calculateDebt(str);
}

function wrapJSONKeys(str: string): string {
  // Regular expression to match potential JSON keys
  // This regex looks for:
  // 1. Word boundary or start of string
  // 2. A key that can contain letters, numbers, underscores, or hyphens
  // 3. Followed by a colon
  // 4. Not already wrapped in quotes
  const keyRegex = /(?<=^|\s|,|\{)([a-zA-Z0-9_-]+)(?=\s*:)/g;

  // Replace all matches with the same key wrapped in double quotes
  return str.replace(keyRegex, '"$1"');
}

function removeTrailingCommas(jsonString: string): string {
  // Remove trailing commas from objects
  jsonString = jsonString.replace(/,+\s*}/g, "}");

  // Remove trailing commas from arrays
  jsonString = jsonString.replace(/,+\s*\]/g, "]");

  // Remove trailing commas after property values, but not after property names
  jsonString = jsonString.replace(/,(\s*[\]}])/g, "$1");

  return jsonString;
}

export default DerpyJSON;