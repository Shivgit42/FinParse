"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useDocuments } from "@/hooks/useDocuments";
import { StatsCards } from "@/components/dashboard/StatsCard";
import { DocumentsTable } from "@/components/dashboard/DocumentsTable";
import { UploadModal } from "@/components/dashboard/UploadModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: documents, isLoading, error } = useDocuments();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Debug: Log auth state
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Auth loaded:", isLoaded);
      console.log("Signed in:", isSignedIn);
      if (isSignedIn) {
        const token = await getToken();
        console.log("Has token:", !!token);
        console.log("Token preview:", token?.substring(0, 20) + "...");
      }
    };
    checkAuth();
  }, [isLoaded, isSignedIn, getToken]);

  // Debug: Log documents state
  useEffect(() => {
    console.log("Documents loading:", isLoading);
    console.log("Documents error:", error);
    console.log("Documents data:", documents);
  }, [isLoading, error, documents]);

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">
          Loading authentication...
        </span>
      </div>
    );
  }

  // Check if user is signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not Signed In</h2>
          <p className="text-muted-foreground">
            Please sign in to access the dashboard.
          </p>
        </Card>
      </div>
    );
  }

  // Show error if documents fail to load
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your financial documents
            </p>
          </div>
        </div>

        <Card className="p-8 border-destructive">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">
                Failed to Load Documents
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <div className="bg-muted p-4 rounded-md text-xs font-mono">
                <p className="mb-2">Debugging info:</p>
                <p>
                  • API URL:{" "}
                  {process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:4000/api"}
                </p>
                <p>• Signed in: {isSignedIn ? "Yes" : "No"}</p>
                <p>
                  • Error:{" "}
                  {error instanceof Error
                    ? error.message
                    : JSON.stringify(error)}
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Troubleshooting steps:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Make sure backend is running on port 4000</li>
                  <li>Check backend has CLERK_SECRET_KEY in .env</li>
                  <li>Verify CORS is enabled on backend</li>
                  <li>Check browser console for errors</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground">Loading your documents...</p>
      </div>
    );
  }

  // Success - render dashboard
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
