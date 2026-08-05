import { WorkshopProvider } from "@/components/workshop-provider";
export default function StudentLayout({ children }: { children: React.ReactNode }) { return <WorkshopProvider>{children}</WorkshopProvider>; }
