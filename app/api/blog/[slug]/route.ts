import { NextResponse } from "next/server";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await adminRepo.getBlogPostBySlug(params.slug);

    if (!post) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    if (post.status !== "published") {
      return NextResponse.json({ error: "Article non publié" }, { status: 403 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Error fetching blog post:", err);
    return NextResponse.json({ error: "Erreur de chargement de l'article" }, { status: 500 });
  }
}
