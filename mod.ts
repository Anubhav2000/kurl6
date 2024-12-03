import { parse_curl } from 'curl-parser'; // Import from curl-parser package

async function runK6Test(curlCommand: string, options: Record<string, any>) {
    try {
        // Validate and set default values for options
        options.vus = options.vus ? parseInt(options.vus, 10) : 10; // Default VUs: 10
        options.duration = options.duration || "30s"; // Default duration: 30s
        options.iterations = options.iterations ? parseInt(options.iterations, 10) : undefined;

        // Parse the curl command using curl-parser
        const parsedCurl = parse_curl(curlCommand);

        // Generate the k6 script dynamically
        const k6Script = `
            import http from 'k6/http';
            import { sleep } from 'k6';

            export const options = {
                vus: ${options.vus}, // Number of Virtual Users
                duration: '${options.duration}', // Test Duration
                ${options.iterations ? `iterations: ${options.iterations},` : ""}
            };

            export default function () {
                const url = '${parsedCurl.url}';
                const params = ${JSON.stringify(parsedCurl.headers || {}, null, 2)};
                const payload = ${parsedCurl.data ? JSON.stringify(parsedCurl.data, null, 2) : 'null'};

                http.${parsedCurl.method.toLowerCase()}(url, payload, { headers: params });
                sleep(1);
            }
        `;

        console.log("Running k6 test...");

        // Spawn the k6 process with the script passed via stdin
        const process = Deno.run({
            cmd: ["k6", "run", "-"],
            stdin: "piped",
            stdout: "inherit",
            stderr: "inherit",
        });

        // Write the script to the stdin pipe
        const encoder = new TextEncoder();
        await process.stdin.write(encoder.encode(k6Script));
        process.stdin.close();

        const status = await process.status();
        if (!status.success) {
            console.error("k6 test failed.");
        }

        process.close();
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Command-line arguments
const args = Deno.args;

if (args.length < 1) {
    console.error(
        'Usage: deno run --allow-run mod.ts "<curl-command>" --vus=<number> --duration=<time> --iterations=<number> --out=<output>'
    );
    Deno.exit(1);
}

// Extract the curl command and options
const curlCommand = args[0];
const options = args.slice(1).reduce((acc, arg) => {
    const [key, value] = arg.split("=");
    acc[key.replace("--", "")] = value || true; // Convert "--key=value" to { key: value }
    return acc;
}, {});

// Run the test
await runK6Test(curlCommand, options);