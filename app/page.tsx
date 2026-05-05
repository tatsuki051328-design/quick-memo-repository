"use client";

import { useState, useRef, useEffect } from "react";
import { MemoCategory } from "@/lib/notion";

const CATEGORIES: { value: MemoCategory; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "work",    label: "Work"    },
];

export default function Home() {
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [url, setUrl]           = useState("");
  const [category, setCategory] = useState<MemoCategory>("private");
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const [diaryOpen, setDiaryOpen]       = useState(false);
  const [diaryBody, setDiaryBody]       = useState("");
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diarySaved, setDiarySaved]     = useState(false);
  const [diaryError, setDiaryError]     = useState("");
  const diaryRef = useRef<HTMLTextAreaElement>(null);

  const touchX = useRef(0);
  const touchY = useRef(0);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    if (diaryOpen) setTimeout(() => diaryRef.current?.focus(), 320);
  }, [diaryOpen]);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      titleRef.current?.focus();
    } catch {
      setError("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDiarySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!diaryBody.trim()) { setDiaryError("メモを入力してください"); return; }
    setDiaryLoading(true);
    setDiaryError("");
    try {
      const res = await fetch("/api/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", body: diaryBody.trim(), url: "", category: "diary" }),
      });
      if (!res.ok) throw new Error();
      setDiaryBody("");
      setDiarySaved(true);
      setTimeout(() => setDiarySaved(false), 2200);
      diaryRef.current?.focus();
    } catch {
      setDiaryError("保存に失敗しました");
    } finally {
      setDiaryLoading(false);
    }
  }

  function onMainTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }

  function onMainTouchEnd(e: React.TouchEvent) {
    if (diaryOpen) return;
    const dx = touchX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchY.current - e.changedTouches[0].clientY);
    if (dx > 55 && dx > dy * 1.4) setDiaryOpen(true);
  }

  function onPanelTouchStart(e: React.TouchEvent) {
    e.stopPropagation();
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }

  function onPanelTouchEnd(e: React.TouchEvent) {
    e.stopPropagation();
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = Math.abs(touchY.current - e.changedTouches[0].clientY);
    if (dx > 55 && dx > dy * 1.4) setDiaryOpen(false);
  }

  return (
    <div
      className="flex flex-col h-dvh bg-black overflow-hidden"
      onTouchStart={onMainTouchStart}
      onTouchEnd={onMainTouchEnd}
    >
      {/* Header */}
      <div className="safe-top shrink-0" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center px-5 py-4">
          <div>
            <p className="text-[17px] font-semibold text-white">QuickMemo</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>NOTION · INBOX</p>
          </div>
        </div>

        {/* Category toggle */}
        <div className="px-5 pb-4 flex gap-2">
          {CATEGORIES.map(({ value, label }) => {
            const active = category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold tracking-wide transition-all active:scale-95"
                style={{
                  background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  color: active ? "#fff" : "rgba(255,255,255,0.35)",
                  border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div>
            <label className="block text-[12px] font-medium tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              TITLE
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="メモのタイトル"
              className="glass-input w-full rounded-2xl px-4 py-4 text-[16px] font-medium"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", caretColor: "#fff" }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              BODY
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="詳細メモ（任意）"
              rows={4}
              className="glass-input w-full rounded-2xl px-4 py-4 text-[15px] resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", lineHeight: "1.6", caretColor: "#fff" }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              URL
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.35)" }}>
                <LinkIcon />
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="glass-input w-full rounded-2xl pl-10 pr-4 py-4 text-[15px]"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", caretColor: "#fff" }}
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-center" style={{ color: "rgba(255,100,100,0.8)" }}>{error}</p>
          )}
        </div>

        {/* Bottom button */}
        <div className="safe-bottom shrink-0 px-5 pt-3 pb-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.97] disabled:opacity-30"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
            }}
          >
            {loading ? "保存中..." : "Save to Notion"}
          </button>
        </div>
      </form>

      {/* Swipe edge hint */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer diary-edge-hint"
        style={{ width: 4, height: 56, background: "rgba(167,139,250,0.45)", borderRadius: "4px 0 0 4px" }}
        onClick={() => setDiaryOpen(true)}
      />

      {/* Main saved toast */}
      {saved && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 slide-up flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-medium whitespace-nowrap z-50" style={{ background: "rgba(30,30,30,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
          <CheckIcon />
          Notionに保存しました
        </div>
      )}

      {/* ── Diary Panel ── */}
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          background: "#000",
          transform: diaryOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0, 0.68, 1)",
          willChange: "transform",
        }}
        onTouchStart={onPanelTouchStart}
        onTouchEnd={onPanelTouchEnd}
      >
        {/* Panel header */}
        <div className="safe-top shrink-0" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(167,139,250,0.2)" }}>
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              type="button"
              onClick={() => setDiaryOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <ChevronLeftIcon />
            </button>
            <div>
              <p className="text-[17px] font-semibold" style={{ color: "rgba(196,181,253,1)" }}>Diary</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(196,181,253,0.45)" }}>NOTION · DIARY JOURNAL</p>
            </div>
          </div>
        </div>

        {/* Diary form */}
        <form onSubmit={handleDiarySubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <label className="block text-[12px] font-medium tracking-widest mb-2" style={{ color: "rgba(196,181,253,0.7)" }}>
              MOMENT
            </label>
            <textarea
              ref={diaryRef}
              value={diaryBody}
              onChange={(e) => { setDiaryBody(e.target.value); setDiaryError(""); }}
              placeholder="今この瞬間の出来事や気持ちを..."
              rows={10}
              className="glass-input w-full rounded-2xl px-4 py-4 text-[15px] resize-none"
              style={{
                background: "rgba(167,139,250,0.06)",
                border: "1px solid rgba(167,139,250,0.2)",
                color: "#fff",
                lineHeight: "1.7",
                caretColor: "rgba(196,181,253,1)",
              }}
            />
            <p className="mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              保存時に現在時刻が自動で付与されます
            </p>

            {diaryError && (
              <p className="mt-3 text-[13px] text-center" style={{ color: "rgba(255,100,100,0.8)" }}>{diaryError}</p>
            )}
          </div>

          {/* Diary submit button */}
          <div className="safe-bottom shrink-0 px-5 pt-3 pb-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "0.5px solid rgba(167,139,250,0.15)" }}>
            <button
              type="submit"
              disabled={diaryLoading}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.97] disabled:opacity-30"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.3)",
                color: diaryLoading ? "rgba(196,181,253,0.3)" : "rgba(196,181,253,0.9)",
              }}
            >
              {diaryLoading ? "保存中..." : "Save to Notion"}
            </button>
          </div>
        </form>

        {/* Diary saved toast */}
        {diarySaved && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 slide-up flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-medium whitespace-nowrap z-50" style={{ background: "rgba(30,30,30,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "0.5px solid rgba(167,139,250,0.3)", color: "rgba(196,181,253,0.9)" }}>
            <CheckIcon />
            Diary に記録しました
          </div>
        )}
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(255,255,255,0.7)" }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
