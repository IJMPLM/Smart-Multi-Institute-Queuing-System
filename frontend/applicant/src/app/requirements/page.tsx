"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RequirementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requirements, setRequirements] = useState<string[]>([]);
  const [formName, setFormName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const form = searchParams.get("form") || "";
    setFormName(form);

    // Fetch requirements from the backend JSON file
    fetch("/api/requirements")
      .then((res) => res.json())
      .then((data) => {
        // Check if the form exists in the data
        if (form && data[form]) {
          setRequirements(data[form].requirements || []);
        } else if (data.requirements && Array.isArray(data.requirements)) {
          // Fallback to old format if exists
          setRequirements(data.requirements);
        } else {
          // Default fallback
          setRequirements([
            "High School Diploma",
            "Certificate of Good Moral Character",
            "Birth Certificate (PSA)",
            "2x2 ID Picture (2 copies)",
            "Medical Clearance",
            "Entrance Exam Result",
          ]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load requirements:", err);
        // Fallback to hardcoded values
        setRequirements([
          "High School Diploma",
          "Certificate of Good Moral Character",
          "Birth Certificate (PSA)",
          "2x2 ID Picture (2 copies)",
          "Medical Clearance",
          "Entrance Exam Result",
        ]);
        setIsLoading(false);
      });
  }, [searchParams]);

  const handleYes = () => {
    // Navigate to form filling page
    router.push("/form");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        {/* Form Name (if available) */}
        {formName && (
          <h2 className="text-xl font-semibold text-[#34495E] mb-4">
            {formName}
          </h2>
        )}

        {/* Question */}
        <h1 className="text-3xl font-bold text-black mb-20 text-center">
          Do you have all the requirements needed?
        </h1>

        {/* Larger Requirements Box */}
        <div className="w-full max-w-5xl bg-[#AEB6BF] rounded-2xl p-6 mb-20 h-64 overflow-y-auto shadow-inner flex flex-col items-center">
          <p className="font-semibold text-[#34495E] mb-3 text-lg">
            Requirements:
          </p>
          {isLoading ? (
            <p className="text-gray-600">Loading requirements...</p>
          ) : (
            <ul className="list-disc list-inside text-base text-[#1B2631] space-y-2 text-left w-full px-6">
              {requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-8">
          <button
            onClick={handleYes}
            className="bg-[#1B2631] text-white font-semibold px-10 py-3 rounded-full hover:bg-[#2C3E50] transition text-base"
          >
            YES
          </button>
          <button
            onClick={() => router.back()}
            className="bg-[#1B2631] text-white font-semibold px-10 py-3 rounded-full hover:bg-[#2C3E50] transition text-base"
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
