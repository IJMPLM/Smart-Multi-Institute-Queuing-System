"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NeedHelp } from "../../components/NeedHelp";
import HelpChatbot from "../../components/HelpChatbot";

// JSON types used for form definition and values
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [k: string]: JsonValue;
}

// helper: create an empty clone of the JSON structure (keeps keys, clears values)
function deepCloneAndEmpty(obj: JsonValue): JsonValue {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [];
    const first = obj[0];
    if (typeof first === "object" && first !== null) {
      return [deepCloneAndEmpty(first)];
    }
    return [];
  }
  if (obj === null) return "";
  if (typeof obj === "object") {
    const out: JsonObject = {};
    for (const k of Object.keys(obj as JsonObject)) {
      out[k] = deepCloneAndEmpty((obj as JsonObject)[k]);
    }
    return out;
  }
  if (typeof obj === "boolean") return false;
  return "";
}

function isObjectEmptyValues(obj: JsonValue): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === "string") return obj.trim() === "";
  if (typeof obj === "boolean") return false;
  if (Array.isArray(obj))
    return obj.length === 0 || obj.every(isObjectEmptyValues);
  if (typeof obj === "object") {
    return Object.values(obj as JsonObject).every(isObjectEmptyValues);
  }
  return false;
}

export default function FormFillingPage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  // 🧠 Manage chatbot visibility
  const [showChat, setShowChat] = useState(false);

  // Listen for openHelpChat event from NeedHelp component
  useEffect(() => {
    const openChat = () => setShowChat(true);
    window.addEventListener("openHelpChat", openChat);
    return () => window.removeEventListener("openHelpChat", openChat);
  }, []);

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
  const [formDef, setFormDef] = useState<JsonObject | null>(null);
  const [formData, setFormData] = useState<JsonObject>({});
  const [loading, setLoading] = useState(true);
  const [leafFields, setLeafFields] = useState<
    { path: string; schema: JsonValue }[]
  >([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [fieldsPerPage, setFieldsPerPage] = useState(4);

  // Calculate responsive fields per page based on viewport height
  useEffect(() => {
    const calculateFieldsPerPage = () => {
      if (typeof window === "undefined") return;
      const vh = window.innerHeight;
      // Rough estimation: header ~100px, footer ~80px, field ~120px average
      // Available space = vh - 200px (header/footer/padding)
      const availableHeight = vh - 250;
      const estimatedFieldHeight = 120;
      const calculated = Math.max(
        2,
        Math.floor(availableHeight / estimatedFieldHeight)
      );
      setFieldsPerPage(Math.min(calculated, 6)); // cap at 6 fields per page
    };
    calculateFieldsPerPage();
    window.addEventListener("resize", calculateFieldsPerPage);
    return () => window.removeEventListener("resize", calculateFieldsPerPage);
  }, []);

  const collectLeafPaths = useCallback(
    (obj: JsonValue, prefix = ""): { path: string; schema: JsonValue }[] => {
      const out: { path: string; schema: JsonValue }[] = [];
      if (obj === null) return out;
      if (
        typeof obj === "string" ||
        typeof obj === "boolean" ||
        Array.isArray(obj)
      ) {
        out.push({ path: prefix, schema: obj });
        return out;
      }
      if (typeof obj === "object") {
        const asObj = obj as JsonObject;
        for (const k of Object.keys(asObj)) {
          const child = asObj[k];
          const path = prefix ? `${prefix}.${k}` : k;
          out.push(...collectLeafPaths(child, path));
        }
      }
      return out;
    },
    []
  );

  const chunk = <T,>(arr: T[], size: number) => {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
    return res;
  };

  const handleChange = (path: string, value: JsonValue) => {
    // update nested formData by path (dot separated)
    setFormData((prev) => {
      const clone: JsonObject = { ...(prev || {}) };
      const parts = path.split(".");
      let cur: unknown = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        const curObj = cur as JsonObject;
        if (curObj[p] === undefined || curObj[p] === null)
          curObj[p] = {} as JsonObject;
        cur = curObj[p];
      }
      const lastKey = parts[parts.length - 1];
      (cur as JsonObject)[lastKey] = value;
      return clone;
    });
  };
  useEffect(() => {
    // fetch form definition from API
    const fetchForm = async () => {
      try {
        const res = await fetch("/api/get-form");
        const json = await res.json();
        setFormDef(json);
        // initialize formData with values from json (keeping structure)
        const initData = deepCloneAndEmpty(json) as JsonObject;
        setFormData(initData);
        // compute leaf fields and reset pagination
        const leaves = collectLeafPaths(json, "");
        setLeafFields(leaves.filter((l) => l.path));
        setPageIndex(0);
      } catch (err) {
        console.error("failed to load form", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [collectLeafPaths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation: require at least one non-empty field
    const isEmpty = isObjectEmptyValues(formData);
    if (isEmpty) {
      alert("Please fill at least one field before submitting.");
      return;
    }

    try {
      const res = await fetch("/api/save-form-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: formData,
          form: formDef?.formNumber || "unknown",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      await res.json();
      alert("Form saved to form_input.json");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Failed to save form input");
    }
  };
  // use the helper defined above

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading form...
      </div>
    );
  }

  // Desktop: use the richer card layout inspired by FormPage.tsx but keep dynamic fields
  if (isDesktop) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white overflow-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-[#B7C3C7] rounded-lg shadow-md w-full max-w-3xl my-7 px-6 py-6 flex flex-col gap-3"
        >
          {/* Add NeedHelp here */}
          <NeedHelp message="Need Help?" />
          <h2 className="text-2xl font-bold text-[#34495E] pt-2">
            Fill up form to proceed
          </h2>

          {/* Render dynamic fields from formDef (keeps the JSON-driven inputs) */}
          <div className="space-y-4">
            {formDef && (
              <>
                {(() => {
                  const pages = chunk(leafFields, fieldsPerPage);
                  const current = pages[pageIndex] || [];
                  const totalPages = pages.length;
                  return (
                    <>
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#34495E]">
                            Step {pageIndex + 1} of {totalPages}
                          </span>
                          <span className="text-xs text-gray-600">
                            {Math.round(((pageIndex + 1) / totalPages) * 100)}%
                            Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2.5">
                          <div
                            className="bg-[#34495E] h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${((pageIndex + 1) / totalPages) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {current.map((f) => renderLeafField(f))}
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>

          <div className="flex justify-between mt-4 mb-4">
            {(() => {
              const pages = chunk(leafFields, fieldsPerPage);

              return (
                <>
                  {/* Previous/Back button on the left */}
                  <button
                    type="button"
                    onClick={
                      pageIndex === 0
                        ? () => router.back()
                        : () => setPageIndex((p) => p - 1)
                    }
                    className="px-8 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {pageIndex === 0 ? "Back" : "Previous"}
                  </button>

                  {/* Next/Submit button on the right */}
                  {pageIndex < pages.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setPageIndex((p) => p + 1)}
                      className="px-8 py-2 rounded-full bg-[#132437] text-white hover:bg-[#0f1a29]"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-2 rounded-full bg-[#132437] text-white hover:bg-[#0f1a29]"
                    >
                      Submit
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </form>
        {showChat && <HelpChatbot onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Form area centered */}
      <main className="flex justify-center items-start flex-1 py-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-200 p-4 md:p-6 flex flex-col gap-4"
          >
            {/* Add NeedHelp for mobile */}
            <NeedHelp message="Need Help?" />

            {/* Render dynamic fields from formDef (paginated) */}
            {formDef && (
              <>
                {(() => {
                  const pages = chunk(leafFields, fieldsPerPage);
                  const current = pages[pageIndex] || [];
                  const totalPages = pages.length;
                  return (
                    <>
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#34495E]">
                            Step {pageIndex + 1} of {totalPages}
                          </span>
                          <span className="text-xs text-gray-600">
                            {Math.round(((pageIndex + 1) / totalPages) * 100)}%
                            Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2.5">
                          <div
                            className="bg-[#34495E] h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${((pageIndex + 1) / totalPages) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {current.map((f) => renderLeafField(f))}
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              {(() => {
                const pages = chunk(leafFields, fieldsPerPage);
                return (
                  <>
                    <button
                      type="button"
                      onClick={
                        pageIndex === 0
                          ? () => router.back()
                          : () => setPageIndex((p) => p - 1)
                      }
                      className="w-full sm:w-auto bg-gray-400 text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-500 transition-all"
                    >
                      {pageIndex === 0 ? "Back" : "Previous"}
                    </button>
                    {pageIndex < pages.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setPageIndex((p) => p + 1)}
                        className="w-full sm:w-auto bg-[#1c2b39] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#243647] transition-all"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-[#1c2b39] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#243647] transition-all"
                      >
                        Submit
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </form>
        </div>
      </main>
      {showChat && <HelpChatbot onClose={() => setShowChat(false)} />}
    </div>
  );

  // Recursive renderer
  function humanize(key: string) {
    // convert camelCase or snake_case to normal title
    const withSpaces = key
      // camelCase -> split
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-]+/g, " ")
      .trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  function renderObjectFields(obj: JsonValue, pathPrefix: string) {
    if (obj === null || typeof obj !== "object") return null;
    const asObj = obj as JsonObject;
    return Object.keys(asObj).map((key) => {
      const value = asObj[key];
      const path = pathPrefix ? `${pathPrefix}.${key}` : key;

      // primitives
      if (typeof value === "string" || value === null) {
        const raw = getValueAtPath(formData, path);
        const val =
          typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
        return (
          <div key={path}>
            <label className="block font-semibold text-gray-800">
              {humanize(key)}
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(path, e.target.value as JsonValue)}
              className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900 placeholder-gray-400 border-gray-300"
            />
          </div>
        );
      }

      if (typeof value === "boolean") {
        const raw = getValueAtPath(formData, path);
        const val = typeof raw === "boolean" ? raw : false;
        return (
          <div key={path} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={val}
              onChange={(e) =>
                handleChange(path, e.target.checked as JsonValue)
              }
            />
            <label className="font-semibold text-gray-800">
              {humanize(key)}
            </label>
          </div>
        );
      }

      if (Array.isArray(value)) {
        // render one item for now
        const itemsRaw = getValueAtPath(formData, path);
        const items = Array.isArray(itemsRaw) ? (itemsRaw as JsonValue[]) : [];
        return (
          <div key={path} className="p-2 border rounded-md bg-white">
            <label className="block font-semibold text-gray-800">
              {humanize(key)}
            </label>
            {Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === "object" ? (
              // render fields for first object
              (items as JsonValue[]).map((it, idx) => (
                <div key={`${path}.${idx}`} className="mt-2 p-2 border rounded">
                  {renderObjectFields(value[0], `${path}.${idx}`)}
                </div>
              ))
            ) : (
              <input
                type="text"
                value={items
                  .map((v) =>
                    typeof v === "string" || typeof v === "number"
                      ? String(v)
                      : ""
                  )
                  .join(", ")}
                onChange={(e) =>
                  handleChange(
                    path,
                    e.target.value
                      .split(",")
                      .map((s) => s.trim()) as JsonValue[]
                  )
                }
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900 placeholder-gray-400 border-gray-300"
              />
            )}
          </div>
        );
      }

      if (typeof value === "object") {
        return (
          <div key={path} className="p-2 border rounded-md bg-white">
            <label className="block font-semibold text-gray-800">
              {humanize(key)}
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderObjectFields(value, path)}
            </div>
          </div>
        );
      }

      return null;
    });
  }

  function getValueAtPath(obj: JsonValue, path: string): JsonValue | undefined {
    const parts = path.split(".");
    let cur: JsonValue = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = (cur as JsonObject)[p];
    }
    return cur;
  }

  function renderLeafField(f: { path: string; schema: JsonValue }) {
    const { path, schema } = f;
    const key = path;
    const humanLabel = humanize(path.split(".").slice(-1)[0]);

    const raw = getValueAtPath(formData, path);
    const val =
      typeof raw === "string" || typeof raw === "number" ? String(raw) : "";

    // primitives and null -> text
    if (typeof schema === "string" || schema === null) {
      return (
        <div key={key}>
          <label className="block font-semibold text-gray-800">
            {humanLabel}
          </label>
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(path, e.target.value as JsonValue)}
            className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900 placeholder-gray-400 border-gray-300"
          />
        </div>
      );
    }

    if (typeof schema === "boolean") {
      const boolVal = typeof raw === "boolean" ? raw : false;
      return (
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={boolVal}
            onChange={(e) => handleChange(path, e.target.checked as JsonValue)}
          />
          <label className="font-semibold text-gray-800">{humanLabel}</label>
        </div>
      );
    }

    if (Array.isArray(schema)) {
      // render as comma-separated for primitives or recurse for object arrays
      if (schema.length > 0 && typeof schema[0] === "object") {
        // try to render nested object fields for first item
        return (
          <div key={key} className="p-2 border rounded-md bg-white">
            <label className="block font-semibold text-gray-800">
              {humanLabel}
            </label>
            {renderObjectFields(schema[0], path)}
          </div>
        );
      }
      return (
        <div key={key}>
          <label className="block font-semibold text-gray-800">
            {humanLabel}
          </label>
          <input
            type="text"
            value={val}
            onChange={(e) =>
              handleChange(
                path,
                (e.target.value as string)
                  .split(",")
                  .map((s) => s.trim()) as unknown as JsonValue
              )
            }
            className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900 placeholder-gray-400 border-gray-300"
          />
        </div>
      );
    }

    // fallback for object
    if (typeof schema === "object") {
      return (
        <div key={key} className="p-2 border rounded-md bg-white">
          <label className="block font-semibold text-gray-800">
            {humanLabel}
          </label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderObjectFields(schema, path)}
          </div>
        </div>
      );
    }

    return null;
  }

  // keep reference to avoid linter "defined but never used" in some toolchains
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _keep_renderObjectFields = renderObjectFields;
}
