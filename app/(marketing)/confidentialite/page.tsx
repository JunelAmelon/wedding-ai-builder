import { Header, Footer } from "@/components/layout";

export default function PrivacyPage() {
  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Trouver mes matches" />
      <main className="wrap py-16">
        <h1 className="font-display text-3xl font-bold mb-6">Politique de confidentialité</h1>
        <div className="prose max-w-2xl">
          <p>
            Mariage Facile s'engage à protéger vos données personnelles. Les informations collectées (email, date, budget, style) servent uniquement à générer votre plan de mariage personnalisé et à vous proposer des prestataires compatibles.
          </p>
          <p>
            Vos données ne sont jamais revendues. Vous pouvez demander leur suppression à tout moment en nous contactant.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
