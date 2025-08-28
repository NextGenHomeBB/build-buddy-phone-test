import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface EnhancedTimesheet {
  id: string;
  user_id: string;
  project_id?: string;
  start_time: string;
  end_time?: string;
  start_location?: any;
  end_location?: any;
  start_photo_url?: string;
  end_photo_url?: string;
  location_verified: boolean;
  duration_generated?: number;
  notes?: string;
}

export function useEnhancedTimeTracking() {
  const [activeShift, setActiveShift] = useState<EnhancedTimesheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const { toast } = useToast();

  // Get current location
  const getCurrentLocation = (): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GPSLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  // Capture photo using camera
  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No photo captured'));
          return;
        }

        try {
          // Upload to Supabase Storage
          const fileName = `timesheet-photos/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('task-photos')
            .upload(fileName, file);

          if (error) throw error;

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('task-photos')
            .getPublicUrl(data.path);

          resolve(publicUrlData.publicUrl);
        } catch (error) {
          console.error('Photo upload error:', error);
          reject(error);
        }
      };

      input.click();
    });
  };

  // Fetch active shift
  const fetchActiveShift = async () => {
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setActiveShift(data || null);
    } catch (error) {
      console.error('Error fetching active shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start shift with GPS and photo
  const startShift = async (projectId?: string, requirePhoto: boolean = true) => {
    try {
      setIsLoading(true);
      
      // Get location
      let startLocation: GPSLocation | null = null;
      try {
        startLocation = await getCurrentLocation();
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
        toast({
          title: "Location Warning",
          description: "Could not get your location. Shift will start without location verification.",
          variant: "destructive"
        });
      }

      // Capture photo if required
      let startPhotoUrl: string | undefined;
      if (requirePhoto) {
        try {
          startPhotoUrl = await capturePhoto();
        } catch (photoError) {
          console.warn('Could not capture photo:', photoError);
          toast({
            title: "Photo Warning", 
            description: "Could not capture start photo. Continue anyway?",
            variant: "destructive"
          });
        }
      }

      // Create timesheet
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          user_id: user.id,
          project_id: projectId,
          start_location: startLocation as any,
          start_photo_url: startPhotoUrl,
          notes: 'Mobile shift started'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveShift(data);
      toast({
        title: "Shift Started",
        description: startLocation 
          ? "Shift started with location verification" 
          : "Shift started successfully"
      });

      return data;
    } catch (error) {
      console.error('Error starting shift:', error);
      toast({
        title: "Error",
        description: "Failed to start shift. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // End shift with GPS and photo
  const endShift = async (requirePhoto: boolean = true) => {
    if (!activeShift) return;

    try {
      setIsLoading(true);

      // Get location  
      let endLocation: GPSLocation | null = null;
      try {
        endLocation = await getCurrentLocation();
      } catch (locationError) {
        console.warn('Could not get end location:', locationError);
      }

      // Capture photo if required
      let endPhotoUrl: string | undefined;
      if (requirePhoto) {
        try {
          endPhotoUrl = await capturePhoto();
        } catch (photoError) {
          console.warn('Could not capture end photo:', photoError);
        }
      }

      // Update timesheet
      const { data, error } = await supabase
        .from('timesheets')
        .update({
          end_time: new Date().toISOString(),
          end_location: endLocation as any,
          end_photo_url: endPhotoUrl
        })
        .eq('id', activeShift.id)
        .select()
        .single();

      if (error) throw error;

      setActiveShift(null);
      toast({
        title: "Shift Ended",
        description: `Shift completed. Duration: ${Math.round((data.duration_generated || 0) * 60)} minutes`
      });

      return data;
    } catch (error) {
      console.error('Error ending shift:', error);
      toast({
        title: "Error", 
        description: "Failed to end shift. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!activeShift) return 0;
    
    const startTime = new Date(activeShift.start_time).getTime();
    const currentTime = Date.now();
    return Math.floor((currentTime - startTime) / 1000); // seconds
  };

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchActiveShift();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('timesheets-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timesheets'
      }, () => {
        fetchActiveShift();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activeShift,
    isLoading,
    location,
    startShift,
    endShift,
    getCurrentLocation,
    capturePhoto,
    getElapsedTime,
    formatElapsedTime,
    refetch: fetchActiveShift
  };
}