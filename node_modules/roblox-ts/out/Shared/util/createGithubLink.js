"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issue = issue;
const kleur_1 = __importDefault(require("kleur"));
const REPO_URL = "https://github.com/roblox-ts/roblox-ts";
function issue(id) {
    return "More information: " + kleur_1.default.grey(`${REPO_URL}/issues/${id}`);
}
//# sourceMappingURL=createGithubLink.js.map