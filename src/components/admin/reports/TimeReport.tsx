import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface TimeReportProps {
  timesheetEntries: Array<{
    id: string;
    user_id: string;
    user_name: string;
    project_name?: string;
    start_time: string;
    end_time?: string;
    duration_generated?: number;
    location_verified: boolean;
    approved: boolean;
    notes?: string;
    created_at: string;
  }>;
  userAnalytics: Array<{
    user_id: string;
    user_name: string;
  }>;
}

export const TimeReport: React.FC<TimeReportProps> = ({
  timesheetEntries,
  userAnalytics,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEntries = timesheetEntries.filter((entry) => {
    const matchesUser = selectedUser === 'all' || entry.user_id === selectedUser;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && entry.approved) ||
      (statusFilter === 'pending' && !entry.approved) ||
      (statusFilter === 'active' && !entry.end_time);
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(entry.created_at) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(entry.created_at) <= new Date(endDate + 'T23:59:59');
    }
    
    return matchesUser && matchesStatus && matchesDate;
  });

  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration_generated || 0), 0);
  const approvedHours = filteredEntries
    .filter(entry => entry.approved)
    .reduce((sum, entry) => sum + (entry.duration_generated || 0), 0);
  const pendingHours = totalHours - approvedHours;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {userAnalytics.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">{filteredEntries.length} entries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {totalHours > 0 ? ((approvedHours / totalHours) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {entry.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.project_name || 'No project'}</TableCell>
                    <TableCell>{format(new Date(entry.start_time), 'MMM dd, HH:mm')}</TableCell>
                    <TableCell>
                      {entry.end_time ? (
                        format(new Date(entry.end_time), 'MMM dd, HH:mm')
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.duration_generated ? `${entry.duration_generated.toFixed(1)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location_verified ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.approved ? "default" : "secondary"}>
                        {entry.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No time entries found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};