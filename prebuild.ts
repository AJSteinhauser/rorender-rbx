import * as fs from "fs";
import * as path from "path";
import localFlags from './src/fflags/fflag-local' 

// Convert the object to a JSON string
const jsonString = JSON.stringify(localFlags, null); // Pretty-print with 2 spaces

// Define the output file path
const outputPath = path.resolve(__dirname, "fflags.json");

// Write the JSON string to a file
fs.writeFileSync(outputPath, jsonString, "utf-8");

console.log(`JSON file has been saved to ${outputPath}`);

const configPath = path.resolve(__dirname, "src", "buildConfig.ts");

let configContent = fs.readFileSync(configPath, "utf-8");

const envRegex = /export const env: Environment = .+/;
const useLocalFFlagsRegex = /export const useLocalFFlags = .+/;

configContent = configContent.replace(envRegex, "export const env: Environment = 'production'");
configContent = configContent.replace(useLocalFFlagsRegex, "export const useLocalFFlags = false");

fs.writeFileSync(configPath, configContent);

console.log("Reset production flags buildConfig.ts");
