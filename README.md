# DerpyJSON

DerpyJSON is a utility for cleaning and parsing malformed JSON strings. It aims to "underp" JSON that may have been poorly generated, such as JSON responses from large language models (LLMs) that might contain errors like trailing commas, missing brackets, unquoted keys, or embedded comments.

## Key Features

- **underp(str)**: Attempts to clean up the provided string so that it can be parsed as valid JSON. This includes fixing issues like:
  - Extracting the first valid JSON segment from a larger string.
  - Removing various types of comments (`//`, `#`, `/* ... */`).
  - Wrapping unquoted keys in double quotes.
  - Removing trailing commas.
  - Balancing unmatched brackets.

- **parse(str)**: Uses `underp` to clean up the input string and then attempts to parse it into a JavaScript object. If parsing fails, it logs a warning.

- **stringify(obj, space)**: A simple wrapper around `JSON.stringify` for pretty-printing JSON objects.

## When to Use DerpyJSON

DerpyJSON is particularly useful when working with JSON that may have been generated by a source that isn't fully reliable. Modern use cases include:

- **Salvaging bad LLM outputs**: Large language models might return JSON-like structures that don't quite conform to the JSON standard. DerpyJSON can help clean these outputs to make them usable in downstream applications.

- **Salvaging bad user-generated outputs**: If your app needs to accept JSON from untrusted sources, like a user writing in a text field, DerpyJSON can help clean up the JSON to make it usable.

## Example Usage

```typescript
import { DerpyJSON } from './DerpyJSON';

const malformedJson = `{
  foo: "bar", // comment
  baz: [1, 2, 3, ],
  qux: /* multi-line comment */ "quux"
}`;

const cleanedJson = DerpyJSON.underp(malformedJson);
console.log(cleanedJson); // Outputs the cleaned JSON string

const parsed = DerpyJSON.parse(malformedJson);
console.log(parsed); // Outputs the parsed JavaScript object
```

## More Examples of Malformed JSON Strings

DerpyJSON is designed to handle a variety of common issues that arise in JSON strings, particularly those generated by LLMs or non-strict APIs. Here are some additional examples of malformed JSON and how DerpyJSON helps.

### Example 1: LLM Responses with Extra Text

LLMs often return JSON-like responses with additional text:

```
"Sure, here's the json you requested:
```json
{
  unquotedKey: "value",
  "anotherKey": "value with trailing comma",
}
```"
```

In this case, DerpyJSON will:
- Extract the valid JSON segment from the surrounding text.
- Wrap `unquotedKey` in double quotes.
- Remove the trailing comma after `"value with trailing comma"`.

### Example 2: Mixed Comments

Comments are not allowed in JSON, but they often appear in loosely formatted JSON-like data:

```
{
  "key1": "value1", // Inline comment
  # Another type of comment
  "key2": "value2",
  /* Multi-line comment */
  "key3": "value3",
}
```

DerpyJSON will:
- Remove all types of comments (`//`, `#`, `/* ... */`).
- Remove the trailing comma after `"value3"`.

### Example 3: Unbalanced Brackets

Sometimes, JSON strings have unbalanced brackets, especially if generated programmatically:

```
{
  "key": "value",
  "list": [1, 2, 3
```

DerpyJSON will:
- Balance the brackets by adding the missing `]` and `}`.
- The resulting JSON will be:
  ```
  {
    "key": "value",
    "list": [1, 2, 3]
  }
  ```

### Example 4: Missing Quotes Around Keys

Keys in JSON must be quoted, but they are often left unquoted in malformed data:

```
{
  unquotedKey: "value",
  anotherKey: 123,
}
```

DerpyJSON will:
- Wrap `unquotedKey` and `anotherKey` in double quotes.
- Remove the trailing comma after `123`.

### Example 5: Trailing Commas

Trailing commas are not allowed in JSON but are a common mistake:

```json
{
  "key1": "value1",
  "key2": "value2",
}
```

DerpyJSON will:
- Remove the trailing comma after `"value2"`.

### Example 6: Extra Text Before/After JSON

Sometimes, JSON is embedded in additional text, especially in responses from chatbots or logs:

```
Here is the data you requested:
{
  "key": "value"
}
Thanks for using our service!
```

DerpyJSON will:
- Extract the JSON segment (`{
  "key": "value"
}`) from the surrounding text.

## Methods Overview

- **underp(str: string | null): any**
  - Cleans up a JSON-like string, fixing common issues to make it parseable.

- **parse(str: string): any**
  - Cleans up the string using `underp` and then parses it. If parsing fails, it returns `null` and logs a warning.

- **stringify(obj: any, space?: any): string**
  - Converts a JavaScript object to a JSON string, with optional pretty-print spacing.

## Contributing

If you find an edge case that DerpyJSON cannot handle, contributions are welcome! Please submit an issue or a pull request to help improve the utility.

## License

MIT License.
