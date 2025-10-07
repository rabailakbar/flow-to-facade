import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, BookOpen, Star, Bookmark } from "lucide-react";

const Module = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  
  const moduleId = searchParams.get("id") || "M1";
  const moduleName = searchParams.get("name") || "Pick & Flick";
  const phase = searchParams.get("phase") || "Phase i";

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate("/dashboard"), 200);
  };

  // Module-specific content
  const getModuleContent = () => {
    switch(moduleId) {
      case "M3":
        return {
          description: "In this module, students compare different types of content to identify what is fake. They will interact with four formats: two-post comparisons, three-post comparisons, TikTok vs Instagram reels, and carousel posts. To detect fake content, students must evaluate details such as the source, date and time, possible AI-generated or photoshopped images, advertisements, and engagement counts.",
          level: "Mid Level",
          time: "Time",
          scoreInfo: "Score is calculated in this module"
        };
      default:
        return {
          description: "In this module, students will filter out content for themselves, from a pool of 50 topics, they are supposed to find the content into buckets of 'interested' or 'not interested'. These picks will shape their personal newsfeed for the new module.",
          level: "Beginner Level",
          time: "10 min",
          scoreInfo: "5 out 5 not being calculated in the module"
        };
    }
  };

  const moduleContent = getModuleContent();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Background modules */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{moduleId}: {moduleName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="aspect-square bg-muted rounded-lg" />
        </div>
        
        <div className="mt-8 text-muted-foreground">{moduleId}</div>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <Bookmark className="w-16 h-20 fill-muted stroke-muted-foreground/20" />
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold pt-2">
                  {moduleId}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{phase}</p>
                <h2 className="text-2xl font-semibold">{moduleName}</h2>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium">Walkthrough Video</p>
                <p className="text-xs">(small screen recording)</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm text-muted-foreground">
              <p>{moduleContent.description}</p>
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{moduleContent.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{moduleContent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{moduleContent.scoreInfo}</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-end">
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/exercise?id=${moduleId}&name=${moduleName}`)}
              >
                Click here to start
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Module;