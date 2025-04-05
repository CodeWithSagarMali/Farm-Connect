import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "wouter";
import { Calendar, Phone, Clock, Users, BarChart2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { format } from 'date-fns';

// Define the type for calls
interface Call {
  id: number;
  farmerId: number;
  specialistId: number;
  scheduledTime: string;
  duration: number;
  status: string;
  topic: string;
  farmer?: {
    id: number;
    fullName: string;
    profilePicture: string | null;
  };
  specialist?: {
    id: number;
    fullName: string;
    specialization: string | null;
    profilePicture: string | null;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [upcomingCalls, setUpcomingCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch actual call data from API
        const response = await fetch(`/api/calls/user/${user.id}`);
        
        if (!response.ok) {
          // Handle 404 specifically as a non-critical error
          if (response.status === 404) {
            console.log('No data found for this user. User may be new or not exist in the system.');
            setUpcomingCalls([]);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch calls');
        }
        
        const callsData = await response.json();
        // Filter for only upcoming calls
        const upcoming = callsData.filter((call: Call) => {
          // Convert scheduledTime string to Date
          const callTime = new Date(call.scheduledTime);
          // Only include calls scheduled in the future with status "scheduled"
          return callTime > new Date() && call.status === 'scheduled';
        });
        
        setUpcomingCalls(upcoming);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.fullName}</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === "farmer" 
              ? "Connect with specialists and manage your agricultural consultations"
              : "Manage your appointments and help farmers with their agricultural needs"}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/schedule-appointment">
              {user.role === "farmer" ? "Schedule Consultation" : "Manage Schedule"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard 
          title="Upcoming Calls" 
          value={isLoading ? "-" : upcomingCalls.length.toString()} 
          description="Scheduled consultations"
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        
        <DashboardCard 
          title="Total Calls" 
          value={user.totalCalls?.toString() || "0"} 
          description="Completed consultations"
          icon={<Phone className="h-5 w-5" />}
          color="green"
        />
        
        {user.role === "specialist" ? (
          <>
            <DashboardCard 
              title="Rating" 
              value={user.rating ? user.rating.toString() : "N/A"} 
              description="Average farmer feedback"
              icon={<BarChart2 className="h-5 w-5" />}
              color="amber"
            />
            
            <DashboardCard 
              title="Farmers Helped" 
              value="0" 
              description="Unique consultations"
              icon={<Users className="h-5 w-5" />}
              color="purple"
            />
          </>
        ) : (
          <>
            <DashboardCard 
              title="Specialists Consulted" 
              value="0" 
              description="Unique specialists"
              icon={<Users className="h-5 w-5" />}
              color="purple"
            />
            
            <DashboardCard 
              title="Time Saved" 
              value="0h" 
              description="Through virtual consultations"
              icon={<Clock className="h-5 w-5" />}
              color="amber"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : upcomingCalls.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No upcoming calls scheduled</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/schedule-appointment">
                    {user.role === "farmer" ? "Schedule Consultation" : "Set Your Availability"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingCalls.map((call) => (
                  <div key={call.id} className="flex items-start p-4 border rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {user.role === "farmer" 
                          ? `Call with ${call.specialist?.fullName || 'Specialist'}`
                          : `Call with ${call.farmer?.fullName || 'Farmer'}`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Topic: {call.topic}
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <Calendar className="w-4 h-4 mr-1" /> 
                        {format(new Date(call.scheduledTime), 'PPP')}
                        <Clock className="w-4 h-4 ml-3 mr-1" /> 
                        {format(new Date(call.scheduledTime), 'p')}
                        <span className="ml-3">{call.duration} min</span>
                      </div>
                    </div>
                    <Button size="sm" className="ml-2">
                      Join Call
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {user.role === "farmer" ? "Recent AI Assistance" : "Frequently Asked Questions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.role === "farmer" ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No recent AI assistant activity</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/ai-assistant">
                    Ask the AI Assistant
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Track common questions from farmers here</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/knowledge-base">
                    Browse Knowledge Base
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
}

function DashboardCard({ title, value, description, icon, color }: DashboardCardProps) {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500/10 text-blue-700";
      case "green":
        return "bg-green-500/10 text-green-700";
      case "amber":
        return "bg-amber-500/10 text-amber-700";
      case "purple":
        return "bg-purple-500/10 text-purple-700";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-2 ${getColorClass()}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <h3 className="text-2xl font-bold">
              {value}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}