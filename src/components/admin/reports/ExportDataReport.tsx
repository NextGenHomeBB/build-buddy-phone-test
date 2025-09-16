import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Table, 
  Calendar,
  Users,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface ExportDataReportProps {
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
    total_hours: number;
    total_shifts: number;
    attendance_rate: number;
  }>;
  activeShifts: Array<{
    id: string;
    user_name: string;
    project_name?: string;
    start_time: string;
  }>;
}

export const ExportDataReport: React.FC<ExportDataReportProps> = ({
  timesheetEntries,
  userAnalytics,
  activeShifts,
}) => {
  const [exportType, setExportType] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: string) => {
    setIsExporting(true);
    
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'timesheets':
          data = timesheetEntries.filter(entry => {
            const matchesUser = selectedUser === 'all' || entry.user_id === selectedUser;
            const matchesDate = (!dateRange.start || new Date(entry.created_at) >= new Date(dateRange.start)) &&
                              (!dateRange.end || new Date(entry.created_at) <= new Date(dateRange.end + 'T23:59:59'));
            return matchesUser && matchesDate;
          });
          
          headers = [
            'User Name', 'Project', 'Start Time', 'End Time', 'Duration (hours)', 
            'Location Verified', 'Approved', 'Notes', 'Created At'
          ];
          
          data = data.map(entry => ([
            entry.user_name,
            entry.project_name || 'No project',
            format(new Date(entry.start_time), 'yyyy-MM-dd HH:mm:ss'),
            entry.end_time ? format(new Date(entry.end_time), 'yyyy-MM-dd HH:mm:ss') : 'Active',
            entry.duration_generated?.toFixed(2) || '0',
            entry.location_verified ? 'Yes' : 'No',
            entry.approved ? 'Yes' : 'No',
            entry.notes || '',
            format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')
          ]));
          
          filename = `timesheets_${format(new Date(), 'yyyy-MM-dd')}`;
          break;

        case 'analytics':
          data = userAnalytics;
          headers = [
            'User Name', 'Total Hours', 'Total Shifts', 'Attendance Rate (%)'
          ];
          
          data = userAnalytics.map(user => ([
            user.user_name,
            user.total_hours.toFixed(2),
            user.total_shifts.toString(),
            user.attendance_rate.toFixed(1)
          ]));
          
          filename = `user_analytics_${format(new Date(), 'yyyy-MM-dd')}`;
          break;

        case 'active_shifts':
          data = activeShifts;
          headers = [
            'User Name', 'Project', 'Start Time', 'Duration (hours)'
          ];
          
          data = activeShifts.map(shift => {
            const startTime = new Date(shift.start_time);
            const duration = (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            return [
              shift.user_name,
              shift.project_name || 'No project',
              format(startTime, 'yyyy-MM-dd HH:mm:ss'),
              duration.toFixed(2)
            ];
          });
          
          filename = `active_shifts_${format(new Date(), 'yyyy-MM-dd')}`;
          break;

        default:
          throw new Error('Invalid export type');
      }

      if (exportFormat === 'csv') {
        downloadCSV(data, headers, filename);
      } else if (exportFormat === 'json') {
        downloadJSON(data, headers, filename);
      }

      toast({
        title: "Export Successful",
        description: `${type} data exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (data: any[][], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (data: any[][], headers: string[], filename: string) => {
    const jsonData = data.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      type: 'timesheets',
      title: 'Timesheet Data',
      description: 'Export all timesheet entries with full details',
      icon: Clock,
      count: timesheetEntries.length
    },
    {
      type: 'analytics',
      title: 'User Analytics',
      description: 'Export user performance analytics and statistics',
      icon: BarChart3,
      count: userAnalytics.length
    },
    {
      type: 'active_shifts',
      title: 'Active Shifts',
      description: 'Export currently active shifts and durations',
      icon: Users,
      count: activeShifts.length
    }
  ];

  const uniqueUsers = Array.from(new Set(timesheetEntries.map(entry => entry.user_name)));

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User Filter</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((userName) => (
                    <SelectItem key={userName} value={userName}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON (Developer Friendly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Available Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div key={option.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.count} records available
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleExport(option.type)}
                    disabled={isExporting || option.count === 0}
                    variant="outline"
                    size="sm"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport('timesheets')}
              disabled={isExporting}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <span>Today's Timesheets</span>
            </Button>
            <Button
              onClick={() => handleExport('analytics')}
              disabled={isExporting}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>User Analytics</span>
            </Button>
            <Button
              onClick={() => handleExport('active_shifts')}
              disabled={isExporting}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Clock className="h-6 w-6" />
              <span>Active Shifts</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Information */}
      <Card>
        <CardHeader>
          <CardTitle>Export Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">CSV Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Compatible with Excel and Google Sheets</li>
                <li>• Best for data analysis and reporting</li>
                <li>• Includes headers for easy identification</li>
                <li>• Date formats: YYYY-MM-DD HH:MM:SS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">JSON Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Developer-friendly structured data</li>
                <li>• Easy to import into other systems</li>
                <li>• Preserves data types and structure</li>
                <li>• Perfect for API integrations</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p>• Exports respect the date range and user filters you set above</p>
            <p>• All times are exported in your local timezone</p>
            <p>• Large datasets may take a few moments to process</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};