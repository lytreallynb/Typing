"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface BackgroundSettingsFormProps {
  initialImageUrl: string | null;
  initialOpacity: number;
}

export function BackgroundSettingsForm({ initialImageUrl, initialOpacity }: BackgroundSettingsFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [opacity, setOpacity] = useState(Math.round((initialOpacity ?? 0.4) * 100));
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const humanOpacity = useMemo(() => (opacity / 100).toFixed(2), [opacity]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let uploadedUrl = imageUrl ?? null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/background/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error((await uploadRes.json()).error || "Failed to upload image.");
        }
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
        setImageUrl(uploadedUrl);
        setSelectedFile(null);
      }

      const saveRes = await fetch("/api/background/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          opacity: Number((opacity / 100).toFixed(2)),
        }),
      });

      if (!saveRes.ok) {
        throw new Error((await saveRes.json()).error || "Failed to save background.");
      }

      setMessage("Background saved successfully!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/background/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null, opacity: null }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || "Failed to reset background.");
      }
      setSelectedFile(null);
      setImageUrl(null);
      setPreviewUrl(null);
      setOpacity(40);
      setMessage("Background reset to default.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to reset background.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
          Upload image
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:rounded-2xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-600 hover:file:bg-indigo-100"
            onChange={handleFileChange}
          />
          <span className="mt-1 block text-xs text-gray-500">Formats: JPG, PNG, WebP · Max 5MB</span>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900 dark:text-gray-50">Background opacity</span>
            <span className="text-gray-500">{humanOpacity}</span>
          </div>
          <Slider min={0} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} aria-label="Background opacity" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="ghost" onClick={handleReset} disabled={saving} className="rounded-full">
            Reset to default
          </Button>
        </div>
        {message && <p className="text-sm text-indigo-600 dark:text-indigo-400">{message}</p>}
      </div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-gray-100/70 p-4 shadow-inner dark:border-gray-800 dark:bg-gray-900/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">Live preview</p>
        <div
          className="relative h-64 rounded-2xl border border-dashed border-gray-300 bg-cover bg-center dark:border-gray-700"
          style={{
            backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
            opacity: Number(humanOpacity),
          }}
        >
          {!previewUrl && (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No custom background. Upload an image to preview.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
