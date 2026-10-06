import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

const FORBIDDEN_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "php",
  "phtml",
  "js",
  "mjs",
  "cjs",
  "html",
  "htm",
  "svg",
  "py",
  "vbs",
  "jar",
  "apk",
  "dll",
  "scr",
]);

export async function POST(req: Request) {
  try {
    // 1. Authentification obligatoire
    const user = await requireAuth();

    // 2. Rate limiting (20 uploads max par minute par utilisateur + IP)
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`upload:${user.id}:${ip}`, 20, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Limite de téléversement atteinte. Veuillez patienter une minute." },
        { status: 429 }
      );
    }

    // 3. Extraction et validation de la présence du fichier
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Aucun fichier valide fourni." }, { status: 400 });
    }

    // 4. Validation de la taille du fichier (Max 5 Mo)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale autorisée (5 Mo)." },
        { status: 400 }
      );
    }

    // 5. Validation de l'extension et du type MIME
    const filename = (file as File).name || "";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext && FORBIDDEN_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Type ou extension de fichier non autorisé." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "";
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error:
            "Format de fichier non supporté. Formats acceptés : JPEG, PNG, WebP, GIF, PDF, Word, Excel, TXT.",
        },
        { status: 400 }
      );
    }

    // 6. Vérification de la configuration Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "Service de stockage non configuré côté serveur." },
        { status: 500 }
      );
    }

    // 7. Envoi sécurisé vers Cloudinary
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file as File);
    cloudinaryForm.append("upload_preset", uploadPreset);
    cloudinaryForm.append("folder", "wedding-ai-builder/uploads");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: cloudinaryForm,
    });

    if (!res.ok) {
      const details = await res.text();
      console.error("[upload] Erreur réponse Cloudinary:", details);
      return NextResponse.json({ error: "Échec de l'upload vers le stockage." }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Authentification requise pour téléverser." }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
