import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface WorkerData {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  hoursThisMonth: number;
  totalEarnings: number;
  status: string;
  lastPayment: string;
  phone?: string;
  avatar_url?: string;
  skills?: string[];
  currentRateId?: string;
}

export interface PaymentData {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  period: string;
  status: string;
  paidDate: string | null;
  method: string;
}

export interface WorkerRate {
  id: string;
  userId: string;
  hourlyRate: number;
  effectiveDate: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const useWorkerCosts = () => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const { toast } = useToast();

  const loadWorkers = async () => {
    try {
      setLoading(true);
      
      // Fetch all workers from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_placeholder', false);

      if (profilesError) throw profilesError;

      // Fetch current worker rates
      const { data: ratesData, error: ratesError } = await supabase
        .from('worker_rates')
        .select('*')
        .order('effective_date', { ascending: false });

      if (ratesError) throw ratesError;

      // Fetch worker skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('worker_skills')
        .select('user_id, skill_name, skill_level, certified');

      if (skillsError) throw skillsError;

      // Fetch labour entries for the current month to calculate hours and earnings
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data: labourData, error: labourError } = await supabase
        .from('labour_entries')
        .select('user_id, total_hours, total_cost, created_at')
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${new Date().toISOString().slice(0, 8)}31`); // End of month

      if (labourError) throw labourError;

      // Fetch payroll entries for payment history
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (payrollError) throw payrollError;

      // Fetch payroll periods separately
      const { data: periodsData, error: periodsError } = await supabase
        .from('payroll_periods')
        .select('*');

      if (periodsError) throw periodsError;

      // Process and combine the data
      const workersWithStats = profilesData?.map(profile => {
        // Get current rate for this worker
        const currentRate = ratesData?.find(rate => rate.user_id === profile.user_id);
        
        // Get skills for this worker
        const workerSkills = skillsData?.filter(skill => skill.user_id === profile.user_id) || [];
        
        // Get labour entries for this month
        const userLabourEntries = labourData?.filter(entry => entry.user_id === profile.user_id) || [];
        
        const totalHours = userLabourEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
        const totalEarnings = userLabourEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);
        
        // Get last payment date
        const lastPayrollEntry = payrollData?.find(entry => entry.user_id === profile.user_id);
        const lastPayment = lastPayrollEntry?.paid_date || null;
        
        return {
          id: profile.user_id,
          name: profile.name,
          role: profile.role === 'admin' ? 'Site Manager' : 
                profile.role === 'manager' ? 'Project Manager' : 
                profile.role === 'worker' ? 'Worker' : 'Team Member',
          hourlyRate: currentRate?.hourly_rate || 25,
          hoursThisMonth: Math.round(totalHours * 10) / 10, // Round to 1 decimal
          totalEarnings: Math.round(totalEarnings),
          status: 'active',
          lastPayment: lastPayment || 'No payments yet',
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          skills: workerSkills.map(skill => `${skill.skill_name} (${skill.skill_level}/5)${skill.certified ? ' ✓' : ''}`),
          currentRateId: currentRate?.id,
        };
      }) || [];

      setWorkers(workersWithStats);

      // Transform payroll data to payment history
      const paymentsHistory = payrollData?.map((entry) => {
        const period = periodsData?.find(p => p.id === entry.payroll_period_id);
        return {
          id: entry.id,
          workerId: entry.user_id,
          workerName: profilesData?.find(p => p.user_id === entry.user_id)?.name || 'Unknown',
          amount: entry.net_pay,
          period: period?.name || 'Unknown Period',
          status: entry.status,
          paidDate: entry.paid_date,
          method: entry.payment_method.replace('_', ' '),
        };
      }) || [];

      setPayments(paymentsHistory);

    } catch (error) {
      console.error('Failed to load worker data:', error);
      toast({
        title: "Error",
        description: "Failed to load worker data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || worker.role.toLowerCase().includes(selectedRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalWorkers: workers.length,
    totalMonthlyPay: workers.reduce((sum, worker) => sum + worker.totalEarnings, 0),
    averageHourlyRate: workers.length > 0 ? 
      workers.reduce((sum, worker) => sum + worker.hourlyRate, 0) / workers.length : 0,
    pendingPayments: payments.filter(p => p.status === "pending").length,
  };

  const updateWorkerRate = async (workerId: string, newRate: number, effectiveDate: string = new Date().toISOString().split('T')[0], notes: string = '') => {
    try {
      const { error } = await supabase
        .from('worker_rates')
        .insert({
          user_id: workerId,
          hourly_rate: newRate,
          effective_date: effectiveDate,
          notes: notes,
        });

      if (error) throw error;

      toast({
        title: "Rate Updated",
        description: "Worker hourly rate has been updated successfully.",
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('Failed to update worker rate:', error);
      toast({
        title: "Error",
        description: "Failed to update worker rate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processPayment = async (workerId: string, amount: number, period: string, method: string = 'bank_transfer') => {
    try {
      // First check if we have a payroll period for this period
      let payrollPeriodId;
      const { data: existingPeriod } = await supabase
        .from('payroll_periods')
        .select('id')
        .eq('name', period)
        .single();

      if (existingPeriod) {
        payrollPeriodId = existingPeriod.id;
      } else {
        // Create new payroll period
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);

        const { data: newPeriod, error: periodError } = await supabase
          .from('payroll_periods')
          .insert({
            name: period,
            start_date: startOfMonth.toISOString().split('T')[0],
            end_date: endOfMonth.toISOString().split('T')[0],
            status: 'active',
          })
          .select('id')
          .single();

        if (periodError) throw periodError;
        payrollPeriodId = newPeriod.id;
      }

      // Create payroll entry
      const { error } = await supabase
        .from('payroll_entries')
        .insert({
          payroll_period_id: payrollPeriodId,
          user_id: workerId,
          regular_hours: 160, // Default full-time hours
          regular_rate: workers.find(w => w.id === workerId)?.hourlyRate || 25,
          gross_pay: amount,
          net_pay: amount * 0.8, // Simplified: 20% deductions
          deductions: amount * 0.2,
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          payment_method: method,
        });

      if (error) throw error;

      toast({
        title: "Payment Processed",
        description: "Payment has been successfully processed.",
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createWorkerSkill = async (workerId: string, skillName: string, skillLevel: number = 1, certified: boolean = false) => {
    try {
      const { error } = await supabase
        .from('worker_skills')
        .insert({
          user_id: workerId,
          skill_name: skillName,
          skill_level: skillLevel,
          certified: certified,
        });

      if (error) throw error;

      toast({
        title: "Skill Added",
        description: "Worker skill has been added successfully.",
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('Failed to add worker skill:', error);
      toast({
        title: "Error",
        description: "Failed to add worker skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    workers: filteredWorkers,
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
    refreshData: loadWorkers,
  };
};