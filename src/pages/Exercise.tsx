import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || "M1";
  const moduleName = searchParams.get("name") || "Pick & Flick";

  const topics = [
    { name: "Instagram poll", gridClass: "row-span-2" },
    { name: "YT Reelss", gridClass: "col-span-2" },
    { name: "IO Text", gridClass: "" },
    { name: "Tweet", gridClass: "" },
    { name: "IT Reel", gridClass: "row-span-3" },
    { name: "Youtube Thumbnail", gridClass: "col-span-2 row-span-2" },
    { name: "El Resy AI", gridClass: "row-span-2" },
    { name: "Tweet", gridClass: "" },
    { name: "AI Red", gridClass: "" },
    { name: "YouTube (Twitter)", gridClass: "col-span-2" },
    { name: "BlueSky AI", gridClass: "col-span-2" },
    { name: "IO Reel", gridClass: "row-span-2" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="px-4 py-2 bg-muted rounded-lg text-2xl font-bold">
              {moduleId}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{moduleName}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                Star what you love and see what follows
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono">05:00</div>
            <div className="text-sm text-muted-foreground">0/15</div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground mb-6">
          Click to narrow down your interests
        </p>

        {/* Topic Grid - Masonry Layout */}
        <div className="grid grid-cols-4 auto-rows-[100px] gap-4 mb-8">
          {topics.map((topic, index) => (
            <Card
              key={index}
              className={`${topic.gridClass} p-4 cursor-pointer hover:bg-accent transition-colors flex items-center justify-center text-center`}
            >
              <span className="text-sm font-medium">{topic.name}</span>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-muted-foreground text-sm">M2A</div>
      </div>
    </div>
  );
};

export default Exercise;