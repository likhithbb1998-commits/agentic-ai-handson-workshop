import { WorkshopProvider } from "@/components/workshop-provider";
export default function TrainerLayout({ children }: { children: React.ReactNode }) { return <WorkshopProvider>{children}</WorkshopProvider>; }
