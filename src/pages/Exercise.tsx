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
  imageUrl?: string;
  width: number;
  displayHeight: number;
  type: "YTH" | "IG" | "YTT" | "IGR" | "TTR";
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
        // Get public URLs for all images
        const imagePromises = data.map(async (file, index) => {
          const { data: urlData } = supabase.storage
            .from('Thesis')
            .getPublicUrl(`Modules/${file.name}`);
          
          // Load image to get actual dimensions
          return new Promise<Post>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const fileName = file.name.toLowerCase();
              let type: "YTH" | "IG" | "YTT" | "IGR" | "TTR" = "IG";
              
              // Determine type based on filename
              if (fileName.includes('yth') || fileName.includes('yt headline')) {
                type = "YTH";
              } else if (fileName.includes('youtube thumbnail') || fileName.includes('ytt')) {
                type = "YTT";
              } else if (fileName.includes('igr')) {
                type = "IGR";
              } else if (fileName.includes('tt_') || fileName.includes('ttr')) {
                type = "TTR";
              } else if (fileName.includes('ig')) {
                type = "IG";
              }
              
              resolve({
                id: index + 1,
                title: file.name,
                source: "",
                views: "",
                timeAgo: "",
                liked: false,
                saved: false,
                commented: false,
                imageUrl: urlData.publicUrl,
                width: img.naturalWidth,
                displayHeight: img.naturalHeight,
                type
              });
            };
            img.onerror = () => {
              resolve({
                id: index + 1,
                title: file.name,
                source: "",
                views: "",
                timeAgo: "",
                liked: false,
                saved: false,
                commented: false,
                imageUrl: urlData.publicUrl,
                width: 226,
                displayHeight: 360,
                type: "IG"
              });
            };
            img.src = urlData.publicUrl;
          });
        });
        
        // Wait for all images to load and get their dimensions
        Promise.all(imagePromises).then(loadedPosts => {
          // Shuffle the posts for Pinterest-style mixed layout
          const shuffled = loadedPosts.sort(() => Math.random() - 0.5);
          setPosts(shuffled);
        });
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

  // Module 2 state - Static grid items
  const gridItems = [
    { id: 1, fileName: "IG Post_1c.png", width: 226, height: 361 },
    { id: 2, fileName: "IGR_3c.png", width: 224, height: 402 },
    { id: 3, fileName: "YT Headline_ 8b.png", width: 493, height: 130 },
    { id: 4, fileName: "YouTube Thumbnail_ 4a.png", width: 496, height: 248 },
    { id: 5, fileName: "IG_9b.png", width: 226, height: 356 },
    { id: 6, fileName: "IG_10a.png", width: 251, height: 399 },
    { id: 7, fileName: "YTT_6b.png", width: 494, height: 247 },
    { id: 8, fileName: "YTT_7a.png", width: 494, height: 247 },
    { id: 9, fileName: "YTH_R.png", width: 494, height: 130 },
    { id: 10, fileName: "IGR_8e.png", width: 228, height: 409 },
    { id: 11, fileName: "IG_4c.png", width: 227, height: 363 },
  ];

  const [posts, setPosts] = useState<Post[]>([]);

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

          {/* Custom Grid Layout */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '19px',
              gridAutoRows: 'min-content'
            }}
          >
            {/* Shape 1 */}
            <div style={{ width: '226px', height: '361px', gridColumn: '1', gridRow: '1', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[0].fileName}`}
                alt="Shape 1"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 2 */}
            <div style={{ width: '224px', height: '402px', gridColumn: '1', gridRow: '2 / 4', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[1].fileName}`}
                alt="Shape 2"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 3 */}
            <div style={{ width: '493px', height: '130px', gridColumn: '2 ', gridRow: '1',marginBottom:'10px', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[2].fileName}`}
                alt="Shape 3"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 4 */}
            <div style={{ width: '496px', height: '248px', gridColumn: '2 ', gridRow: '2', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[3].fileName}`}
                alt="Shape 4"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 5 */}
            <div style={{ width: '226px', height: '356px', gridColumn: '2', gridRow: '3', borderRadius: '10px',marginTop: '-240px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[4].fileName}`}
                alt="Shape 5"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 6 */}
            <div style={{ width: '251px', height: '399px', gridColumn: '2', gridRow: '3', marginLeft: '254px',marginTop: '-240px', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[5].fileName}`}
                alt="Shape 6"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 7 */}
            <div style={{ width: '494px', height: '247px', gridColumn: '3', gridRow: '1', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[6].fileName}`}
                alt="Shape 7"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 8 */}
            <div style={{ width: '494px', height: '247px', gridColumn: '3', gridRow: '2', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[7].fileName}`}
                alt="Shape 8"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 9 */}
            <div style={{ width: '494px', height: '130px', gridColumn: '3', gridRow: '3', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[8].fileName}`}
                alt="Shape 9"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 10 */}
            <div style={{ width: '228px', height: '409px', gridColumn: '4', gridRow: '1 / 3', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[9].fileName}`}
                alt="Shape 10"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Shape 11 */}
            <div style={{ width: '227px', height: '363px', gridColumn: '4', gridRow: '3', borderRadius: '10px', border: '0.5px solid #D9D9D9', overflow: 'hidden' }}>
              <img 
                src={`https://wlneuhivxmpiasjmmryi.supabase.co/storage/v1/object/public/Thesis/Modules/${gridItems[10].fileName}`}
                alt="Shape 11"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
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
