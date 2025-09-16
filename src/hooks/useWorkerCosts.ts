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
  console.log('🎯 useWorkerCosts hook initialized');
  
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const { toast } = useToast();

  console.log('🔧 useWorkerCosts state initialized, about to define loadWorkers...');

  const loadWorkers = async () => {
    try {
      console.log('🔄 Loading worker data...');
      setLoading(true);
      
      // Fetch all workers from profiles table
      console.log('📋 Fetching profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_placeholder', false);

      if (profilesError) {
        console.error('❌ Profiles error:', profilesError);
        throw profilesError;
      }
      console.log('✅ Profiles loaded:', profilesData?.length || 0, 'profiles');

      // Fetch current worker rates
      console.log('📊 Fetching worker rates...');
      const { data: ratesData, error: ratesError } = await supabase
        .from('worker_rates')
        .select('*')
        .order('effective_date', { ascending: false });

      if (ratesError) {
        console.error('❌ Rates error:', ratesError);
        throw ratesError;
      }
      console.log('✅ Rates loaded:', ratesData?.length || 0, 'rates');

      // Fetch worker skills
      console.log('🛠️ Fetching worker skills...');
      const { data: skillsData, error: skillsError } = await supabase
        .from('worker_skills')
        .select('user_id, skill_name, skill_level, certified');

      if (skillsError) {
        console.error('❌ Skills error:', skillsError);
        throw skillsError;
      }
      console.log('✅ Skills loaded:', skillsData?.length || 0, 'skills');

      // Fetch labour entries for the current month to calculate hours and earnings
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      console.log('⏰ Fetching labour entries for month:', currentMonth);
      
      const { data: labourData, error: labourError } = await supabase
        .from('labour_entries')
        .select('user_id, total_hours, total_cost, created_at')
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${new Date().toISOString().slice(0, 8)}31`); // End of month

      if (labourError) {
        console.error('❌ Labour entries error:', labourError);
        throw labourError;
      }
      console.log('✅ Labour entries loaded:', labourData?.length || 0, 'entries');

      // Fetch payroll entries for payment history
      console.log('💰 Fetching payroll entries...');
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (payrollError) {
        console.error('❌ Payroll entries error:', payrollError);
        throw payrollError;
      }
      console.log('✅ Payroll entries loaded:', payrollData?.length || 0, 'entries');

      // Fetch payroll periods separately
      console.log('📅 Fetching payroll periods...');
      const { data: periodsData, error: periodsError } = await supabase
        .from('payroll_periods')
        .select('*');

      if (periodsError) {
        console.error('❌ Payroll periods error:', periodsError);
        throw periodsError;
      }
      console.log('✅ Payroll periods loaded:', periodsData?.length || 0, 'periods');

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
      console.log('✅ Workers processed successfully:', workersWithStats.length, 'workers');

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
      console.log('✅ Payment history processed:', paymentsHistory.length, 'payments');
      console.log('🎉 Worker data loaded successfully!');

    } catch (error) {
      console.error('💥 Failed to load worker data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Data Loading Error",
        description: `Failed to load worker data: ${errorMessage}`,
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
      console.log('💰 Updating worker rate:', { workerId, newRate, effectiveDate, notes });
      
      const { error } = await supabase
        .from('worker_rates')
        .insert({
          user_id: workerId,
          hourly_rate: newRate,
          effective_date: effectiveDate,
          notes: notes,
        });

      if (error) {
        console.error('❌ Rate update error:', error);
        throw error;
      }

      console.log('✅ Worker rate updated successfully');
      toast({
        title: "Rate Updated Successfully",
        description: `Hourly rate updated to $${newRate}/hr effective ${effectiveDate}`,
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('💥 Failed to update worker rate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Rate Update Failed",
        description: `Could not update worker rate: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const processPayment = async (workerId: string, amount: number, period: string, method: string = 'bank_transfer') => {
    try {
      console.log('💳 Processing payment:', { workerId, amount, period, method });
      
      // First check if we have a payroll period for this period
      let payrollPeriodId;
      const { data: existingPeriod } = await supabase
        .from('payroll_periods')
        .select('id')
        .eq('name', period)
        .single();

      if (existingPeriod) {
        payrollPeriodId = existingPeriod.id;
        console.log('📅 Using existing payroll period:', payrollPeriodId);
      } else {
        console.log('📅 Creating new payroll period:', period);
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

        if (periodError) {
          console.error('❌ Period creation error:', periodError);
          throw periodError;
        }
        payrollPeriodId = newPeriod.id;
        console.log('✅ New payroll period created:', payrollPeriodId);
      }

      // Create payroll entry
      console.log('💰 Creating payroll entry...');
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

      if (error) {
        console.error('❌ Payment processing error:', error);
        throw error;
      }

      console.log('✅ Payment processed successfully');
      toast({
        title: "Payment Processed Successfully",
        description: `$${amount.toLocaleString()} payment processed for ${period}`,
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('💥 Failed to process payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Payment Processing Failed",
        description: `Could not process payment: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const createWorkerSkill = async (workerId: string, skillName: string, skillLevel: number = 1, certified: boolean = false) => {
    try {
      console.log('🛠️ Adding worker skill:', { workerId, skillName, skillLevel, certified });
      
      const { error } = await supabase
        .from('worker_skills')
        .insert({
          user_id: workerId,
          skill_name: skillName,
          skill_level: skillLevel,
          certified: certified,
        });

      if (error) {
        console.error('❌ Skill creation error:', error);
        throw error;
      }

      console.log('✅ Worker skill added successfully');
      toast({
        title: "Skill Added Successfully", 
        description: `Added ${skillName} (Level ${skillLevel}) ${certified ? 'with certification' : ''}`,
      });
      loadWorkers(); // Refresh data
    } catch (error) {
      console.error('💥 Failed to add worker skill:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Skill Addition Failed",
        description: `Could not add worker skill: ${errorMessage}`,
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