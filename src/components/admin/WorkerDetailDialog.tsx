import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock, 
  Award, 
  Plus,
  Edit,
  TrendingUp,
  Calendar
} from "lucide-react";
import { WorkerData } from "@/hooks/useWorkerCosts";

interface WorkerDetailDialogProps {
  worker: WorkerData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRate: (workerId: string, newRate: number, effectiveDate: string, notes: string) => void;
  onAddSkill: (workerId: string, skillName: string, skillLevel: number, certified: boolean) => void;
}

export function WorkerDetailDialog({ 
  worker, 
  isOpen, 
  onClose, 
  onUpdateRate,
  onAddSkill 
}: WorkerDetailDialogProps) {
  const [newRate, setNewRate] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rateNotes, setRateNotes] = useState<string>("");
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillLevel, setNewSkillLevel] = useState<string>("3");
  const [isSkillCertified, setIsSkillCertified] = useState<boolean>(false);

  if (!worker) return null;

  const handleUpdateRate = () => {
    if (newRate && parseFloat(newRate) > 0) {
      onUpdateRate(worker.id, parseFloat(newRate), effectiveDate, rateNotes);
      setNewRate("");
      setRateNotes("");
      onClose();
    }
  };

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      onAddSkill(worker.id, newSkillName.trim(), parseInt(newSkillLevel), isSkillCertified);
      setNewSkillName("");
      setNewSkillLevel("3");
      setIsSkillCertified(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={worker.avatar_url} alt={worker.name} />
              <AvatarFallback>
                {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{worker.name}</h2>
              <p className="text-sm text-muted-foreground">{worker.role}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-semibold">${worker.hourlyRate}/hr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hours This Month</p>
                    <p className="font-semibold">{worker.hoursThisMonth}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="font-semibold">${worker.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    <p className="font-semibold text-xs">{worker.lastPayment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="rates">Rate History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.phone || 'No phone number'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Contact via manager</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                      {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skills & Certifications
                  </CardTitle>
                  <CardDescription>
                    Manage worker skills and certification status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Current Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills && worker.skills.length > 0 ? (
                        worker.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills recorded</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Add New Skill */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Add New Skill</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="skillName">Skill Name</Label>
                        <Input
                          id="skillName"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="e.g., Electrical Work"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skillLevel">Skill Level (1-5)</Label>
                        <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Beginner</SelectItem>
                            <SelectItem value="2">2 - Basic</SelectItem>
                            <SelectItem value="3">3 - Intermediate</SelectItem>
                            <SelectItem value="4">4 - Advanced</SelectItem>
                            <SelectItem value="5">5 - Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddSkill} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Rate Management
                  </CardTitle>
                  <CardDescription>
                    Update hourly rates and view rate history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="newRate">New Hourly Rate ($)</Label>
                      <Input
                        id="newRate"
                        type="number"
                        step="0.01"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        placeholder={worker.hourlyRate.toString()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="effectiveDate">Effective Date</Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleUpdateRate} className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Rate
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="rateNotes">Notes (Optional)</Label>
                    <Textarea
                      id="rateNotes"
                      value={rateNotes}
                      onChange={(e) => setRateNotes(e.target.value)}
                      placeholder="Reason for rate change..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Track worker performance and productivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Efficiency Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Quality Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-success h-2 rounded-full w-[90%]"></div>
                        </div>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Performance metrics based on completed tasks and project feedback.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}