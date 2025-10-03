import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Is your algorithm your story?
        </h1>
        
        <div className="w-full aspect-video bg-muted rounded-lg shadow-sm" />
        
        <Button 
          size="lg" 
          className="mt-8 px-8"
          onClick={() => navigate("/login")}
        >
          GET STARTED
        </Button>
      </div>
    </div>
  );
};

export default Index;
