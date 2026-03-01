import { CopilotKit } from "@copilotkit/react-core";

export default function AdjusterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="fnolAgent"
      enableInspector={false}
      showDevConsole={false}
    >
      {children}
    </CopilotKit>
  );
}
