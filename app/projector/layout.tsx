import { WorkshopProvider } from "@/components/workshop-provider";
export default function ProjectorLayout({ children }: { children: React.ReactNode }) { return <WorkshopProvider>{children}</WorkshopProvider>; }
