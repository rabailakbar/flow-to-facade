import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Heart, Bookmark } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const MAX_DISPLAY = 11;

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";

  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
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

      const shuffled = postsData.sort(() => Math.random() - 0.5);
      setPosts(shuffled);
      setVisiblePosts(shuffled.slice(0, MAX_DISPLAY));
    };

    fetchImages();
  }, []);

  const getReplacementPost = (oldPost: Post) => {
    const remaining = posts.filter(
      (p) => !likedIds.has(p.id) && !savedIds.has(p.id) && !visiblePosts.some((vp) => vp.id === p.id),
    );

    // Try to find a file with similar code pattern
    const codePrefix = oldPost.title.split(/[_-]/)[0];
    const similar = remaining.find((p) => p.title.includes(codePrefix));
    return similar || remaining[0] || null;
  };

  const handlePostAction = (id: number, action: "like" | "save") => {
    setVisiblePosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const updatedPost = { ...p };
          if (action === "like") updatedPost.liked = !p.liked;
          if (action === "save") updatedPost.saved = !p.saved;
          return updatedPost;
        }
        return p;
      });
      return updated;
    });

    setTimeout(() => {
      setLikedIds((prev) => {
        const newSet = new Set(prev);
        if (action === "like") newSet.add(id);
        return newSet;
      });

      setSavedIds((prev) => {
        const newSet = new Set(prev);
        if (action === "save") newSet.add(id);
        return newSet;
      });

      const oldPost = visiblePosts.find((p) => p.id === id);
      if (!oldPost) return;

      const replacement = getReplacementPost(oldPost);
      if (!replacement) return;

      setVisiblePosts((prev) => prev.map((p) => (p.id === id ? replacement : p)));
    }, 300);
  };

  const likesCount = likedIds.size;
  const savesCount = savedIds.size;
  const polarizationScore = Math.round((likesCount / 15) * 100);

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

        <div className="flex justify-end gap-3 mb-6 text-base">
          <span>{likesCount}/15 Likes</span>
          <span>{savesCount}/10 Saves</span>
          <span className="text-muted-foreground">Left only</span>
        </div>

        <h2 className="text-xl mb-8">Click to like & save</h2>

        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
          style={{ columnGap: "1rem" }}
        >
          <AnimatePresence>
            {visiblePosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
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
                    <Heart
                      className={`w-5 h-5 ${likedIds.has(post.id) ? "fill-red-500 text-red-500" : "text-foreground"}`}
                    />
                  </button>
                  <button
                    onClick={() => handlePostAction(post.id, "save")}
                    className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${savedIds.has(post.id) ? "fill-yellow-400 text-yellow-400" : "text-foreground"}`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Exercise;
