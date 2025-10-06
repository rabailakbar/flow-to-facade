import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Bookmark } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export default function Exercise() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";
  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const MAX_VISIBLE = 11;
  const MAX_LIKES = 6;
  const MAX_SAVES = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("posts").select("*");
      if (error) {
        console.error(error);
        return;
      }
      setPosts(data || []);
      setVisiblePosts((data || []).slice(0, MAX_VISIBLE));
    };

    fetchPosts();
  }, []);

  const extractCode = (filename: string) => {
    const match = filename.match(/_(\d+[a-zA-Z])\.png$/);
    return match ? match[1] : null;
  };

  const getPrefix = (code: string) => code.replace(/[^\d]/g, "");

  const findReplacement = (currentPost: Post) => {
    const currentCode = extractCode(currentPost.image_url);
    if (!currentCode) return null;
    const prefix = getPrefix(currentCode);

    const unseen = posts.filter((p) => {
      const code = extractCode(p.image_url);
      if (!code) return false;
      const samePrefix = code.startsWith(prefix);
      const notUsed = !visiblePosts.some((v) => v.id === p.id) && !liked.has(p.id) && !saved.has(p.id);
      return samePrefix && notUsed;
    });

    if (unseen.length === 0) return null;
    return unseen[Math.floor(Math.random() * unseen.length)];
  };

  const replacePost = (id: number) => {
    const index = visiblePosts.findIndex((p) => p.id === id);
    if (index === -1) return;

    const replacement = findReplacement(visiblePosts[index]);
    if (!replacement) return;

    const updated = [...visiblePosts];
    updated[index] = replacement;

    // Tailwind animation trigger
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.classList.add("opacity-0", "scale-95", "transition", "duration-500");
      setTimeout(() => {
        setVisiblePosts(updated);
      }, 400);
    } else {
      setVisiblePosts(updated);
    }
  };

  const handleLike = (id: number) => {
    if (liked.has(id)) return;
    if (liked.size >= MAX_LIKES) return;
    setLiked((prev) => new Set(prev).add(id));
    replacePost(id);
  };

  const handleSave = (id: number) => {
    if (saved.has(id)) return;
    if (saved.size >= MAX_SAVES) return;
    setSaved((prev) => new Set(prev).add(id));
    replacePost(id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {visiblePosts.map((post) => (
        <Card
          key={post.id}
          id={`card-${post.id}`}
          className="relative group transition-all duration-500 transform hover:scale-105 hover:shadow-lg overflow-hidden"
        >
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-64 object-cover transition-opacity duration-500"
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleLike(post.id)}
              className="bg-white/70 hover:bg-white rounded-full"
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-300 ${liked.has(post.id) ? "text-red-500 fill-red-500" : "text-gray-700"}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSave(post.id)}
              className="bg-white/70 hover:bg-white rounded-full"
            >
              <Bookmark
                className={`w-5 h-5 transition-colors duration-300 ${saved.has(post.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`}
              />
            </Button>
          </div>
          <div className="p-2">
            <h3 className="font-semibold text-sm line-clamp-1">{post.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{post.description}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
