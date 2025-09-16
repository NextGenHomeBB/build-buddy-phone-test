import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, MapPin, Camera, Check, X, Users, Activity, BarChart3, TrendingUp } from "lucide-react";
import { useAdminTimeTracking } from "@/hooks/useAdminTimeTracking";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAnalyticsChart } from "@/components/admin/UserAnalyticsChart";
import { UserProgressCards } from "@/components/admin/UserProgressCards";
import { ReportDialog } from '@/components/admin/reports/ReportDialog';
import { TeamSummaryReport } from '@/components/admin/reports/TeamSummaryReport';
import { TimeReport } from '@/components/admin/reports/TimeReport';
import { ActivityLogReport } from '@/components/admin/reports/ActivityLogReport';
import { AnalyticsReport } from '@/components/admin/reports/AnalyticsReport';
import { ProgressReport } from '@/components/admin/reports/ProgressReport';
import { ExportDataReport } from '@/components/admin/reports/ExportDataReport';

export function TimeTracking() {
  const [reportDialog, setReportDialog] = useState<string | null>(null);
  
  const {
    activeShifts,
    timesheetEntries,
    userAnalytics,
    userProgress,
    isLoading,
    selectedDate,
    setSelectedDate,
    selectedUser,
    setSelectedUser,
    viewPeriod,
    setViewPeriod,
    approveTimesheet,
    rejectTimesheet,
    finishShift
  } = useAdminTimeTracking();

  const formatDuration = (hours?: number) => {
    if (!hours) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationBadge = (verified: boolean) => (
    <Badge variant={verified ? "default" : "destructive"}>
      <MapPin className="w-3 h-3 mr-1" />
      {verified ? "Verified" : "Unverified"}
    </Badge>
  );

  const getApprovalBadge = (approved: boolean) => (
    <Badge variant={approved ? "default" : "outline"}>
      {approved ? "Approved" : "Pending"}
    </Badge>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Time Tracking</h1>
              <p className="text-muted-foreground">Monitor worker shifts and approve timesheets</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Time Tracking</h1>
            <p className="text-muted-foreground">Monitor worker shifts and approve timesheets</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeShifts.length}</div>
              <p className="text-xs text-muted-foreground">Workers currently on shift</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetEntries.length}</div>
              <p className="text-xs text-muted-foreground">Timesheet submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheetEntries.filter(entry => !entry.approved).length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Active Shifts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currently Active Shifts</CardTitle>
                <CardDescription>Workers who are currently on shift</CardDescription>
              </CardHeader>
              <CardContent>
                {activeShifts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active shifts at the moment
                  </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Worker</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Photo</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {activeShifts.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell className="font-medium">{shift.user_name}</TableCell>
                          <TableCell>{shift.project_name || "No project"}</TableCell>
                          <TableCell>{formatTime(shift.start_time)}</TableCell>
                          <TableCell>
                            {formatDuration(
                              (Date.now() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)
                            )}
                          </TableCell>
                          <TableCell>
                            {getVerificationBadge(shift.location_verified)}
                          </TableCell>
                          <TableCell>
                            {shift.start_photo_url ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Camera className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Start Photo</DialogTitle>
                                  </DialogHeader>
                                  <img 
                                    src={shift.start_photo_url} 
                                    alt="Start shift photo"
                                    className="w-full rounded-lg"
                                  />
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-muted-foreground">No photo</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => finishShift(shift.id)}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Finish Shift
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Timesheet History</CardTitle>
                    <CardDescription>Review and approve worker timesheets</CardDescription>
                  </div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {timesheetEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No timesheet entries for this date
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheetEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.user_name}</TableCell>
                          <TableCell>{entry.project_name || "No project"}</TableCell>
                          <TableCell>{formatTime(entry.start_time)}</TableCell>
                          <TableCell>
                            {entry.end_time ? formatTime(entry.end_time) : "Active"}
                          </TableCell>
                          <TableCell>
                            {formatDuration(entry.duration_generated)}
                          </TableCell>
                          <TableCell>
                            {getVerificationBadge(entry.location_verified)}
                          </TableCell>
                          <TableCell>
                            {getApprovalBadge(entry.approved)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!entry.approved && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => approveTimesheet(entry.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectTimesheet(entry.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {(entry.start_photo_url || entry.end_photo_url) && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Camera className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Shift Photos</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {entry.start_photo_url && (
                                        <div>
                                          <h4 className="font-medium mb-2">Start Photo</h4>
                                          <img 
                                            src={entry.start_photo_url} 
                                            alt="Start shift"
                                            className="w-full rounded-lg"
                                          />
                                        </div>
                                      )}
                                      {entry.end_photo_url && (
                                        <div>
                                          <h4 className="font-medium mb-2">End Photo</h4>
                                          <img 
                                            src={entry.end_photo_url} 
                                            alt="End shift"
                                            className="w-full rounded-lg"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Period Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      User Analytics
                    </CardTitle>
                    <CardDescription>Detailed analysis of user work patterns and productivity</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewPeriod === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewPeriod('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={viewPeriod === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewPeriod('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={viewPeriod === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewPeriod('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UserAnalyticsChart
                  analytics={userAnalytics}
                  selectedUser={selectedUser}
                  onUserChange={setSelectedUser}
                  viewPeriod={viewPeriod}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>Monitor individual and team progress towards goals</CardDescription>
              </CardHeader>
              <CardContent>
                <UserProgressCards
                  userProgress={userProgress}
                  selectedUser={selectedUser}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Export</CardTitle>
                <CardDescription>Generate detailed reports and export data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('team-summary')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Team Summary</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('time-report')}
                  >
                    <Clock className="h-6 w-6" />
                    <span>Time Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('activity-log')}
                  >
                    <Activity className="h-6 w-6" />
                    <span>Activity Log</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('analytics')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('progress')}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span>Progress Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setReportDialog('export')}
                  >
                    <Camera className="h-6 w-6" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Report Dialogs */}
        <ReportDialog
          open={reportDialog === 'team-summary'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Team Summary Report"
        >
          <TeamSummaryReport activeShifts={activeShifts} userAnalytics={userAnalytics} />
        </ReportDialog>

        <ReportDialog
          open={reportDialog === 'time-report'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Time Report"
        >
          <TimeReport timesheetEntries={timesheetEntries} userAnalytics={userAnalytics} />
        </ReportDialog>

        <ReportDialog
          open={reportDialog === 'activity-log'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Activity Log Report"
        >
          <ActivityLogReport timesheetEntries={timesheetEntries} activeShifts={activeShifts} />
        </ReportDialog>

        <ReportDialog
          open={reportDialog === 'analytics'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Analytics Report"
        >
          <AnalyticsReport 
            userAnalytics={userAnalytics} 
            selectedUser={selectedUser} 
            onUserChange={setSelectedUser} 
            viewPeriod={viewPeriod} 
          />
        </ReportDialog>

        <ReportDialog
          open={reportDialog === 'progress'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Progress Report"
        >
          <ProgressReport userProgress={userProgress} />
        </ReportDialog>

        <ReportDialog
          open={reportDialog === 'export'}
          onOpenChange={(open) => !open && setReportDialog(null)}
          title="Export Data"
        >
          <ExportDataReport 
            timesheetEntries={timesheetEntries} 
            userAnalytics={userAnalytics} 
            activeShifts={activeShifts} 
          />
        </ReportDialog>
      </div>
    </AppLayout>
  );
}

export default TimeTracking;