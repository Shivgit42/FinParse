import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Document } from "@/lib/types";
import { Card } from "@/components/ui/card";

interface StatsCardsProps {
  documents: Document[];
}

export function StatsCards({ documents }: StatsCardsProps) {
  const total = documents.length;
  const parsed = documents.filter((d) => d.status === "PARSED").length;
  const parsing = documents.filter((d) => d.status === "PARSING").length;
  const failed = documents.filter((d) => d.status === "FAILED").length;

  const stats = [
    {
      label: "Total Documents",
      value: total,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Parsed",
      value: parsed,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Processing",
      value: parsing,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Failed",
      value: failed,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <stat.icon className={`h-10 w-10 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
