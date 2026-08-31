import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Cloudinary non configuré" }, { status: 500 });
    }

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
      return NextResponse.json({ error: "Échec de l'upload", details }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur" },
      { status: 500 }
    );
  }
}
