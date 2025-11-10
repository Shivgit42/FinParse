import Link from "next/link";
import { FileText, Eye, Download, MoreVertical } from "lucide-react";
import { Document } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatDate,
  formatFileSize,
  getStatusColor,
  downloadJSON,
} from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface DocumentsTableProps {
  documents: Document[];
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={getStatusColor(status)}>{status}</Badge>;
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground">
          Upload your first document to get started
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">
                      {doc.fileName || "Untitled"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatFileSize(doc.fileSize || "0")}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {doc.status === "PARSED" && (
                      <>
                        <Link href={`/documents/${doc.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            downloadJSON(
                              doc.parsedData,
                              doc.fileName || "document"
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/documents/${doc.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {doc.status === "PARSED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              downloadJSON(
                                doc.parsedData,
                                doc.fileName || "document"
                              )
                            }
                          >
                            Download JSON
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
