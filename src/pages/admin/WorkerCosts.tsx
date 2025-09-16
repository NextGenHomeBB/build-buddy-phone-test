import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Edit, 
  Eye,
  Filter,
  Download,
  BarChart3,
  Briefcase
} from "lucide-react";
import { useWorkerCosts } from "@/hooks/useWorkerCosts";
import { WorkerDetailDialog } from "@/components/admin/WorkerDetailDialog";
import { WorkerCostsDashboard } from "@/components/admin/WorkerCostsDashboard";

// Worker Cost Management Component


export function WorkerCosts() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [isWorkerDetailOpen, setIsWorkerDetailOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentPeriod, setPaymentPeriod] = useState<string>(`${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [newRate, setNewRate] = useState<string>("");
  const [rateEffectiveDate, setRateEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rateNotes, setRateNotes] = useState<string>("");
  
  const {
    workers,
    payments,
    loading,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    stats,
    updateWorkerRate,
    processPayment,
    createWorkerSkill,
  } = useWorkerCosts();

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "outline",
      failed: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleProcessPayment = () => {
    if (selectedWorkerId && paymentAmount && parseFloat(paymentAmount) > 0) {
      processPayment(selectedWorkerId, parseFloat(paymentAmount), paymentPeriod, paymentMethod);
      setIsPaymentDialogOpen(false);
      setSelectedWorkerId("");
      setPaymentAmount("");
    }
  };

  const handleUpdateRate = () => {
    if (selectedWorkerId && newRate && parseFloat(newRate) > 0) {
      updateWorkerRate(selectedWorkerId, parseFloat(newRate), rateEffectiveDate, rateNotes);
      setIsRateDialogOpen(false);
      setSelectedWorkerId("");
      setNewRate("");
      setRateNotes("");
    }
  };

  const handleViewWorkerDetails = (worker: any) => {
    setSelectedWorker(worker);
    setIsWorkerDetailOpen(true);
  };

  const handleUpdateWorkerRate = (workerId: string, newRate: number, effectiveDate: string, notes: string) => {
    updateWorkerRate(workerId, newRate, effectiveDate, notes);
  };

  const handleAddWorkerSkill = (workerId: string, skillName: string, skillLevel: number, certified: boolean) => {
    createWorkerSkill(workerId, skillName, skillLevel, certified);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Worker Cost Management</h1>
            <p className="text-muted-foreground">
              Manage worker salaries, payments, and financial data
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker Cost Management</h1>
          <p className="text-muted-foreground">
            Manage worker salaries, payments, and financial data
          </p>
        </div>

        {/* Enhanced Stats Dashboard */}
        <WorkerCostsDashboard stats={stats} />

        <Tabs defaultValue="workers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workers">
              <Users className="h-4 w-4 mr-2" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Worker Management</CardTitle>
                    <CardDescription>
                      Manage worker rates, hours, and earnings
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filters
                    </Button>
                    <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Update Rates
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Worker Rate</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="worker">Worker</Label>
                            <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select worker" />
                              </SelectTrigger>
                              <SelectContent>
                                {workers.map((worker) => (
                                  <SelectItem key={worker.id} value={worker.id}>
                                    {worker.name} - ${worker.hourlyRate}/hr
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="rate">New Hourly Rate ($)</Label>
                            <Input 
                              id="rate" 
                              type="number" 
                              step="0.01"
                              value={newRate}
                              onChange={(e) => setNewRate(e.target.value)}
                              placeholder="45.00" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="effective">Effective Date</Label>
                            <Input 
                              id="effective" 
                              type="date" 
                              value={rateEffectiveDate}
                              onChange={(e) => setRateEffectiveDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea 
                              id="notes" 
                              value={rateNotes}
                              onChange={(e) => setRateNotes(e.target.value)}
                              placeholder="Reason for rate change..." 
                            />
                          </div>
                          <Button onClick={handleUpdateRate} className="w-full">
                            Update Rate
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workers by name, role, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="manager">Managers</SelectItem>
                      <SelectItem value="worker">Workers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Hours This Month</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={worker.avatar_url} alt={worker.name} />
                              <AvatarFallback>
                                {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{worker.name}</p>
                              <p className="text-sm text-muted-foreground">{worker.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {worker.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">${worker.hourlyRate}/hr</TableCell>
                        <TableCell>{worker.hoursThisMonth}h</TableCell>
                        <TableCell className="font-mono">${worker.totalEarnings.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-32">
                            {worker.skills && worker.skills.length > 0 ? (
                              worker.skills.slice(0, 2).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill.split(' ')[0]}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No skills</span>
                            )}
                            {worker.skills && worker.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{worker.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(worker.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewWorkerDetails(worker)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      Track and manage worker payments
                    </CardDescription>
                  </div>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="paymentWorker">Worker</Label>
                          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select worker" />
                            </SelectTrigger>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.id}>
                                  {worker.name} - ${worker.totalEarnings} earned
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount ($)</Label>
                          <Input 
                            id="amount" 
                            type="number" 
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="5000.00" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="period">Pay Period</Label>
                          <Input 
                            id="period" 
                            value={paymentPeriod}
                            onChange={(e) => setPaymentPeriod(e.target.value)}
                            placeholder="January 2024" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="method">Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleProcessPayment} className="w-full">
                          Process Payment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.workerName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{payment.period}</TableCell>
                        <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.paidDate || "Pending"}</TableCell>
                        <TableCell className="capitalize">{payment.method.replace("_", " ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trends</CardTitle>
                  <CardDescription>Monthly payroll trends and projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mr-2" />
                    Interactive charts coming soon
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics</CardTitle>
                  <CardDescription>Worker productivity and cost efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cost per hour worked</span>
                        <span>${(stats.totalMonthlyPay / (stats.totalWorkers * 160)).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue per worker</span>
                        <span>${((stats.totalMonthlyPay * 1.4) / stats.totalWorkers).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profit margin</span>
                        <span className="text-success">28%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Worker Detail Dialog */}
        <WorkerDetailDialog
          worker={selectedWorker}
          isOpen={isWorkerDetailOpen}
          onClose={() => {
            setIsWorkerDetailOpen(false);
            setSelectedWorker(null);
          }}
          onUpdateRate={handleUpdateWorkerRate}
          onAddSkill={handleAddWorkerSkill}
        />
      </div>
    </AppLayout>
  );
}

export default WorkerCosts;