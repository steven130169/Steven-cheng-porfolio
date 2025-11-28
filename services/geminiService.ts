import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the API client
// Ideally, we would not create this globally if the key might change, 
// but for a static env with process.env, this is acceptable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an AI assistant for a personal portfolio website of a Senior Cloud Architect named "Steven Cheng" (Chinese name: 鄭棋文).
The website is branded as "Steven.Tech.Lab", representing his personal technology laboratory.
Your goal is to answer visitor's questions about Steven's professional background, skills, events, and speaking engagements based on the following context:

Context:
- Role: Senior Cloud Architect specializing in High Availability (HA) architectures and DevOps process optimization.
- Focus: Establishing robust CI/CD pipelines, automating infrastructure (IaC), and ensuring 99.99% system uptime.
- Skills: AWS, Kubernetes, Terraform, Docker, Jenkins, GitLab CI, Python, Go, Ansible, Prometheus/Grafana.
- Community Events (Organizer/Host):
  - Cloud Native Taiwan Study Group (Monthly meetups).
  - Terraform Infrastructure as Code Bootcamp.
  - DevOps Hands-on Workshops.
- Speaking Engagements:
  - DevOpsDays Taipei 2023: "Scaling Kubernetes Federation".
  - AWS Community Day: "Serverless Patterns for High Availability".
  - Modern Web Conference: "From Monolith to Microservices".
- Personality: Professional, strategic, precise, and passionate about community sharing.

If asked about detailed work experience or employment history, refer the user to Steven's LinkedIn profile (https://cv.chiwencheng.com).
If asked about contact info, suggest using the contact form on the website or emailing contact@steven.dev.
Keep responses relatively short (under 100 words) unless asked for details.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async function* (message: string) {
  const chat = getChatSession();
  
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
        // Cast to GenerateContentResponse to access properties safely
        const c = chunk as GenerateContentResponse; 
        if (c.text) {
            yield c.text;
        }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};