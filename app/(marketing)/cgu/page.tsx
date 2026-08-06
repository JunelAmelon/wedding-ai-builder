import { Header, Footer } from "@/components/layout";

export default function TermsPage() {
  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Trouver mes matches" />
      <main className="wrap py-16">
        <h1 className="font-display text-3xl font-bold mb-6">Conditions générales d'utilisation</h1>
        <div className="prose max-w-2xl">
          <p>
            En utilisant Mariage Facile, vous acceptez que le service soit fourni à titre indicatif. Les devis et propositions des prestataires restent sous leur responsabilité exclusive.
          </p>
          <p>
            Le service est gratuit pour les couples. Les prestataires peuvent souscrire à des formules payantes pour augmenter leur visibilité.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
