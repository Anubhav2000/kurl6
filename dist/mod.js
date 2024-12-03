#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parse_curl } from "curl-parser"; // Import from curl-parser package
import { spawn } from "child_process";
function runK6Test(commands, options) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const k6Process = spawn("k6", ["run", "-"], {
                stdio: ["pipe", "inherit", "inherit"], // Pass script content to stdin
            });
            // Write the script content to the k6 process
            k6Process.stdin.write(k6Script);
            k6Process.stdin.end();
            k6Process.on("close", (code) => {
                if (code !== 0) {
                    console.error("k6 test failed.");
                }
                else {
                    console.log("k6 test completed successfully.");
                }
            });
        }
        catch (error) {
            console.error("Error:", error.message);
        }
    });
}
function generateK6Script(parsedCommands, options) {
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
function parseArguments(args) {
    const commands = [];
    const options = {};
    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.split("=");
            options[key.replace("--", "")] = value || true;
        }
        else {
            commands.push(arg);
        }
    }
    return { commands, options };
}
// Entry point
const args = process.argv.slice(2); // Remove the first two elements (node and script path)
if (args.length < 1) {
    console.error("Usage: curl-to-k6 '<curl-command>' [--vus=number] [--duration=string] [--generate-only] [--token=string]");
    process.exit(1);
}
const { commands, options } = parseArguments(args);
// Set defaults for options
options.vus = options.vus ? parseInt(options.vus, 10) : 10;
options.duration = options.duration || "30s";
// Run the test or generate the script
runK6Test(commands, options);
