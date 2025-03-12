import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartSchema, type Part, type InsertPart } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { History, LogOut, Plus } from "lucide-react";

export default function HomePage() {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: parts } = useQuery<Part[]>({
    queryKey: ["/api/parts"],
  });

  const addPartMutation = useMutation({
    mutationFn: async (part: InsertPart) => {
      const res = await apiRequest("POST", "/api/parts", part);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      toast({ title: "Part added successfully" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPartSchema),
    defaultValues: {
      name: "",
      description: "",
      stockQuantity: 0,
      minimumQuantity: 0,
      location: "",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Parts Inventory</h1>
          <div className="flex items-center gap-4">
            <Link href="/history">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">Parts List</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Part</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => addPartMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Name</Label>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Description</Label>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Stock Quantity</Label>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minimumQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Minimum Quantity</Label>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Location</Label>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={addPartMutation.isPending}>
                    Add Part
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts?.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>{part.stockQuantity}</TableCell>
                  <TableCell>{part.minimumQuantity}</TableCell>
                  <TableCell>{part.location}</TableCell>
                  <TableCell>
                    {part.stockQuantity <= part.minimumQuantity ? (
                      <span className="text-destructive font-medium">Low Stock</span>
                    ) : (
                      <span className="text-green-600 font-medium">OK</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
