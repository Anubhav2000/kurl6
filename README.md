curl-to-k6

curl-to-k6 is a Deno-based tool that simplifies the creation of performance tests using k6. It converts curl commands into dynamically generated k6 scripts and optionally executes them or outputs the script for further use. This tool is ideal for developers who want to quickly generate load-testing scripts from curl commands.

Features

	•	Convert one or multiple curl commands into k6 scripts.
	•	Automatically handle common k6 test parameters like vus, duration, and scenarios.
	•	Support for token-based authentication.
	•	Generate k6 scripts without executing (--generate-only).
	•	Seamlessly run tests without creating temporary files.

Requirements

	•	Deno: Ensure you have Deno installed. Install Deno
	•	k6: Install the k6 CLI. Install k6

Installation

Clone the repository or copy the mod.ts file into your project.

git clone https://github.com/your-repo/curl-to-k6.git
cd curl-to-k6

Usage

Command Syntax

deno run --allow-run mod.ts '<curl-command>' [options]

Options

Option	Description	Default
--vus	Number of virtual users	10
--duration	Duration of the test (e.g., 30s, 2m)	30s
--generate-only	Output the k6 script instead of running it	false
--token	Authorization token for requests	null

Examples

1. Generate a k6 Script from a Single Curl Command

deno run --allow-run mod.ts "curl -X GET https://example.com" --generate-only

Output:

import http from "k6/http";
import { sleep } from "k6";

export const options = {
    scenarios: {
        scenario0: { executor: "constant-vus", vus: 10, duration: "30s", exec: "scenario0" },
    },
};

export function scenario0() {
    const url = "https://example.com";
    const params = { headers: {} };
    const payload = null;
    http.get(url, payload, params);
}

export default function () {
    sleep(1);
}

2. Run a Test from a Single Curl Command

deno run --allow-run mod.ts "curl -X GET https://example.com" --vus=50 --duration=2m

This runs a k6 test with 50 virtual users for 2 minutes.

3. Handle Token-Based Authentication

deno run --allow-run mod.ts "curl -X GET https://example.com" --token="my-auth-token"

Generates requests with the following header:

{ Authorization: "Bearer my-auth-token" }

4. Chain Multiple Curl Commands

deno run --allow-run mod.ts \
  "curl -X POST https://example.com/login" \
  "curl -X GET https://example.com/data" \
  "curl -X POST https://example.com/logout" \
  --vus=10 --duration=1m

Generates a script where each scenario runs the respective curl command.

5. Pipe Results to a File

deno run --allow-run mod.ts "curl -X GET https://example.com" --vus=10 --duration=1m --generate-only > test.js

Notes

	•	Use the --generate-only flag to create reusable scripts for more complex workflows.
	•	The cmd argument in Deno’s Deno.run() expects k6 to be in your system’s PATH.
	•	Ensure proper permissions by including --allow-run when running with Deno.

Contributing

We welcome contributions to enhance curl-to-k6. Feel free to submit issues or pull requests to the repository.

License

This project is licensed under the MIT License.

With curl-to-k6, you can accelerate performance testing by effortlessly generating k6 scripts from curl commands. 🚀