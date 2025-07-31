import { PhaseCalendarData } from '@/hooks/usePhaseCalendar';

export class CalendarExportService {
  static generateICalendar(phases: PhaseCalendarData[], projectName: string = 'Project'): string {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Construction Manager//Project Phases//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    phases.forEach(phase => {
      if (phase.start_date && phase.end_date) {
        const startDate = new Date(phase.start_date);
        const endDate = new Date(phase.end_date);
        
        // Format dates for iCalendar (YYYYMMDD for all-day events)
        const formatDate = (date: Date) => {
          return date.toISOString().slice(0, 10).replace(/-/g, '');
        };

        const uid = `phase-${phase.id}@construction-manager.app`;
        const dtStamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
        
        // Create event description with phase details
        const description = [
          `Phase: ${phase.name}`,
          `Status: ${phase.status}`,
          `Progress: ${phase.progress}%`,
          phase.material_cost > 0 ? `Material Cost: $${phase.material_cost.toLocaleString()}` : '',
          phase.labour_cost > 0 ? `Labour Cost: $${phase.labour_cost.toLocaleString()}` : '',
          phase.material_cost > 0 || phase.labour_cost > 0 ? `Total Cost: $${(phase.material_cost + phase.labour_cost).toLocaleString()}` : ''
        ].filter(Boolean).join('\\n');

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${dtStamp}`,
          `DTSTART;VALUE=DATE:${formatDate(startDate)}`,
          `DTEND;VALUE=DATE:${formatDate(new Date(endDate.getTime() + 24 * 60 * 60 * 1000))}`, // Add 1 day for inclusive end date
          `SUMMARY:${projectName} - ${phase.name}`,
          `DESCRIPTION:${description}`,
          `STATUS:${this.mapStatusToICalendar(phase.status)}`,
          'TRANSP:TRANSPARENT',
          'END:VEVENT'
        );
      }
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }

  static downloadICalendar(phases: PhaseCalendarData[], projectName: string = 'Project'): void {
    const icsContent = this.generateICalendar(phases, projectName);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Phases_Calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  private static mapStatusToICalendar(status: string): string {
    switch (status) {
      case 'completed':
        return 'CONFIRMED';
      case 'active':
        return 'CONFIRMED';
      case 'planning':
        return 'TENTATIVE';
      case 'on-hold':
        return 'TENTATIVE';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'TENTATIVE';
    }
  }
}