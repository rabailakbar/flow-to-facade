import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

interface Topic {
  id: number;
  category: string;
  title: string;
  voted: "interested" | "not-interested" | null;
}

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";
  const moduleName = searchParams.get("name") || "Pick & Flick";
  
  const [isComplete, setIsComplete] = useState(false);
  
  const [topics, setTopics] = useState<Topic[]>([
    { id: 1, category: "Entertainment", title: "Celebrity Influence & Drama", voted: null },
    { id: 2, category: "Pop Culture", title: "Trends & Culture", voted: null },
    { id: 3, category: "Health", title: "Health & Diseases", voted: null },
    { id: 4, category: "Education", title: "Science & Research", voted: null },
    { id: 5, category: "Politics", title: "Political News & Debates", voted: null },
    { id: 6, category: "Sports", title: "Esports & All Games", voted: null },
    { id: 7, category: "Technology", title: "AI & Innovations", voted: null },
    { id: 8, category: "Pop Culture", title: "Movie & Song Reviews", voted: null },
    { id: 9, category: "Lifestyle", title: "Fashion & Trends", voted: null },
  ]);

  const selectedCount = topics.filter(t => t.voted === "interested").length;

  const handleVote = (id: number, vote: "interested" | "not-interested") => {
    setTopics(prev => {
      const updated = prev.map(topic => 
        topic.id === id ? { ...topic, voted: vote } : topic
      );
      const newCount = updated.filter(t => t.voted === "interested").length;
      if (newCount >= 7) {
        setTimeout(() => setIsComplete(true), 500);
      }
      return updated;
    });
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <Card className="p-16 mb-8 bg-muted">
            <p className="text-2xl">Module Complete</p>
          </Card>
          <h1 className="text-5xl font-bold mb-8">Module 1: Complete</h1>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="px-8"
          >
            Next Module →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex items-start gap-6">
            <div className="text-6xl font-bold">
              {moduleId}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{moduleName}</h1>
              <p className="text-lg text-muted-foreground mb-2">
                Pick what you love and see what follows
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-lg">05:00</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{selectedCount}/7</div>
          </div>
        </div>

        {/* Instructions */}
        <h2 className="text-xl mb-8">Click to narrow down your interests</h2>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card key={topic.id} className="p-6">
              <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                {topic.category}
              </div>
              <h3 className="text-lg font-semibold mb-4">{topic.title}</h3>
              <div className="flex gap-3">
                <Button
                  variant={topic.voted === "interested" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleVote(topic.id, "interested")}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Interested
                </Button>
                <Button
                  variant={topic.voted === "not-interested" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleVote(topic.id, "not-interested")}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Interested
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
