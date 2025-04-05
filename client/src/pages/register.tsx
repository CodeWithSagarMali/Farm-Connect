import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "farmer", // Default role
    specialization: "",
    bio: "",
  });
  
  const [error, setError] = useState("");
  const { registerUser, isLoading, user } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      setLocation(redirectPath);
    }
  }, [user, setLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Create register payload based on schema requirements
      const registerData = {
        ...formData,
        role: formData.role as "farmer" | "specialist"
      };
      
      await registerUser(registerData);
      // Redirect handled by useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="farmer">Farmer</option>
                <option value="specialist">Agricultural Specialist</option>
              </select>
            </div>
            
            {formData.role === 'specialist' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="specialization" className="text-sm font-medium">
                    Specialization
                  </label>
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    required={formData.role === 'specialist'}
                    placeholder="e.g., Crop Disease, Soil Expert, Livestock Management"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Brief description of your background and expertise"
                  />
                </div>
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={() => setLocation("/login")}
          >
            Already have an account? Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}