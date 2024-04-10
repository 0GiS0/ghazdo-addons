"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const azdev = __importStar(require("azure-devops-node-api"));
async function run() {
    try {
        // Check for presence of CodeQL before running
        console.log(`Tool Cache Directory: ${tl.getVariable('Agent.ToolsDirectory')}`);
        const versions = [];
        const arch = os.arch();
        const toolPath = path.join(tl.getVariable('Agent.ToolsDirectory'), "CodeQL");
        if (fs.existsSync(toolPath)) {
            const children = fs.readdirSync(toolPath);
            for (const child of children) {
                const fullPath = path.join(toolPath, child, arch || "");
                if (fs.existsSync(fullPath) && fs.existsSync(`${fullPath}.complete`)) {
                    versions.push(child);
                }
            }
        }
        if (versions.length === 0) {
            throw new Error(`CodeQL not installed`);
        }
        const completeFile = path.resolve(tl.getVariable('Agent.ToolsDirectory'), 'CodeQL');
        if (!fs.existsSync(completeFile)) {
            throw new Error(`CodeQL not installed`);
        }
        const uriBase = tl.getVariable('System.CollectionUri');
        const projectId = tl.getVariable('System.TeamProjectId');
        const repositoryId = tl.getVariable('Build.Repository.ID');
        tl.setVariable('AdvancedSecurity.CodeQL.Autoconfig', 'failed');
        const token = tl.getVariable('System.AccessToken');
        console.log(`Using Project ${projectId}`);
        // Authenticating and connecting
        let authHandler = azdev.getPersonalAccessTokenHandler(token);
        let webapi = new azdev.WebApi(uriBase, authHandler, undefined);
        let connData = await webapi.connect();
        // Analytics Access
        let Analysis = await webapi.getProjectAnalysisApi();
        let languageMetrics = await Analysis.getProjectLanguageAnalytics(projectId);
        let repos = languageMetrics.repositoryLanguageAnalytics;
        console.log(`Found ${repos.length} repositories`);
        let repository = repos.find(repo => repo.id === repositoryId);
        console.log(`Found ${repository.name}`);
        let language = repository.languageBreakdown;
        // Language Metrics
        let languages = new Set();
        console.log(`Found ${language.length} languages`);
        language.forEach(lang => {
            console.log(`Language: ${lang.name}`);
            switch (lang.name) {
                case "Ruby":
                    languages.add("ruby");
                    break;
                case "JavaScript":
                    languages.add("javascript");
                    break;
                case "Python":
                    languages.add("python");
                    break;
                case "TypeScript":
                    languages.add("javascript");
                    break;
                case "ruby":
                    languages.add("ruby");
                    break;
                case "go":
                    languages.add("go");
                    break;
                case "golang":
                    languages.add("go");
                    break;
                default: break;
            }
            //console.log(languages);
        });
        if (languages.size > 0) {
            console.log(`Configured ${languages.size} languages`);
            let languageList = "";
            let strArray = new Array();
            languages.forEach(lang => { strArray.push(lang); });
            languageList = strArray.join(",");
            tl.setVariable('AdvancedSecurity.CodeQL.Language', languageList);
            //console.log(`Language List: ${languageList}`);
            tl.setVariable('AdvancedSecurity.CodeQL.Autoconfig', 'true');
        }
        else {
            tl.setVariable('AdvancedSecurity.CodeQL.Autoconfig', 'false');
            console.log(`No languages found`);
        }
    }
    catch (err) {
        tl.setVariable('AdvancedSecurity.CodeQL.Autoconfig', 'failed');
        console.log('CodeQL Autoconfig failed');
    }
}
run();
