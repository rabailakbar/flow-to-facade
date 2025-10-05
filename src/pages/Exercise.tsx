import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ThumbsUp, ThumbsDown, Heart, Bookmark, MessageCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Topic {
  id: number;
  category: string;
  title: string;
  voted: "interested" | "not-interested" | null;
}

interface Post {
  id: number;
  title: string;
  source: string;
  views: string;
  timeAgo: string;
  liked: boolean;
  saved: boolean;
  commented: boolean;
  height: "short" | "medium" | "tall";
  imageUrl?: string;
}

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";
  const moduleName = searchParams.get("name") || "Pick & Flick";
  
  const [isComplete, setIsComplete] = useState(false);
  
  // Fetch images from Supabase storage
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from('Thesis')
        .list('Modules', {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Error fetching images:', error);
        return;
      }

      if (data && data.length > 0) {
        const imageUrls = data.map(file => {
          const { data: urlData } = supabase.storage
            .from('Thesis')
            .getPublicUrl(`Modules/${file.name}`);
          return urlData.publicUrl;
        });

        // Update posts with actual image URLs
        setPosts(prev => prev.map((post, index) => ({
          ...post,
          imageUrl: imageUrls[index % imageUrls.length] // Cycle through available images
        })));
      }
    };

    if (moduleId === "M2") {
      fetchImages();
    }
  }, [moduleId]);
  
  // Module 1 state
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

  // Module 2 state
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, title: "Blake Lively, Justin Baldoni and the collapse of Hollywood #MeToo Era", source: "dawn_images", views: "1.2K", timeAgo: "9 hours ago", liked: false, saved: false, commented: false, height: "medium" },
    { id: 2, title: "How many times can they be 'lucky guesses' before it's just the truth hiding in plain sight? #SimpsonsConspiracy", source: "EntertainMentWeekLY133", views: "1.5K", timeAgo: "1 day ago", liked: false, saved: false, commented: false, height: "tall" },
    { id: 3, title: "Bill Gates Knew It All Along? The Pandemic Prediction That Made Him Millions", source: "healthsafety67", views: "90.1M", timeAgo: "356 weeks ago", liked: false, saved: false, commented: false, height: "short" },
    { id: 4, title: "HERE'S A BREAKDOWN OF ALL PREDICTIONS MADE BY THE SIMPSONS FOR 2025", source: "Shobby Entertainment", views: "1.9M", timeAgo: "157K", liked: false, saved: false, commented: false, height: "medium" },
    { id: 5, title: "AI Just Stole Studio Ghibli's Soul?! Artists Furious Over ChatGPT Ghibli Trend", source: "Eazy Explained", views: "1M", timeAgo: "14 weeks ago", liked: false, saved: false, commented: false, height: "tall" },
    { id: 6, title: "Ryan Gosling speaks out after Oscars snub leaves Barbie f*cking furious", source: "dawn_images", views: "2.5K", timeAgo: "2 days ago", liked: false, saved: false, commented: false, height: "short" },
    { id: 7, title: "The black hole 'Gargantua' was so scientifically accurate, it took astrophysicists 100 hours for a single render. NASA Scientists even published research.", source: "abcnews", views: "856K", timeAgo: "5 days ago", liked: false, saved: false, commented: false, height: "tall" },
    { id: 8, title: "BOMBSHELL: Mortician EXPOSES Charlie Kirk's Autopsy - The Key Evidence EVERYONE Missed!", source: "Beyond", views: "357K", timeAgo: "5 days ago", liked: false, saved: false, commented: false, height: "medium" },
    { id: 9, title: "The AI Safety Expert: These are the only 5 Jobs that will remain in 2030! - Dr. Roman Yampolskiy", source: "The Diary of a CEO", views: "2.3M", timeAgo: "2 weeks ago", liked: false, saved: false, commented: false, height: "short" },
    { id: 10, title: "25 Best Ghibli Studio Images that are taking over the internet right now!", source: "ArtLeaks Online", views: "450K", timeAgo: "1 week ago", liked: false, saved: false, commented: false, height: "medium" },
  ]);

  const selectedCount = topics.filter(t => t.voted === "interested").length;
  const likesCount = posts.filter(p => p.liked).length;
  const savesCount = posts.filter(p => p.saved).length;
  const commentsCount = posts.filter(p => p.commented).length;
  const polarizationScore = Math.round((likesCount / 15) * 100);

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

  const handlePostAction = (id: number, action: "like" | "save" | "comment") => {
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === id) {
          if (action === "like") return { ...post, liked: !post.liked };
          if (action === "save") return { ...post, saved: !post.saved };
          if (action === "comment") return { ...post, commented: true };
        }
        return post;
      });
      
      const newLikes = updated.filter(p => p.liked).length;
      const newSaves = updated.filter(p => p.saved).length;
      
      if (newLikes >= 15 && newSaves >= 10) {
        setTimeout(() => setIsComplete(true), 500);
      }
      
      return updated;
    });
  };

  if (isComplete) {
    const nextModule = moduleId === "M1" ? "M2" : "M3";
    const nextModuleName = moduleId === "M1" ? "Let's blow bubbles" : "Next Module";
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <Card className="p-16 mb-8 bg-muted">
            <p className="text-2xl">Module Complete</p>
          </Card>
          <h1 className="text-5xl font-bold mb-8">{moduleId}: Complete</h1>
          <Button 
            size="lg"
            onClick={() => navigate(`/module?id=${nextModule}&name=${nextModuleName}&phase=Phase ii`)}
            className="px-8"
          >
            Next Module →
          </Button>
        </div>
      </div>
    );
  }

  // Module 2: Social Media Feed
  if (moduleId === "M2") {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-6">
              <div className="text-6xl font-bold">
                {moduleId}
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">myworld</h1>
                <p className="text-2xl text-muted-foreground mb-3">
                  We see you!
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">05:00</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <Progress value={polarizationScore} className="w-64 h-3 mb-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Polarization Score</span>
                  <span className="text-2xl font-bold">{polarizationScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-end gap-3 mb-6 text-base">
            <span>{likesCount}/15 Likes</span>
            <span>{savesCount}/10 Saves</span>
            <span className="text-muted-foreground">Left only</span>
          </div>

          {/* Instructions */}
          <h2 className="text-xl mb-8">Click to like, save & comment</h2>

          {/* Posts Masonry Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {posts.map((post) => {
              const heightClass = 
                post.height === "short" ? "h-32" :
                post.height === "medium" ? "h-64" :
                "h-96";
              
              return (
                <Card key={post.id} className="mb-4 break-inside-avoid overflow-hidden">
                  <div className={`${heightClass} bg-muted relative overflow-hidden`}>
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">{post.source}</p>
                    <h3 className="text-sm font-semibold mb-3 line-clamp-3">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {post.views} views • {post.timeAgo}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={post.liked ? "default" : "outline"}
                        onClick={() => handlePostAction(post.id, "like")}
                        className="flex-1"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={post.saved ? "default" : "outline"}
                        onClick={() => handlePostAction(post.id, "save")}
                        className="flex-1"
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={post.commented ? "default" : "outline"}
                        onClick={() => handlePostAction(post.id, "comment")}
                        className="flex-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Module 1: Topic Voting
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
