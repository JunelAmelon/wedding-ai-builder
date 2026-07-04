"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const COMMON_EMOJIS = [
  "😀", "😂", "🥰", "😘", "😍", "🤩", "😎", "🥳", "🤗",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕",
  "👍", "🙏", "👏", "🤝", "✌️", "🤞", "🎉", "🎊", "✨",
  "🔥", "💯", "🌹", "🌸", "🌺", "🌻", "🌷", "💐", "🍾",
  "🥂", "🍰", "🎂", "🍾", "🎁", "🎵", "💍", "👰", "🤵",
];

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-text-secondary hover:bg-black/[0.04] rounded-full transition"
        aria-label="Emojis"
      >
        <Smile size={20} />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-2xl bg-white border border-black/[0.06] shadow-[0_12px_40px_rgba(11,15,26,0.14)] z-50">
          <div className="grid grid-cols-9 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setOpen(false);
                }}
                className="text-lg p-1 hover:bg-black/[0.04] rounded-md transition"
                aria-label={`Emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
