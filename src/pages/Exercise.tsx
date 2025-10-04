import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";

const Exercise = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get("id") || "M1";
  const moduleName = searchParams.get("name") || "Pick & Flick";
  const BUCKET_NAME = "Thesis";
  const FOLDER_NAME = "Modules";

  const [selectedCount, setSelectedCount] = useState(15);
  const [currentStep, setCurrentStep] = useState<
    "exercise" | "result1" | "result2" | "result3" | "complete"
  >("exercise");

  const allTopics = [
    "Instagram poll", "YT Reelss", "IO Text", "Tweet", "IT Reel",
    "Youtube Thumbnail", "El Resy AI", "Tweet", "AI Red", "YouTube (Twitter)",
    "BlueSky AI", "IO Reel", "Facebook Post", "LinkedIn Article", "TikTok Video",
    "Reddit Thread", "Pinterest Pin", "Snapchat Story", "Discord Message", "Slack Update",
    "Medium Article", "Substack Post", "Newsletter", "Blog Post", "Podcast Episode",
    "Spotify Playlist", "Apple Music", "SoundCloud Track", "Twitch Stream", "YouTube Live"
  ];

  const gridClasses = [
    "row-span-2", "col-span-2", "", "", "row-span-3",
    "col-span-2 row-span-2", "row-span-2", "", "", "col-span-2",
    "col-span-2", "row-span-2"
  ];

  const [topics, setTopics] = useState(
    allTopics.slice(0, 12).map((name, idx) => ({
      id: idx,
      name,
      gridClass: gridClasses[idx % gridClasses.length],
    }))
  );

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(FOLDER_NAME, { limit: 100 });

    if (error) {
      console.error("Error listing images:", error.message);
      return;
    }

    const imageFiles = data.filter(
      (file) =>
        !file.name.endsWith("/") &&
        !file.name.includes(".emptyFolderPlaceholder")
    );

    const urls = imageFiles.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${FOLDER_NAME}/${file.name}`);
      return publicUrlData.publicUrl;
    });

    setImageUrls(urls);
  };

  const [nextTopicIndex, setNextTopicIndex] = useState(12);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleCardClick = (id: number, name: string) => {
    setSelectedTopics((prev) => [...prev, name]);
    setTopics((prev) => prev.filter((t) => t.id !== id));

    setSelectedCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount >= 15) {
        setTimeout(() => setCurrentStep("result1"), 1000);
      } else if (nextTopicIndex < allTopics.length) {
        setTimeout(() => {
          setTopics((prev) => [
            ...prev,
            {
              id: nextTopicIndex,
              name: allTopics[nextTopicIndex],
              gridClass:
                gridClasses[Math.floor(Math.random() * gridClasses.length)],
            },
          ]);
          setNextTopicIndex((prev) => prev + 1);
        }, 300);
      }
      return newCount;
    });
  };

  useEffect(() => {
    if (currentStep === "result1") {
      setTimeout(() => setCurrentStep("result2"), 3000);
    } else if (currentStep === "result2") {
      setTimeout(() => setCurrentStep("result3"), 3000);
    } else if (currentStep === "result3") {
      setTimeout(() => setCurrentStep("complete"), 3000);
    } else if (currentStep === "complete") {
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  }, [currentStep, navigate]);

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Module 1 Complete!</h1>
          <p className="text-muted-foreground">Great job!</p>
        </div>
      </div>
    );
  }

  if (
    currentStep === "result1" ||
    currentStep === "result2" ||
    currentStep === "result3"
  ) {
    const isResult1 = currentStep === "result1";
    const isResult3 = currentStep === "result3";

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <p className="text-lg text-muted-foreground mb-6">
              Based on your topics of interest, your opinion feed looks like...
            </p>

            {isResult1 ? (
              <div className="max-w-sm">
                <Card className="p-6">
                  <div className="aspect-square bg-muted rounded-md mb-4" />
                  <h3 className="font-semibold mb-2">{selectedTopics[0]}</h3>
                  <p className="text-sm text-muted-foreground">
                    Curated content based on your interests
                  </p>
                </Card>
              </div>
            ) : (
              <div
                className={`grid grid-cols-4 auto-rows-[100px] gap-4 ${
                  isResult3 ? "opacity-40" : ""
                }`}
              >
                {selectedTopics.slice(0, 12).map((topic, index) => (
                  <Card
                    key={index}
                    className={`${gridClasses[index % gridClasses.length]} p-4 flex items-center justify-center text-center`}
                  >
                    <span className="text-sm font-medium">{topic}</span>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="text-muted-foreground text-sm">
            {isResult1 ? "M2B" : isResult3 ? "M2E" : "M2D"}
          </div>
        </div>
      </div>
    );
  }

  // 🧩 MAIN EXERCISE VIEW (Pinterest layout applied here)
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
            <div className="text-sm text-muted-foreground">
              {selectedCount}/15
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground mb-6">
          Click to narrow down your interests
        </p>

        {/* 🧱 Pinterest-style Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mb-8">
          {topics.map((topic) => {
            const imageUrl = imageUrls[topic.id % imageUrls.length] || null;
            return (
              <div
                key={topic.id}
                className="relative mb-4 break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] animate-scale-in"
                onClick={() => handleCardClick(topic.id, topic.name)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={topic.name}
                    className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-40 bg-muted">
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm font-medium p-2">
                  {topic.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-muted-foreground text-sm">M2A</div>
      </div>
    </div>
  );
};

export default Exercise;
