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
  width: number;
  height: number;
  code: string;
  codeNumber: string;
}

const MAX_VISIBLE = 11;
const MAX_LIKES = 6;
const MAX_SAVES = 3;
const TRANSITION_MS = 350;

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const [replacingIds, setReplacingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("Thesis").list("Modules", {
        limit: 100,
      });
      if (error) {
        console.error(error);
        return;
      }

      const postsData: Post[] = await Promise.all(
        data.map(async (file, index) => {
          const { data: urlData } = supabase.storage.from("Thesis").getPublicUrl(`Modules/${file.name}`);
          const match = file.name.match(/_(\d+[a-zA-Z])\.[^.]+$/i);
          const code = match ? match[1].toLowerCase() : "";
          const codeNumber = code.replace(/[^\d]/g, "");

          const dim = await new Promise<{ w: number; h: number }>((resolve) => {
            const img = new Image();
            img.src = urlData.publicUrl;
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.onerror = () => resolve({ w: 300, h: 300 });
          });

          return {
            id: index + 1,
            title: file.name,
            imageUrl: urlData.publicUrl,
            width: dim.w,
            height: dim.h,
            code,
            codeNumber,
          } as Post;
        }),
      );

      const shuffled = postsData.sort(() => Math.random() - 0.5);
      setAllPosts(shuffled);
      setVisiblePosts(shuffled.slice(0, MAX_VISIBLE));
    };

    fetchImages();
  }, []);

  const pickRandom = (arr: Post[]) => arr[Math.floor(Math.random() * arr.length)];

  const findReplacementFor = (current: Post) => {
    if (!current) return null;

    const sameNumberCandidates = allPosts.filter(
      (p) =>
        p.codeNumber === current.codeNumber &&
        p.id !== current.id &&
        !visiblePosts.some((v) => v.id === p.id) &&
        !likedIds.has(p.id) &&
        !savedIds.has(p.id),
    );

    if (sameNumberCandidates.length > 0) return pickRandom(sameNumberCandidates);

    const unseenOverall = allPosts.filter(
      (p) =>
        p.id !== current.id && !visiblePosts.some((v) => v.id === p.id) && !likedIds.has(p.id) && !savedIds.has(p.id),
    );

    if (unseenOverall.length > 0) return pickRandom(unseenOverall);

    return null;
  };

  const handlePostAction = (id: number, action: "like" | "save") => {
    const current = visiblePosts.find((p) => p.id === id);
    if (!current) return;

    const isLike = action === "like";
    const isSet = isLike ? likedIds.has(id) : savedIds.has(id);
    const setState = isLike ? setLikedIds : setSavedIds;
    const currentSet = isLike ? likedIds : savedIds;
    const limit = isLike ? MAX_LIKES : MAX_SAVES;

    if (isSet) {
      setState((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    if (currentSet.size >= limit) return;

    setState((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const replacement = findReplacementFor(current);
    if (replacement) {
      setReplacingIds((prev) => new Set(prev).add(id));

      setTimeout(() => {
        setVisiblePosts((prev) => prev.map((p) => (p.id === id ? replacement : p)));

        setTimeout(() => {
          setReplacingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, TRANSITION_MS);
      }, TRANSITION_MS);
    }
  };

  const likesCount = likedIds.size;
  const savesCount = savedIds.size;
  const polarizationScore = Math.max(0, Math.min(100, Math.round((likesCount / MAX_LIKES) * 100)));

  useEffect(() => {
    if (likesCount >= MAX_LIKES && savesCount >= MAX_SAVES) {
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
    <div className="min-h-screen bg-background p-8 transition-all duration-500">
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
          <span>
            {likesCount}/{MAX_LIKES} Likes
          </span>
          <span>
            {savesCount}/{MAX_SAVES} Saves
          </span>
          <span className="text-muted-foreground">Left only</span>
        </div>

        <h2 className="text-xl mb-8">Click to like & save</h2>

        {/* Pinterest-style grid */}
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
          style={{ columnGap: "1rem" }}
        >
          {visiblePosts.map((post) => {
            const isReplacing = replacingIds.has(post.id);

            return (
              <div
                key={post.id}
                className={`relative break-inside-avoid group overflow-hidden rounded-xl border border-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}
              >
                <div
                  className={`relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isReplacing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full rounded-xl object-cover transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  />

                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <button
                      onClick={() => handlePostAction(post.id, "like")}
                      className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                      title={likedIds.has(post.id) ? "Unlike" : "Like"}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedIds.has(post.id) ? "fill-red-500 text-red-500" : "text-foreground"}`}
                      />
                    </button>

                    <button
                      onClick={() => handlePostAction(post.id, "save")}
                      className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                      title={savedIds.has(post.id) ? "Unsave" : "Save"}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${savedIds.has(post.id) ? "fill-primary text-primary" : "text-foreground"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
