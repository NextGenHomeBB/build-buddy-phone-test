import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ApprovalAction {
  timesheetId: string;
  action: 'approve' | 'reject';
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ApprovalRule {
  id: string;
  name: string;
  conditions: {
    locationVerified?: boolean;
    maxHours?: number;
    minHours?: number;
    projectIds?: string[];
    userIds?: string[];
  };
  action: 'auto_approve' | 'auto_reject' | 'flag_review';
  priority: number;
  enabled: boolean;
}

export const useBulkApprovalActions = () => {
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);

  const toggleTimesheetSelection = (timesheetId: string) => {
    setSelectedTimesheets(prev => 
      prev.includes(timesheetId)
        ? prev.filter(id => id !== timesheetId)
        : [...prev, timesheetId]
    );
  };

  const selectAllTimesheets = (timesheetIds: string[]) => {
    setSelectedTimesheets(timesheetIds);
  };

  const clearSelection = () => {
    setSelectedTimesheets([]);
  };

  const bulkApprove = async (notes?: string) => {
    if (selectedTimesheets.length === 0) return;

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('timesheets')
        .update({ 
          approved: true,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTimesheets);

      if (error) throw error;

      // Log approval actions
      const approvalLogs = selectedTimesheets.map(id => ({
        timesheet_id: id,
        action: 'approved' as const,
        notes: notes || null,
        processed_by: 'current_user', // Should get from auth context
        processed_at: new Date().toISOString()
      }));

      // Insert approval logs (if you have such a table)
      // await supabase.from('approval_logs').insert(approvalLogs);

      toast({
        title: "Success",
        description: `${selectedTimesheets.length} timesheets approved successfully`
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk approving timesheets:', error);
      toast({
        title: "Error",
        description: "Failed to approve timesheets",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkReject = async (reason: string) => {
    if (selectedTimesheets.length === 0) return;
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('timesheets')
        .update({ 
          approved: false,
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTimesheets);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedTimesheets.length} timesheets rejected`
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk rejecting timesheets:', error);
      toast({
        title: "Error",
        description: "Failed to reject timesheets",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAutomaticApproval = async (timesheets: any[]) => {
    const autoApproveResults = [];

    for (const timesheet of timesheets) {
      for (const rule of approvalRules.filter(r => r.enabled)) {
        if (evaluateRule(rule, timesheet)) {
          if (rule.action === 'auto_approve') {
            autoApproveResults.push({
              timesheetId: timesheet.id,
              action: 'approve' as const,
              notes: `Auto-approved by rule: ${rule.name}`,
              ruleId: rule.id
            });
          } else if (rule.action === 'auto_reject') {
            autoApproveResults.push({
              timesheetId: timesheet.id,
              action: 'reject' as const,
              notes: `Auto-rejected by rule: ${rule.name}`,
              ruleId: rule.id
            });
          }
          break; // Apply first matching rule only
        }
      }
    }

    if (autoApproveResults.length > 0) {
      await processAutoApprovals(autoApproveResults);
    }

    return autoApproveResults;
  };

  const evaluateRule = (rule: ApprovalRule, timesheet: any): boolean => {
    const { conditions } = rule;

    // Check location verification
    if (conditions.locationVerified !== undefined) {
      if (timesheet.location_verified !== conditions.locationVerified) {
        return false;
      }
    }

    // Check hours worked
    if (conditions.maxHours !== undefined) {
      if ((timesheet.duration_generated || 0) > conditions.maxHours) {
        return false;
      }
    }

    if (conditions.minHours !== undefined) {
      if ((timesheet.duration_generated || 0) < conditions.minHours) {
        return false;
      }
    }

    // Check project IDs
    if (conditions.projectIds && conditions.projectIds.length > 0) {
      if (!timesheet.project_id || !conditions.projectIds.includes(timesheet.project_id)) {
        return false;
      }
    }

    // Check user IDs
    if (conditions.userIds && conditions.userIds.length > 0) {
      if (!conditions.userIds.includes(timesheet.user_id)) {
        return false;
      }
    }

    return true;
  };

  const processAutoApprovals = async (approvals: any[]) => {
    try {
      const approveIds = approvals.filter(a => a.action === 'approve').map(a => a.timesheetId);
      const rejectIds = approvals.filter(a => a.action === 'reject').map(a => a.timesheetId);

      if (approveIds.length > 0) {
        await supabase
          .from('timesheets')
          .update({ approved: true, updated_at: new Date().toISOString() })
          .in('id', approveIds);
      }

      if (rejectIds.length > 0) {
        await supabase
          .from('timesheets')
          .update({ approved: false, updated_at: new Date().toISOString() })
          .in('id', rejectIds);
      }

      toast({
        title: "Auto-processing Complete",
        description: `${approveIds.length} approved, ${rejectIds.length} rejected automatically`
      });
    } catch (error) {
      console.error('Error processing auto approvals:', error);
    }
  };

  const getTimesheetPriority = (timesheet: any): 'high' | 'medium' | 'low' => {
    const hours = timesheet.duration_generated || 0;
    const earnings = timesheet.total_earnings || 0;
    const isOvertime = hours > 8;
    const isHighValue = earnings > 200;
    const isUnverified = !timesheet.location_verified;

    if (isOvertime || isHighValue || isUnverified) {
      return 'high';
    }

    if (earnings > 100 || hours > 6) {
      return 'medium';
    }

    return 'low';
  };

  const sortTimesheetsByPriority = (timesheets: any[]) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return [...timesheets].sort((a, b) => {
      const aPriority = getTimesheetPriority(a);
      const bPriority = getTimesheetPriority(b);
      
      const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort by earnings (highest first)
      const aEarnings = a.total_earnings || 0;
      const bEarnings = b.total_earnings || 0;
      
      return bEarnings - aEarnings;
    });
  };

  // Load approval rules (could be from localStorage or API)
  const loadApprovalRules = () => {
    const defaultRules: ApprovalRule[] = [
      {
        id: 'auto-approve-verified',
        name: 'Auto-approve verified shifts under 8 hours',
        conditions: {
          locationVerified: true,
          maxHours: 8
        },
        action: 'auto_approve',
        priority: 1,
        enabled: true
      },
      {
        id: 'flag-overtime',
        name: 'Flag overtime shifts for review',
        conditions: {
          minHours: 8
        },
        action: 'flag_review',
        priority: 2,
        enabled: true
      },
      {
        id: 'reject-unverified-long',
        name: 'Auto-reject unverified shifts over 10 hours',
        conditions: {
          locationVerified: false,
          minHours: 10
        },
        action: 'auto_reject',
        priority: 3,
        enabled: false
      }
    ];

    setApprovalRules(defaultRules);
  };

  return {
    selectedTimesheets,
    isProcessing,
    approvalRules,
    toggleTimesheetSelection,
    selectAllTimesheets,
    clearSelection,
    bulkApprove,
    bulkReject,
    applyAutomaticApproval,
    getTimesheetPriority,
    sortTimesheetsByPriority,
    loadApprovalRules
  };
};