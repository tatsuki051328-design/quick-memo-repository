"use client";

import { useState, useRef, useEffect } from "react";
import { MemoCategory } from "@/lib/notion";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddMemoModal({ open, onClose, onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<MemoCategory>("private");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 120);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim(), category }),
      });
      if (!res.ok) throw new Error();
      setTitle(""); setBody(""); setUrl("");
      setCategory("private");
      onAdded();
      onClose();
    } catch {
      setError("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center fade-in"
      style={{ background: "rgba(46,66,74,0.4)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg slide-up rounded-t-3xl px-5 pt-4 pb-10"
        style={{
          background: "#E8D5C0",
          boxShadow: "0 -8px 40px rgba(63,90,98,0.18)",
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(63,90,98,0.2)" }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold" style={{ color: "#2E424A" }}>
            New Memo
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(63,90,98,0.1)", color: "#3F5A62" }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category toggle */}
          <div>
            <label className="block text-[11px] font-semibold tracking-widest mb-2" style={{ color: "#9ab0b7" }}>
              CATEGORY
            </label>
            <div className="flex gap-2">
              {(["private", "work"] as MemoCategory[]).map((c) => {
                const active = category === c;
                const isWork = c === "work";
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold tracking-wider transition-all active:scale-95"
                    style={{
                      background: active ? (isWork ? "#3F5A62" : "#D95C34") : "rgba(63,90,98,0.06)",
                      color: active ? "#ffffff" : "#9ab0b7",
                    }}
                  >
                    {c === "work" ? "WORK" : "PRIVATE"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold tracking-widest mb-2" style={{ color: "#9ab0b7" }}>
              TITLE *
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="メモのタイトル"
              className="warm-input w-full rounded-xl px-4 py-3 text-[15px]"
              style={{
                background: "#F0E6D8",
                border: "1.5px solid rgba(63,90,98,0.15)",
                color: "#2E424A",
              }}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-semibold tracking-widest mb-2" style={{ color: "#9ab0b7" }}>
              BODY
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="詳細メモ（任意）"
              rows={3}
              className="warm-input w-full rounded-xl px-4 py-3 text-[14px] resize-none"
              style={{
                background: "#F0E6D8",
                border: "1.5px solid rgba(63,90,98,0.15)",
                color: "#2E424A",
              }}
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-[11px] font-semibold tracking-widest mb-2" style={{ color: "#9ab0b7" }}>
              URL
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ab0b7" }}>
                <LinkIcon />
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="warm-input w-full rounded-xl pl-9 pr-4 py-3 text-[14px]"
                style={{
                  background: "#F0E6D8",
                  border: "1.5px solid rgba(63,90,98,0.15)",
                  color: "#2E424A",
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-center font-medium" style={{ color: "#D95C34" }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all active:scale-95 disabled:opacity-60 mt-1"
            style={{
              background: loading ? "rgba(217,92,52,0.4)" : "#D95C34",
              color: "#ffffff",
              boxShadow: loading ? "none" : "0 4px 20px rgba(254,130,84,0.35)",
            }}
          >
            {loading ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
