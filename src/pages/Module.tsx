import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, BookOpen } from "lucide-react";

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
        <DialogContent className="max-w-lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="px-3 py-1 bg-muted rounded text-sm font-semibold">
                {moduleId}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{phase}</p>
                <h2 className="text-lg font-semibold">Module 1: {moduleName}</h2>
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
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                In this module, students will filter out content for themselves, from a pool of 50 topics, they are
                supposed to find the content into buckets of <span className="font-semibold text-foreground">'interested'</span> or <span className="font-semibold text-foreground">'not interested'</span>. These picks will shape
                their personal newsfeed for the new module.
              </p>
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Beginner Level</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>10 min</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>5 out 5 not being calculated in the module</span>
              </div>
            </div>

            {/* Start Button */}
            <Button className="w-full" size="lg">
              Click here to start
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Module;