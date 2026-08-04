"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { BlogPost } from "@/types/admin";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;
    
    async function loadPost() {
      try {
        const [postRes, listRes] = await Promise.all([
          fetch(`/api/blog/${slug}`),
          fetch("/api/blog"),
        ]);
        
        if (!postRes.ok) {
          setPost(null);
          setLoading(false);
          return;
        }
        
        const postData = await postRes.json();
        const listData = await listRes.json();
        
        setPost(postData.post);
        if (postData.post && listData.posts) {
          setRelated(
            listData.posts
              .filter((p: BlogPost) => p.category === postData.post.category && p.slug !== postData.post.slug)
              .slice(0, 2)
          );
        }
      } catch (error) {
        console.error("Error loading article:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadPost();
  }, [slug]);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <Header ctaHref="/quiz" ctaLabel="Créer mon plan" />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-[#8b8b86]">Chargement de l&apos;article...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header ctaHref="/quiz" ctaLabel="Créer mon plan" />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <Link href="/blog" className="text-[#1c1c1c] hover:underline font-medium">
              Retour au blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Créer mon plan" />

      <main className="min-h-screen">
        {/* Hero Image */}
        <div className="relative h-[400px] md:h-[500px]">
          <Image
            src={post.coverImage || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&h=600&q=85"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto px-6 pb-12 w-full">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{Math.max(5, Math.ceil(post.content.split(" ").length / 200))} min</span>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group"
                  >
                    <div className="relative h-48 mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={rel.coverImage || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&h=380&q=85"}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-sm text-gray-600">{rel.category}</span>
                    <h3 className="font-semibold group-hover:text-[#1c1c1c] transition-colors">
                      {rel.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-gray-50 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-4">Prêt à organiser votre mariage ?</h3>
            <p className="text-gray-600 mb-6">
              Créez votre plan personnalisé en quelques minutes avec notre IA.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c1c1c] text-white rounded-lg font-medium hover:bg-[#333] transition-colors"
            >
              Créer mon plan <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
