import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkerCosts from "./WorkerCosts";
import WorkerInvoices from "./WorkerInvoices";
import ProjectInvoices from "./ProjectInvoices";
import { DollarSign, Receipt, FileText } from "lucide-react";

export default function Invoices() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices & Costs</h1>
        <p className="text-muted-foreground mt-2">
          Manage worker costs, worker invoices, and project invoices
        </p>
      </div>

      <Tabs defaultValue="worker-costs" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="worker-costs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Worker Costs</span>
            <span className="sm:hidden">Costs</span>
          </TabsTrigger>
          <TabsTrigger value="worker-invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Worker Invoices</span>
            <span className="sm:hidden">Worker</span>
          </TabsTrigger>
          <TabsTrigger value="project-invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Project Invoices</span>
            <span className="sm:hidden">Project</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="worker-costs" className="mt-6">
          <WorkerCosts />
        </TabsContent>

        <TabsContent value="worker-invoices" className="mt-6">
          <WorkerInvoices />
        </TabsContent>

        <TabsContent value="project-invoices" className="mt-6">
          <ProjectInvoices />
        </TabsContent>
      </Tabs>
    </div>
  );
}
