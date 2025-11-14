"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QueueChatUI from "@/components/Status";
// Desktop flow: StartScreen and ConsentScreen are defined here. MenuScreen lives inside ChatInterface.

function DataPrivacyModal({
  onProceed,
  onDecline,
}: {
  onProceed: () => void;
  onDecline: () => void;
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-lg flex flex-col
                    w-[90%] max-w-sm h-[60%]
                    sm:w-[80%] sm:max-w-md sm:h-[65%]
                    md:w-96 md:h-[500px]"
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-center text-[#34495E]">
            Data Privacy Consent
          </h3>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto text-xs sm:text-sm md:text-base text-[#34495E] flex-1">
          <p className="mb-2">
            We value your privacy. This consent explains how we collect,
            process, and protect your personal data.
          </p>
          <p className="mb-2">
            By proceeding, you acknowledge that you have read and understood our
            privacy practices, and you consent to the collection and processing
            of your data in accordance with applicable laws.
          </p>
          <p className="mb-2">
            Your data will only be used for the purpose of this system and will
            not be shared with third parties without your permission.
          </p>
          <p className="mb-2">
            If you do not agree, you may choose to cancel and discontinue using
            this service.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex flex-col gap-3">
          <label
            htmlFor="privacy-checkbox"
            className="flex items-center gap-2 text-sm text-[#34495E] cursor-pointer"
          >
            <input
              id="privacy-checkbox"
              name="privacy-consent"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
              aria-label="Agree to Data Privacy Policy"
              autoComplete="off"
            />
            <span>I agree to the Data Privacy Policy.</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={onDecline}
              className="px-4 py-2 rounded-lg border border-[#132437] text-[#132437] bg-transparent hover:bg-[#132437]/5"
            >
              I Decline
            </button>
            <button
              onClick={() => {
                if (isChecked) onProceed();
              }}
              disabled={!isChecked}
              className={`px-4 py-2 rounded-lg text-white ${
                isChecked
                  ? "bg-[#132437] hover:bg-[#0f1a29]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    // fallback for older browsers
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  // desktop screen flow state (start -> consent -> menu)
  const [desktopScreen, setDesktopScreen] = useState<
    "start" | "consent" | "menu"
  >("start");
  const [consented, setConsented] = useState(false);
  const [showChat] = useState(false);
  // showStatus controls visibility of the queue status panel.
  // It should only be shown after the user submits the form.
  const [showStatus] = useState(false);

  const handleProceed = () => {
    setConsented(true);
  };

  const handleDecline = () => {
    router.push("/feedback");
  };

  const handleShowFeedback = () => {
    router.push("/feedback");
  };

  // Handle navigation to chat when desktop reaches menu screen
  useEffect(() => {
    if (isDesktop && desktopScreen === "menu" && !showStatus) {
      router.push("/chat");
    }
  }, [isDesktop, desktopScreen, showStatus, router]);

  // If desktop viewport, show the desktop start/consent screens here.
  if (isDesktop) {
    if (desktopScreen === "start") {
      return (
        <div className="fixed inset-0 bg-[#243344] flex items-center justify-center p-8">
          <div
            className="bg-[#ffffff] border-[16px] border-[#3d5063] w-[95%] max-w-[1600px] aspect-[16/9] flex flex-col items-center justify-center cursor-pointer shadow-xl"
            onClick={() => setDesktopScreen("consent")}
          >
            <div className="mb-8">
              <Image
                src="/institute.png"
                alt="Institute Logo"
                width={280}
                height={280}
              />
            </div>
            <p className="text-5xl font-semibold text-gray-700 italic">
              Press anywhere to start
            </p>
          </div>
        </div>
      );
    }

    if (desktopScreen === "consent") {
      return (
        <div className="h-full bg-white flex flex-col">
          {/* Header provided by layout.tsx to avoid duplicate headers */}
          <main className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="bg-gray-400 rounded-lg p-12 w-full max-w-md relative shadow-lg">
              <div className="absolute top-0 right-0 w-2 h-full bg-gray-600 rounded-r-lg"></div>

              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Data Privacy <br /> Consent
              </h2>

              <div className="space-y-4 mb-16">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="h-px bg-gray-500 flex-1"></div>
                </div>
              </div>

              <button
                onClick={() => setDesktopScreen("menu")}
                className="bg-gray-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Accept
              </button>
            </div>
          </main>
        </div>
      );
    }

    // desktopScreen === 'menu' -> Navigate to chat page
    // Navigation handled by useEffect to avoid rendering during render
    if (showStatus) {
      return <QueueChatUI onShowFeedback={handleShowFeedback} />;
    }

    // Return loading state while navigation is in progress
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Data Privacy Modal (shown first) */}
      {!consented && (
        <DataPrivacyModal
          key="privacy-modal"
          onProceed={handleProceed}
          onDecline={handleDecline}
        />
      )}

      {/* Main Content */}
      {showChat ? (
        <div>
          {/* Status panel should be visible only after form submission */}
          {showStatus && <QueueChatUI />}
          <button
            onClick={() => router.push("/chat")}
            className="w-full p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Chat
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 px-6">
          <div className="h-20 w-20 rounded-full bg-[#34495E] mb-4" />
          <h2 className="text-xl font-bold text-black">Welcome!</h2>
          <p className="italic text-black mb-8">Let’s get started</p>

          <div className="w-full max-w-sm space-y-4">
            <div className="h-20 w-full rounded-lg bg-[#34495E]" />
            <div className="h-20 w-full rounded-lg bg-[#34495E]" />
          </div>
        </div>
      )}

      {/* Footer */}
      {consented && !showChat && (
        <footer className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-[#34495E] p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Where..."
              className="flex-1 rounded-2xl bg-gray-300 px-4 py-2 text-sm text-black placeholder:text-[#34495E] focus:outline-none"
            />
            <button className="rounded-full p-3">
              <Image src="/send.png" alt="Send" width={23} height={23} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex-1 rounded-full bg-gray-300 px-4 py-1.5 text-sm text-black hover:bg-gray-200"
              onClick={() => router.push("/chat")}
            >
              I would like to inquire.
            </button>
            <button
              type="button"
              className="flex-1 rounded-full bg-gray-300 px-4 py-1.5 text-sm text-black hover:bg-gray-200"
              onClick={() => router.push("/form")}
            >
              Fill Form
            </button>
          </div>
        </footer>
      )}
    </>
  );
}
