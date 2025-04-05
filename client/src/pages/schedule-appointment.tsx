import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { User, Call } from '@shared/schema';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/use-auth';
import AppointmentScheduler from '@/components/scheduling/appointment-scheduler';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Calendar, Users } from 'lucide-react';

export default function ScheduleAppointmentPage() {
  const [, setLocation] = useLocation();
  const [selectedSpecialist, setSelectedSpecialist] = useState<User | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch specialists
  const { data: specialists, isLoading: loadingSpecialists } = useQuery<User[]>({
    queryKey: ['/api/users/specialists'],
  });
  
  // Schedule call mutation
  const scheduleMutation = useMutation({
    mutationFn: async (callData: {
      farmerId: number;
      specialistId: number;
      scheduledTime: string;
      duration: number;
      status: string;
      topic?: string;
    }) => {
      const res = await apiRequest<Call>('POST', '/api/calls', callData);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been successfully scheduled.",
        variant: "success",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      // Redirect to dashboard/calls page
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Schedule Appointment",
        description: error.message || "An error occurred while scheduling your appointment.",
        variant: "destructive",
      });
    },
  });
  
  const handleSelectSpecialist = (specialist: User) => {
    setSelectedSpecialist(specialist);
  };
  
  const handleScheduleConfirmed = (
    scheduledTime: Date,
    duration: number,
    specialistId: number,
    topic: string
  ) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule an appointment.",
        variant: "destructive",
      });
      return;
    }
    
    // Create call data
    const callData = {
      farmerId: user.id,
      specialistId,
      scheduledTime: scheduledTime.toISOString(),
      duration,
      status: "scheduled",
      topic: topic || undefined,
    };
    
    // Submit the scheduling request
    scheduleMutation.mutate(callData);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule a Consultation</h1>
        <p className="text-muted-foreground">
          Connect with agricultural specialists for expert advice and solutions
        </p>
      </div>
      
      {selectedSpecialist ? (
        // Show appointment scheduler for selected specialist
        <div>
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSpecialist(null)}
            >
              <ArrowLeft size={16} className="mr-2" /> Choose a different specialist
            </Button>
          </div>
          
          <AppointmentScheduler 
            specialist={selectedSpecialist}
            onScheduleConfirmed={handleScheduleConfirmed}
          />
        </div>
      ) : (
        // Show specialist selection
        <div>
          <h2 className="text-2xl font-semibold mb-6">Select a Specialist</h2>
          
          {loadingSpecialists ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : specialists && specialists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialists.map((specialist) => (
                <Card key={specialist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      {specialist.profilePicture ? (
                        <img 
                          src={specialist.profilePicture} 
                          alt={specialist.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {specialist.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle>{specialist.fullName}</CardTitle>
                        <CardDescription>
                          {specialist.specialization || 'Agricultural Specialist'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {specialist.bio || 'Experienced agricultural specialist available for consultations.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {specialist.rating ? (
                        <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center">
                          ★ {specialist.rating.toFixed(1)} Rating
                        </div>
                      ) : null}
                      {specialist.totalCalls ? (
                        <div className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center">
                          <Users size={14} className="mr-1" /> {specialist.totalCalls} Consultations
                        </div>
                      ) : null}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSelectSpecialist(specialist)}
                    >
                      <Calendar size={16} className="mr-2" /> Schedule Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No specialists are currently available. Please check back later.
            </div>
          )}
        </div>
      )}
    </div>
  );
}