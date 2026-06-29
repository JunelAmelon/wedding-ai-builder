"use client";

import { useState, useRef } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

interface CloudinaryUploadProps {
  onUpload: (assets: CloudinaryAsset[]) => void;
  uploaded: CloudinaryAsset[];
  accept?: string;
  maxFiles?: number;
}

export function CloudinaryUpload({ onUpload, uploaded, accept = "*/*", maxFiles = 5 }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary n'est pas configuré. Vérifiez NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }
    if (uploaded.length + files.length > maxFiles) {
      setError(`Vous pouvez télécharger jusqu'à ${maxFiles} fichiers.`);
      return;
    }

    setUploading(true);
    setError(null);
    const assets: CloudinaryAsset[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "wedding-ai-builder/vendor-docs");

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Échec de l'upload Cloudinary");
        const data = await res.json();
        assets.push({
          url: data.secure_url,
          publicId: data.public_id,
          filename: file.name,
        });
      }
      onUpload([...uploaded, ...assets]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAsset(publicId: string) {
    onUpload(uploaded.filter((a) => a.publicId !== publicId));
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border border-dashed border-black/20 bg-surface p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          {uploading ? <Loader2 className="text-primary animate-spin" size={20} /> : <Upload className="text-primary" size={20} />}
        </div>
        <p className="text-sm font-medium text-text-primary">
          {uploading ? "Téléchargement en cours..." : "Cliquez pour ajouter des documents"}
        </p>
        <p className="text-xs text-text-secondary mt-1">Certificats, assurances, photos, Kbis (max {maxFiles})</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {uploaded.length > 0 && (
        <div className="space-y-2">
          {uploaded.map((asset) => (
            <div key={asset.publicId} className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3">
              <div className="flex items-center gap-3 min-w-0">
                <File size={18} className="text-primary shrink-0" />
                <a href={asset.url} target="_blank" rel="noreferrer" className="text-sm text-text-primary truncate hover:text-primary">
                  {asset.filename}
                </a>
              </div>
              <button
                type="button"
                onClick={() => removeAsset(asset.publicId)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-text-secondary"
                aria-label="Supprimer"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
