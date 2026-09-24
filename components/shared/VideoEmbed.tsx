"use client";

import React from "react";
import { ExternalLink, Film } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  className?: string;
  title?: string;
}

export function parseVideoUrl(rawUrl: string): {
  type: "youtube" | "vimeo" | "dailymotion" | "file" | "unknown";
  embedUrl?: string;
  originalUrl: string;
} {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { type: "unknown", originalUrl: "" };
  }

  const url = rawUrl.trim();

  // YouTube Shorts: https://youtube.com/shorts/U3E3TT3SluQ... or https://www.youtube.com/shorts/U3E3TT3SluQ...
  const ytShortsMatch = url.match(/(?:youtube\.com|youtu\.be)\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShortsMatch?.[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShortsMatch[1]}?rel=0`,
      originalUrl: url,
    };
  }

  // YouTube standard: https://www.youtube.com/watch?v=...
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?.*?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]+)/i);
  if (ytWatchMatch?.[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytWatchMatch[1]}?rel=0`,
      originalUrl: url,
    };
  }

  // YouTube short link: https://youtu.be/...
  const ytShortLinkMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (ytShortLinkMatch?.[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShortLinkMatch[1]}?rel=0`,
      originalUrl: url,
    };
  }

  // YouTube embed: https://www.youtube.com/embed/...
  const ytEmbedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (ytEmbedMatch?.[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytEmbedMatch[1]}?rel=0`,
      originalUrl: url,
    };
  }

  // Vimeo: https://vimeo.com/123456789
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch?.[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`,
      originalUrl: url,
    };
  }

  // Dailymotion: https://dailymotion.com/video/... or https://dai.ly/...
  const dailyMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dailyMatch?.[1]) {
    return {
      type: "dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${dailyMatch[1]}`,
      originalUrl: url,
    };
  }

  // Direct video files (.mp4, .webm, .ogg)
  const isDirectFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes("res.cloudinary.com") && url.includes("/video/upload/");
  if (isDirectFile) {
    return {
      type: "file",
      originalUrl: url,
    };
  }

  return { type: "unknown", originalUrl: url };
}

export default function VideoEmbed({ url, className = "", title = "Vidéo" }: VideoEmbedProps) {
  const parsed = parseVideoUrl(url);

  if (!parsed.originalUrl) {
    return null;
  }

  if (parsed.type === "youtube" || parsed.type === "vimeo" || parsed.type === "dailymotion") {
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-[#EDEDF0] ${className}`}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
      </div>
    );
  }

  if (parsed.type === "file") {
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-[#EDEDF0] ${className}`}>
        <video
          src={parsed.originalUrl}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Unknown / generic video link fallback
  return (
    <div className={`relative aspect-video rounded-2xl overflow-hidden bg-[#fef2f4] border border-[#EDEDF0] p-4 flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0E0E10] shadow-sm mb-3">
        <Film size={22} />
      </div>
      <p className="text-sm font-bold text-[#0E0E10] mb-1 truncate max-w-xs">{title}</p>
      <a
        href={parsed.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e64a5d] hover:underline mt-1"
      >
        Ouvrir la vidéo <ExternalLink size={12} />
      </a>
    </div>
  );
}
