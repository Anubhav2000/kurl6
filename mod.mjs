#!/usr/bin/env node
import { parse_curl } from "curl-parser"; // Import from curl-parser package

async function runK6Test(commands: string[], options: Record<string, any>) {
    try {
        // Parse all curl commands
        const parsedCommands = commands.map((cmd) => parse_curl(cmd));

        // Generate the k6 script dynamically
        const k6Script = generateK6Script(parsedCommands, options);

        console.log(options);

        // If --generate-only is passed, output the script and exit
        if (options.generateOnly) {
            console.log(k6Script);
            return;
        }

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

function generateK6Script(parsedCommands: any[], options: Record<string, any>): string {
    const authHeader = options.token
        ? `{ Authorization: \`Bearer ${options.token}\` }`
        : "{}";

    // Generate scenarios for multiple commands
    const scenarios = parsedCommands.map((cmd, index) => `
        export function scenario${index}() {
            const url = '${cmd.url}';
            const params = { headers: ${authHeader} };
            const payload = ${cmd.data ? JSON.stringify(cmd.data, null, 2) : "null"};
            http.${cmd.method.toLowerCase()}(url, payload, params);
        }
    `).join("\n");

    const scenariosConfig = parsedCommands.map((_, index) => `
        scenario${index}: { executor: "constant-vus", vus: ${options.vus}, duration: "${options.duration}", exec: "scenario${index}" },
    `).join("\n");

    return `
        import http from "k6/http";
        import { sleep } from "k6";

        export const options = {
            scenarios: {
                ${scenariosConfig}
            },
        };

        ${scenarios}

        export default function () {
            sleep(1);
        }
    `;
}

function parseArguments(args: string[]): { commands: string[]; options: Record<string, any> } {
    const commands = [];
    const options: Record<string, any> = {};

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.split("=");
            options[key.replace("--", "")] = value || true;
        } else {
            commands.push(arg);
        }
    }

    return { commands, options };
}

// Entry point
const args = Deno.args;
if (args.length < 1) {
    console.error("Usage: deno run --allow-run mod.ts '<curl-command>' [--vus=number] [--duration=string] [--generate-only] [--token=string]");
    Deno.exit(1);
}

const { commands, options } = parseArguments(args);

// Set defaults for options
options.vus = options.vus ? parseInt(options.vus, 10) : 10;
options.duration = options.duration || "30s";

// Run the test or generate the script
await runK6Test(commands, options);