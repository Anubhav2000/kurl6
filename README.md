Here’s the updated README.md for kurl6 to reflect the correct project name:

kurl6

Convert curl Commands into k6 Performance Testing Scripts

kurl6 is a CLI tool designed for developers and DevOps engineers to easily convert curl commands into k6 performance testing scripts. With this tool, you can seamlessly transform ad-hoc HTTP requests into full-fledged load testing scripts for k6.

Features

	•	📜 Convert curl commands into reusable k6 scripts.
	•	🖹 Supports multiple requests for testing workflows.
	•	⚡ Customize virtual users and durations with CLI options.
	•	🛠️ Generate scripts only or run tests directly with k6.
	•	🔐 Supports authentication headers with tokens.

Installation

Using npm:

npm install -g kurl6

Usage

Basic Conversion:

Convert a simple curl command to a k6 script:

kurl6 "curl -X GET https://example.com" --generate-only

Run Directly with k6:

Execute the generated k6 script with the specified options:

kurl6 "curl -X POST https://example.com -d 'key=value'" --vus=10 --duration=30s

Command-Line Options:

	•	--vus (optional): Number of Virtual Users (default: 10).
	•	--duration (optional): Test duration (default: 30s).
	•	--iterations (optional): Number of iterations.
	•	--generate-only: Output the generated script without running it.
	•	--token (optional): Bearer token for authorization.

Example:

kurl6 "curl -X GET https://api.example.com/data" --vus=50 --duration=1m --token=your-token

How It Works

	1.	Parses the curl command(s) provided as input.
	2.	Converts the HTTP method, URL, headers, and data into a structured k6 script.
	3.	Dynamically generates k6 scenarios for load testing.
	4.	Runs the script or outputs it based on the CLI options.

Generated Script Example

Given the command:

kurl6 "curl -X GET https://example.com -H 'Authorization: Bearer token'"

The tool generates:

import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const url = "https://example.com";
  const params = { headers: { Authorization: "Bearer token" } };
  http.get(url, params);
  sleep(1);
}

Contributing

Contributions are welcome! To get started:
	1.	Fork the repository.
	2.	Create a feature branch (git checkout -b feature-name).
	3.	Commit your changes (git commit -m "Add feature").
	4.	Push to the branch (git push origin feature-name).
	5.	Open a pull request.

License

This project is licensed under the MIT License. See the LICENSE file for details.

Feedback and Support

If you encounter any issues or have suggestions, feel free to:
	•	Open an issue on GitHub.
	•	Reach out on social media.

By sharing and using kurl6, you’re helping make performance testing more accessible for everyone! 🚀