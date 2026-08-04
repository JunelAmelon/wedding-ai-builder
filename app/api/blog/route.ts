import { NextResponse } from "next/server";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function GET() {
  try {
    const posts = await adminRepo.listBlogPosts(100);
    const publishedPosts = posts
      .filter((post) => post.status === "published")
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

    return NextResponse.json({ posts: publishedPosts });
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return NextResponse.json({ error: "Erreur de chargement des articles" }, { status: 500 });
  }
}
