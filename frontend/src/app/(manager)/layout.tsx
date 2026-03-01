import { CopilotKit } from "@copilotkit/react-core";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="fnolAgent">
      {children}
    </CopilotKit>
  );
}
