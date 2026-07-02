import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import http from "http";
import fs from "fs";

// Initialize environment configuration
dotenv.config();

// Verify API Key existence
if (!process.env.API_KEY) {
    console.error("❌ Critical Error: API_KEY is missing from your .env file!");
    process.exit(1);
}

// Instantiate the Google Gen AI SDK securely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // 1. Serve Static Frontend UI Layout Files
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        fs.readFile("./index.html", (err, data) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    } else if (req.method === "GET" && req.url === "/style.css") {
        fs.readFile("./style.css", (err, data) => {
            res.writeHead(200, { "Content-Type": "text/css" });
            res.end(data);
        });
    } 
    // 2. Handle the Secure Backend AI API Request
    else if (req.method === "POST" && req.url === "/api/plan") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { goal } = JSON.parse(body);
                if (!goal) throw new Error("Goal parameter is empty.");

                // Request a structured JSON array using the modern SDK layout
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `Break down this goal into an ordered sequence of actionable tasks: "${goal}"`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                tasks: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            task_name: { type: "STRING" },
                                            priority: { type: "STRING", enum: ["low", "medium", "high"] },
                                            estimated_time: { type: "STRING" }
                                        },
                                        required: ["task_name", "priority", "estimated_time"]
                                    }
                                }
                            },
                            required: ["tasks"]
                        }
                    }
                });

                // Send back the verified JSON response directly to the browser
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(response.text);

            } catch (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: error.message || "Failed to process plan." }));
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Smart Planner running at http://localhost:3000`);
});
