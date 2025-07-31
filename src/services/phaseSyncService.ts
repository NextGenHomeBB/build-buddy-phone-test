import { supabase } from '@/integrations/supabase/client';

export interface SyncReport {
  success: boolean;
  message: string;
  phasesUpdated: number;
  tasksCreated: number;
  errors: string[];
}

export const phaseSyncService = {
  /**
   * Sync all project phases with their corresponding default templates
   */
  async syncAllPhasesWithDefaults(): Promise<SyncReport> {
    try {
      // Get all default phases
      const { data: defaultPhases, error: defaultPhasesError } = await supabase
        .from('default_phases')
        .select('*')
        .order('display_order');

      if (defaultPhasesError) throw defaultPhasesError;

      let phasesUpdated = 0;
      let tasksCreated = 0;
      const errors: string[] = [];

      // For each default phase, find and update matching project phases
      for (const defaultPhase of defaultPhases) {
        try {
          const result = await this.syncPhaseWithDefault(defaultPhase.name, defaultPhase.checklist);
          phasesUpdated += result.phasesUpdated;
          tasksCreated += result.tasksCreated;
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
        } catch (error) {
          errors.push(`Failed to sync phase "${defaultPhase.name}": ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        message: `Sync completed. Updated ${phasesUpdated} phases, created ${tasksCreated} tasks.`,
        phasesUpdated,
        tasksCreated,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error}`,
        phasesUpdated: 0,
        tasksCreated: 0,
        errors: [String(error)]
      };
    }
  },

  /**
   * Sync specific phase name with its default template
   */
  async syncPhaseWithDefault(phaseName: string, defaultChecklist: string[]): Promise<SyncReport> {
    try {
      // Find all project phases that match this name (case-insensitive)
      const { data: projectPhases, error: phasesError } = await supabase
        .from('project_phases')
        .select('id, project_id, name')
        .ilike('name', `%${phaseName}%`);

      if (phasesError) throw phasesError;

      let phasesUpdated = 0;
      let tasksCreated = 0;
      const errors: string[] = [];

      for (const phase of projectPhases) {
        try {
          // Get existing tasks for this phase
          const { data: existingTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('title')
            .eq('phase_id', phase.id);

          if (tasksError) throw tasksError;

          const existingTaskTitles = new Set(existingTasks.map(task => task.title));
          const newTasks = [];

          // Create tasks for checklist items that don't exist yet
          for (const checklistItem of defaultChecklist) {
            if (!existingTaskTitles.has(checklistItem)) {
              newTasks.push({
                title: checklistItem,
                description: `${phase.name} - ${checklistItem}`,
                project_id: phase.project_id,
                phase_id: phase.id,
                priority: 'medium',
                status: 'todo'
              });
            }
          }

          // Insert new tasks if any
          if (newTasks.length > 0) {
            const { error: insertError } = await supabase
              .from('tasks')
              .insert(newTasks);

            if (insertError) {
              errors.push(`Failed to create tasks for phase "${phase.name}": ${insertError.message}`);
            } else {
              tasksCreated += newTasks.length;
              phasesUpdated++;
            }
          }
        } catch (error) {
          errors.push(`Failed to sync phase "${phase.name}" (ID: ${phase.id}): ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        message: `Synced ${phasesUpdated} phases, created ${tasksCreated} new tasks.`,
        phasesUpdated,
        tasksCreated,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to sync phase "${phaseName}": ${error}`,
        phasesUpdated: 0,
        tasksCreated: 0,
        errors: [String(error)]
      };
    }
  },

  /**
   * Standardize phase names by updating default phase name
   */
  async standardizePhaseName(currentName: string, newName: string): Promise<SyncReport> {
    try {
      // Update the default phase name
      const { error: updateError } = await supabase
        .from('default_phases')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('name', currentName);

      if (updateError) throw updateError;

      // Update all project phases with the old name
      const { data: updatedPhases, error: projectUpdateError } = await supabase
        .from('project_phases')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('name', currentName)
        .select('id');

      if (projectUpdateError) throw projectUpdateError;

      return {
        success: true,
        message: `Standardized phase name from "${currentName}" to "${newName}". Updated ${updatedPhases.length} project phases.`,
        phasesUpdated: updatedPhases.length,
        tasksCreated: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to standardize phase name: ${error}`,
        phasesUpdated: 0,
        tasksCreated: 0,
        errors: [String(error)]
      };
    }
  }
};