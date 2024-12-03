export namespace DerpyJSON {
  export function underp(str: string | null): any {
    if (str === null) return null;
    
    str = extractFirstJsonSegment(str);
    if (str === null) return null;

    str = removeComments(str);

    str = wrapJSONKeys(str);
    
    str = normalizeValues(str);

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
  // First handle unquoted keys
  str = str.replace(/(?<=^|\s|,|\{)([a-zA-Z0-9_-]+)(?=\s*:)/g, '"$1"');
  
  // Then handle single-quoted keys
  str = str.replace(/(?<=^|\s|,|\{)'([^']+)'(?=\s*:)/g, '"$1"');
  
  return str;
}

function normalizeValues(str: string): string {
  // Replace unquoted values (excluding numbers, true, false, null, and nested objects/arrays)
  str = str.replace(/:\s*([a-zA-Z][a-zA-Z0-9_-]*)(?=\s*[,}])/g, ': "$1"');
  
  // Replace single-quoted values with double quotes
  str = str.replace(/:\s*'([^']*)'(?=\s*[,}])/g, ': "$1"');
  
  return str;
}

function removeTrailingCommas(jsonString: string): string {
  // Remove multiple trailing commas from objects and arrays
  // First, handle nested structures
  jsonString = jsonString.replace(/,+(\s*[}\]])/g, "$1");
  
  // Handle multiple commas between values
  jsonString = jsonString.replace(/,+(\s*["'\w{[])/g, ",$1");
  
  // Clean up any remaining multiple commas
  jsonString = jsonString.replace(/,+/g, ",");

  return jsonString;
}

export default DerpyJSON;