"use client";

import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { StatsCards } from "@/components/dashboard/StatsCard";
import { DocumentsTable } from "@/components/dashboard/DocumentsTable";
import { UploadModal } from "@/components/dashboard/UploadModal";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: documents, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your financial documents
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} size="lg" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <StatsCards documents={documents || []} />
      <DocumentsTable documents={documents || []} />
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
