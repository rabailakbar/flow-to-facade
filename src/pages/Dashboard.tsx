import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase  from "@/utils/supabase";
import { useState,useEffect } from "react";
const Dashboard = () => {

  const BUCKET_NAME = 'Thesis'; 
const FOLDER_NAME = 'Modules'; 


useEffect(()=>{
fetchImages()
},[])
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState([]);

  const fetchImages = async () => {
    // List files from the 'module' folder
    console.log("checking supabase",supabase.storage)
    
    const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list('',{ limit: 100, }); 
  
console.log("Files:", data);
    // if (error) {
    //   console.error('Error listing images:', error.message);
    //   return;
    // }

//     // Generate public URLs for each file
     const urls = data.map((file) => {
       const url = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${FOLDER_NAME}/${file.name}`);
       return url;
     });
 console.log("image url",urls)
     setImageUrls(urls);
  };


  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-md transition-colors">
            <Code className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 bg-muted rounded-full">
            <User className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <Card className="p-6 mb-8 relative">
        <div className="flex gap-6">
          <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Welcome to askwhy!</h2>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        <Button 
          className="absolute bottom-4 right-4"
          onClick={() => navigate("/module?id=M1&name=Pick & Flick&phase=Phase i")}
        >
          Click here to start
        </Button>
      </Card>

      {/* Phases Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Phase i */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">Phase i</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M1
              </div>
              <div className="flex-1 p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M2
              </div>
            </div>
            <div className="p-2 bg-muted rounded text-xs text-center text-muted-foreground">
              <div>📊 MILESTONE 1/2</div>
            </div>
          </div>
        </Card>

        {/* Phase ii */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">Phase ii</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div 
                className="p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate("/module?id=M3&name=Fake or Fact?&phase=Phase II")}
              >
                M3
              </div>
              <div className="p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M4
              </div>
              <div className="p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M5
              </div>
            </div>
            <div className="p-2 bg-muted rounded text-xs text-center text-muted-foreground">
              <div>📊 CURRENT PHASE</div>
            </div>
          </div>
        </Card>

        {/* Phase iii */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-center">Phase iii</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M7
              </div>
              <div className="flex-1 p-3 bg-muted rounded border-2 border-dashed border-border text-center text-sm font-medium">
                M8
              </div>
            </div>
            <div className="p-2 bg-muted rounded text-xs text-center text-muted-foreground">
              <div>📊 MILESTONE 0/2</div>
            </div>
          </div>
        </Card>
      </div>

      {/* My Modules Section */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg">My Modules</h3>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/module?id=M1&name=Pick & Flick&phase=Phase i")}
        >
          <div className="aspect-square bg-muted rounded-md mb-3" />
          <h4 className="font-semibold text-sm mb-2">Pick & flick</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Let's help you build your newsfeed
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>📄 10 exercises</span>
          </div>
        </Card>

        {[1, 2, 3, 4].map((i) => {
          const moduleNumber = i + 1;
          const isModule3 = moduleNumber === 3;
          const moduleName = isModule3 ? "Fake or Fact?" : "Let's blow bubbles";
          const moduleDesc = isModule3 
            ? "Is everything around us real or fake?" 
            : "Let's help you build your newsfeed";
          const phase = isModule3 ? "Phase II" : "Phase ii";
          
          return (
            <Card 
              key={i} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/module?id=M${moduleNumber}&name=${moduleName}&phase=${phase}`)}
            >
              <div className="aspect-square bg-muted rounded-md mb-3" />
              <h4 className="font-semibold text-sm mb-2">{moduleName}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {moduleDesc}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📄 10 exercises</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;