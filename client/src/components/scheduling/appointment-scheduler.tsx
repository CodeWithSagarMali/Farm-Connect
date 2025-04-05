import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, addDays, parse, isAfter, addMinutes } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, CalendarIcon, Clock } from 'lucide-react';
import { Availability, User } from '@shared/schema';

interface AppointmentSchedulerProps {
  specialist: User;
  onScheduleConfirmed: (scheduledTime: Date, duration: number, specialistId: number, topic: string) => void;
}

type TimeSlot = {
  time: string;
  available: boolean;
  timeDate: Date;
};

const DURATIONS = [15, 30, 45, 60];

export default function AppointmentScheduler({ specialist, onScheduleConfirmed }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [consultationTopic, setConsultationTopic] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch specialist's availability
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/availability/${specialist.id}`);
        if (response.ok) {
          const data = await response.json();
          setAvailabilities(data);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAvailability();
  }, [specialist.id]);
  
  // Generate time slots based on selected date and specialist's availability
  useEffect(() => {
    if (!selectedDate || availabilities.length === 0) return;
    
    // Get day of week (0-6, where 0 is Sunday)
    const dayOfWeek = selectedDate.getDay();
    
    // Find availability for selected day
    const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }
    
    const slots: TimeSlot[] = [];
    const startTime = parse(dayAvailability.startTime, 'HH:mm', selectedDate);
    const endTime = parse(dayAvailability.endTime, 'HH:mm', selectedDate);
    
    let current = startTime;
    
    // Generate 30-minute slots between start and end time
    while (current < endTime) {
      const timeString = format(current, 'HH:mm');
      
      // Check if it's not in the past for today
      const isAvailable = !isToday(selectedDate) || 
        isAfter(current, addMinutes(new Date(), 30));
      
      slots.push({
        time: timeString,
        available: isAvailable,
        timeDate: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          current.getHours(),
          current.getMinutes()
        )
      });
      
      current = addMinutes(current, 30);
    }
    
    setTimeSlots(slots);
  }, [selectedDate, availabilities]);
  
  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };
  
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleScheduleAppointment = () => {
    if (!selectedTime || !selectedDate) return;
    
    // Create date object for selected time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );
    
    onScheduleConfirmed(scheduledDateTime, selectedDuration, specialist.id, consultationTopic);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold">Schedule an Appointment</CardTitle>
        <CardDescription>
          Book a consultation with {specialist.fullName}
          {specialist.specialization ? ` - ${specialist.specialization}` : ''}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={`step-${currentStep}`} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger 
              value="step-1" 
              className={currentStep >= 1 ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              onClick={() => goToStep(1)}
            >
              1. Choose Date
            </TabsTrigger>
            <TabsTrigger 
              value="step-2" 
              className={currentStep >= 2 ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              onClick={() => currentStep >= 2 ? goToStep(2) : null}
              disabled={currentStep < 2}
            >
              2. Select Time
            </TabsTrigger>
            <TabsTrigger 
              value="step-3" 
              className={currentStep >= 3 ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              onClick={() => currentStep >= 3 ? goToStep(3) : null}
              disabled={currentStep < 3}
            >
              3. Confirm Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="step-1" className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="calendar-container w-full max-w-sm p-4 border rounded-lg bg-card">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 60)}
                  className="mx-auto"
                />
              </div>
              
              <div className="mt-6 w-full text-center">
                <p className="mb-2 text-lg font-medium">You selected: <span className="font-semibold">{formatDate(selectedDate)}</span></p>
                
                <Button 
                  className="mt-4 w-full max-w-xs"
                  onClick={() => goToStep(2)}
                  disabled={!selectedDate}
                >
                  Continue <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step-2" className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-4">Available time slots for {formatDate(selectedDate)}</h3>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map(slot => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        className={`justify-center py-6 ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        <Clock size={14} className="mr-2" />
                        {format(parse(slot.time, 'HH:mm', new Date()), 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No available time slots for this day. Please select another date.
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mt-8 mb-4">Select consultation duration</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DURATIONS.map(duration => (
                    <Button
                      key={duration}
                      variant={selectedDuration === duration ? "default" : "outline"}
                      className="justify-center"
                      onClick={() => setSelectedDuration(duration)}
                    >
                      {duration} minutes
                    </Button>
                  ))}
                </div>
                
                <div className="mt-6 flex space-x-3 justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => goToStep(1)}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    onClick={() => goToStep(3)}
                    disabled={!selectedTime}
                  >
                    Continue <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step-3" className="space-y-4">
            <div className="w-full">
              <div className="bg-muted p-5 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialist:</span>
                    <span className="font-medium">{specialist.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialization:</span>
                    <span className="font-medium">{specialist.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {selectedTime && format(parse(selectedTime, 'HH:mm', new Date()), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{selectedDuration} minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="topic" 
                  className="block text-sm font-medium mb-2"
                >
                  Consultation Topic/Issue (optional)
                </label>
                <textarea
                  id="topic"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Briefly describe your agricultural issue or topic you'd like to discuss"
                  value={consultationTopic}
                  onChange={(e) => setConsultationTopic(e.target.value)}
                />
              </div>
              
              <div className="mt-6 flex space-x-3 justify-between">
                <Button 
                  variant="outline"
                  onClick={() => goToStep(2)}
                >
                  Back
                </Button>
                
                <Button 
                  onClick={handleScheduleAppointment}
                >
                  Confirm Appointment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}