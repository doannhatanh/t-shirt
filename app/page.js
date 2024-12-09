import { Tool } from "@/components/tool";
import { ToolProvider } from "@/context/tool-context";

export default function Home() {
  return (
    <ToolProvider>
      <Tool />
    </ToolProvider>
  );
}
