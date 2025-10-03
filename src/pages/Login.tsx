import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      {/* Left side - decorative area */}
      <div className="hidden md:flex md:w-1/2 bg-muted" />
      
      {/* Right side - login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Enter Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Enter password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="w-full"
              />
            </div>
          </div>
          
          <Button 
            className="w-full"
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;