"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const ratings = ["Very Poor", "Fair", "Good", "Excellent"];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        router.back();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktop, router]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedRating && !feedback.trim()) {
      alert("Please select a rating or provide feedback.");
      return;
    }
    alert(
      `Feedback submitted:\nRating: ${
        selectedRating || "N/A"
      }\nComment: ${feedback}`
    );
  };

  // Desktop: Show full-page feedback form with click-outside to exit
  if (isDesktop) {
    return (
      <div className="h-full flex flex-col bg-white relative">
        {/* Content area with form - scrollable */}
        <div className="flex-1 flex flex-col items-center justify-start pt-12 pb-20 overflow-auto min-h-0">
          {/* Feedback Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-[#AEB8B8] rounded-2xl shadow-lg w-full max-w-4xl px-12 py-10 flex flex-col gap-6 mb-12"
          >
            <h2 className="text-3xl font-bold text-[#1F3243] mb-2">
              Feedback Form
            </h2>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-[#1F3243]">
                How was your experience?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {ratings.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSelectedRating(rating)}
                    className={`px-6 py-4 rounded-2xl text-base font-medium transition ${
                      selectedRating === rating
                        ? "bg-[#1F3243] text-white"
                        : "bg-[#D9D9D9] text-[#1F3243] hover:bg-[#c5c5c5]"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xl text-[#1F3243]">Comments</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-2xl p-4 text-base text-[#1F3243] bg-[#D9D9D9] resize-none focus:outline-none focus:ring-2 focus:ring-[#1F3243]"
                rows={6}
                placeholder="Additional comments..."
              />
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="px-20 py-3 rounded-full text-lg font-semibold bg-[#1F3243] text-white hover:bg-[#132437] transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Mobile: Show compact feedback card
  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Feedback Card */}
      <div className="bg-[#B7C3C7] rounded-lg shadow-md w-[90%] max-w-sm mt-10 p-5 flex flex-col gap-4">
        {/* Title */}
        <h2 className="text-lg font-bold text-[#34495E]">Feedback Survey</h2>

        {/* Experience Question */}
        <div>
          <p className="text-sm text-[#34495E] mb-2">
            How was your experience?
          </p>
          <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  selectedRating === rating
                    ? "bg-[#34495E] text-white"
                    : "bg-white text-[#34495E]"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <p className="text-sm text-[#34495E] mb-1">Comments</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder=""
            className="w-full rounded-md p-2 text-sm text-[#34495E] bg-white"
            rows={2}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-2">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full border border-[#34495E] text-[#34495E] bg-white"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full bg-[#132437] text-white hover:bg-[#0f1a29]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
