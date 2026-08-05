import { spawn } from "node:child_process";
import path from "node:path";

export const forbiddenPython = /\b(open|exec|eval|compile|__import__|globals|locals|input|breakpoint)\b|__|\bsubprocess\b|\bsocket\b/i;

export type PythonResult = {
  stdout: string;
  stderr: string;
  status: "success" | "error" | "timeout";
  durationMs: number;
};

export async function executePython(code: string): Promise<PythonResult> {
  const started = Date.now();
  const runner = path.join(process.cwd(), "runner", "execute.py");
  const result = await new Promise<Omit<PythonResult, "durationMs">>((resolve) => {
    const child = spawn("python3", ["-I", "-S", runner], { env: { PATH: "/usr/bin:/bin", NODE_ENV: "production" } as NodeJS.ProcessEnv });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (status: PythonResult["status"]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout: stdout.slice(0, 8000), stderr: stderr.slice(0, 4000), status });
    };
    child.stdout.on("data", (chunk: Buffer) => { stdout += String(chunk); if (stdout.length > 8000) child.kill("SIGKILL"); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += String(chunk); });
    child.on("error", (error: Error) => { stderr += error.message; finish("error"); });
    child.on("close", (code: number | null) => finish(code === 0 ? "success" : "error"));
    const timer = setTimeout(() => { stderr += "Execution timed out after 2 seconds."; child.kill("SIGKILL"); finish("timeout"); }, 2200);
    child.stdin.end(JSON.stringify({ code }));
  });
  return { ...result, durationMs: Date.now() - started };
}
