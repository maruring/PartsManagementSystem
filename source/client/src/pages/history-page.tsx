import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import type { UsageHistory, Part, User } from "@shared/schema";

export default function HistoryPage() {
  const { data: history } = useQuery<UsageHistory[]>({
    queryKey: ["/api/usage"],
  });

  const { data: parts } = useQuery<Part[]>({
    queryKey: ["/api/parts"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Usage History</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Used By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.usedAt), "PPp")}</TableCell>
                  <TableCell>
                    {parts?.find((p) => p.id === entry.partId)?.name}
                  </TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell>User #{entry.usedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
