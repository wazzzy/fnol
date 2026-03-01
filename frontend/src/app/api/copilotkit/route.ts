import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

// AG-UI bridge: forward all agent traffic to the Python FastAPI backend
const runtime = new CopilotRuntime({
  agents: {
    fnolAgent: new HttpAgent({
      url: `${backendUrl}/copilotkit`,
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
