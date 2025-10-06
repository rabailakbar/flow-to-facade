"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Heart, Bookmark } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: number;
  title: string;
  imageUrl: string;
  liked: boolean;
  saved: boolean;
  width: number;
  height: number;
}

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";

  const [posts, setPosts] = useState<Post[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Fetch from Supabase
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("Thesis").list("Modules", {
        limit: 100,
      });
      if (error) {
        console.error(error);
        return;
      }

      const postsData = await Promise.all(
        data.map(async (file, index) => {
          const { data: urlData } = supabase.storage.from("Thesis").getPublicUrl(`Modules/${file.name}`);

          // Load the image to get its dimensions
          return new Promise<Post>((resolve) => {
            const img = new Image();
            img.src = urlData.publicUrl;
            img.onload = () => {
              resolve({
                id: index + 1,
                title: file.name,
                imageUrl: urlData.publicUrl,
                liked: false,
                saved: false,
                width: img.width,
                height: img.height,
              });
            };
            img.onerror = () =>
              resolve({
                id: index + 1,
                title: file.name,
                imageUrl: urlData.publicUrl,
                liked: false,
                saved: false,
                width: 300,
                height: 300,
              });
          });
        }),
      );

      setPosts(postsData.sort(() => Math.random() - 0.5));
    };

    fetchImages();
  }, []);

  const handlePostAction = (id: number, action: "like" | "save") => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: action === "like" ? !p.liked : p.liked,
              saved: action === "save" ? !p.saved : p.saved,
            }
          : p,
      ),
    );
  };

  const likesCount = posts.filter((p) => p.liked).length;
  const savesCount = posts.filter((p) => p.saved).length;
  const polarizationScore = Math.round((likesCount / 15) * 100);

  // Completion check
  useEffect(() => {
    if (likesCount >= 15 && savesCount >= 10) {
      setTimeout(() => setIsComplete(true), 500);
    }
  }, [likesCount, savesCount]);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <Card className="p-16 mb-8 bg-muted">
            <p className="text-2xl">Module Complete</p>
          </Card>
          <h1 className="text-5xl font-bold mb-8">{moduleId}: Complete</h1>
          <Button size="lg" onClick={() => navigate(`/module?id=M3&name=Next Module&phase=Phase iii`)} className="px-8">
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
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl font-bold">{moduleId}</div>
            <div>
              <h1 className="text-5xl font-bold mb-2">myworld</h1>
              <p className="text-2xl text-muted-foreground mb-3">We see you!</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-lg">05:00</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Progress value={polarizationScore} className="w-64 h-3 mb-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Polarization Score</span>
              <span className="text-2xl font-bold">{polarizationScore}%</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-end gap-3 mb-6 text-base">
          <span>{likesCount}/15 Likes</span>
          <span>{savesCount}/10 Saves</span>
          <span className="text-muted-foreground">Left only</span>
        </div>

        <h2 className="text-xl mb-8">Click to like & save</h2>

        {/* Pinterest-style grid */}
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
          style={{ columnGap: "1rem" }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative break-inside-avoid group overflow-hidden rounded-xl border border-border"
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full rounded-xl transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => handlePostAction(post.id, "like")}
                  className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                >
                  <Heart className={`w-5 h-5 ${post.liked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                </button>
                <button
                  onClick={() => handlePostAction(post.id, "save")}
                  className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                >
                  <Bookmark className={`w-5 h-5 ${post.saved ? "fill-primary text-primary" : "text-foreground"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
