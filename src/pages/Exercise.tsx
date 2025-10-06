import React, { useEffect, useRef, useState } from "react";
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
  code: string; // e.g. "1A"
}

type Slot = {
  slot: number;
  post: Post | null;
  fadeState: "idle" | "out" | "in";
};

const MAX_VISIBLE = 11;
const TRANSITION_MS = 300; // animation duration (ms)

export default function Exercise() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";

  // All fetched posts
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const allPostsRef = useRef<Post[]>([]);

  // Visible fixed slots (stable keys) so we can animate replacements per slot
  const [slots, setSlots] = useState<Slot[]>([]);
  const slotsRef = useRef<Slot[]>([]);

  // Track which post ids were already displayed (so we don't reuse them)
  const displayedIdsRef = useRef<Set<number>>(new Set());
  const [displayedIdsState, setDisplayedIdsState] = useState<Set<number>>(new Set());

  // Liked & Saved sets (persistent across replacements)
  const likedIdsRef = useRef<Set<number>>(new Set());
  const [likedIdsState, setLikedIdsState] = useState<Set<number>>(new Set());

  const savedIdsRef = useRef<Set<number>>(new Set());
  const [savedIdsState, setSavedIdsState] = useState<Set<number>>(new Set());

  // Completion
  const [isComplete, setIsComplete] = useState(false);

  // keep refs in sync with state
  useEffect(() => {
    allPostsRef.current = allPosts;
  }, [allPosts]);
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  // helper to sync displayed ids
  const markDisplayed = (id: number) => {
    displayedIdsRef.current.add(id);
    setDisplayedIdsState(new Set(displayedIdsRef.current));
  };

  const markLiked = (id: number) => {
    likedIdsRef.current.add(id);
    setLikedIdsState(new Set(likedIdsRef.current));
  };

  const toggleSaved = (id: number) => {
    const next = new Set(savedIdsRef.current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    savedIdsRef.current = next;
    setSavedIdsState(new Set(next));
  };

  // Fetch images from Supabase and initialize slots
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from("Thesis").list("Modules", {
        limit: 1000,
      });
      if (error) {
        console.error(error);
        return;
      }

      const postsData: Post[] = await Promise.all(
        data.map(async (file, index) => {
          const { data: urlData } = supabase.storage.from("Thesis").getPublicUrl(`Modules/${file.name}`);
          const code = file.name.split("_")[0] || file.name; // extract prefix code like 1A

          // try to read image dimensions; fall back to 300
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
          } as Post;
        }),
      );

      const shuffled = postsData.sort(() => Math.random() - 0.5);
      setAllPosts(shuffled);

      // initialize slots with up to MAX_VISIBLE posts
      const initialCount = Math.min(MAX_VISIBLE, shuffled.length);
      const initialSlots: Slot[] = [];
      for (let i = 0; i < initialCount; i++) {
        const p = shuffled[i];
        initialSlots.push({ slot: i, post: p, fadeState: "idle" });
        markDisplayed(p.id);
      }
      // if fewer than MAX_VISIBLE, fill remaining slots with nulls (keeps layout stable)
      for (let i = initialCount; i < MAX_VISIBLE; i++) {
        initialSlots.push({ slot: i, post: null, fadeState: "idle" });
      }

      setSlots(initialSlots);
    };

    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate counts from sets
  const likesCount = likedIdsState.size;
  const savesCount = savedIdsState.size;
  const polarizationScore = Math.round((likesCount / 15) * 100);

  // Completion logic (unchanged)
  useEffect(() => {
    if (likesCount >= 15 && savesCount >= 10) {
      setTimeout(() => setIsComplete(true), 500);
    }
  }, [likesCount, savesCount]);

  // Replace logic with animation
  const handleLikeOnSlot = (slotId: number) => {
    const current = slotsRef.current.find((s) => s.slot === slotId);
    if (!current || !current.post) return;
    const post = current.post;

    // If already liked (rare because we replace immediately), toggle unlike and keep showing
    if (likedIdsRef.current.has(post.id)) {
      const next = new Set(likedIdsRef.current);
      next.delete(post.id);
      likedIdsRef.current = next;
      setLikedIdsState(new Set(next));
      return;
    }

    // Start fade-out
    setSlots((prev) => prev.map((s) => (s.slot === slotId ? { ...s, fadeState: "out" } : s)));

    // After fade-out completes, pick replacement and fade-in
    setTimeout(() => {
      // mark liked (persist across replacements)
      markLiked(post.id);

      // find replacement in same code group that hasn't been displayed yet
      const replacement = allPostsRef.current.find(
        (p) => p.code === post.code && !displayedIdsRef.current.has(p.id) && p.id !== post.id,
      );

      const fallback = allPostsRef.current.find((p) => !displayedIdsRef.current.has(p.id) && p.id !== post.id);
      const chosen = replacement || fallback || null;

      if (chosen) {
        // mark displayed
        displayedIdsRef.current.add(chosen.id);
        setDisplayedIdsState(new Set(displayedIdsRef.current));

        // replace and mark as 'in' so we can animate from opacity 0 -> 100
        setSlots((prev) => prev.map((s) => (s.slot === slotId ? { ...s, post: chosen, fadeState: "in" } : s)));

        // small tick then set to idle to let CSS transition run
        setTimeout(() => {
          setSlots((prev) => prev.map((s) => (s.slot === slotId ? { ...s, fadeState: "idle" } : s)));
        }, 20);
      } else {
        // nothing to replace with: remove post from slot (keeps slot present but empty)
        setSlots((prev) => prev.map((s) => (s.slot === slotId ? { ...s, post: null, fadeState: "idle" } : s)));
      }
    }, TRANSITION_MS);
  };

  const handleSaveOnSlot = (slotId: number) => {
    const s = slotsRef.current.find((sl) => sl.slot === slotId);
    if (!s || !s.post) return;
    toggleSaved(s.post.id);
  };

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

        {/* Pinterest-style grid (stable slots used for animation) */}
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
          style={{ columnGap: "1rem" }}
        >
          {slots.map((s) => (
            <div
              key={s.slot}
              className="relative break-inside-avoid group overflow-hidden rounded-xl border border-border"
            >
              {s.post ? (
                <img
                  src={s.post.imageUrl}
                  alt={s.post.title}
                  // fade-out (out) -> opacity 0 + slight scale down
                  // fade-in (in)  -> start opacity 0 then JS moves to idle to animate to opacity 100
                  className={`w-full rounded-xl transition-all duration-300 ${
                    s.fadeState === "out"
                      ? "opacity-0 scale-95"
                      : s.fadeState === "in"
                        ? "opacity-0 scale-95"
                        : "opacity-100"
                  }`}
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-muted flex items-center justify-center">No image</div>
              )}

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => s.post && handleLikeOnSlot(s.slot)}
                  className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                  title={s.post ? (likedIdsState.has(s.post.id) ? "Unlike" : "Like") : ""}
                >
                  <Heart
                    className={`w-5 h-5 ${s.post && likedIdsState.has(s.post.id) ? "fill-red-500 text-red-500" : "text-foreground"}`}
                  />
                </button>

                <button
                  onClick={() => s.post && handleSaveOnSlot(s.slot)}
                  className="flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full px-6 py-1 hover:scale-105 transition-all"
                  title={s.post ? (savedIdsState.has(s.post.id) ? "Unsave" : "Save") : ""}
                >
                  <Bookmark
                    className={`w-5 h-5 ${s.post && savedIdsState.has(s.post.id) ? "fill-primary text-primary" : "text-foreground"}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
