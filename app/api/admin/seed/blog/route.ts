import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { BlogPost } from "@/types/admin";

const isDev = process.env.NODE_ENV === "development";

const DEFAULT_AUTHOR = { authorId: "seed", authorName: "Équipe Mariage Facile" };

const SEED_POSTS: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "authorId" | "authorName">[] = [
  {
    title: "Comment répartir son budget mariage sans mauvaise surprise",
    slug: "comment-repartir-budget-mariage",
    excerpt: "Organiser un mariage est un projet passionnant, mais la gestion du budget peut rapidement devenir un casse-tête. Voici notre guide complet pour répartir votre budget mariage intelligemment.",
    content: `
      <p>Organiser un mariage est un projet passionnant, mais la gestion du budget peut rapidement devenir un casse-tête. Voici notre guide complet pour répartir votre budget mariage intelligemment et éviter les mauvaises surprises.</p>
      <h2>La règle des 50-30-20</h2>
      <p>Une méthode éprouvée pour répartir votre budget est la règle des 50-30-20 :</p>
      <ul>
        <li><strong>50%</strong> pour le lieu et le traiteur</li>
        <li><strong>30%</strong> pour les prestataires</li>
        <li><strong>20%</strong> pour les imprévus et détails</li>
      </ul>
      <p>Cette règle constitue une base solide pour démarrer. Elle vous permet d'allouer les plus grosses sommes aux postes les plus importants, tout en gardant une marge pour les dépenses imprévues.</p>
      <h2>Les postes de dépense à surveiller</h2>
      <h3>1. Le lieu de réception</h3>
      <p>Le budget moyen pour un lieu de réception en France représente 40 à 50% du budget total. N'oubliez pas d'inclure la location de la salle, le traiteur, les boissons, le service et les taxes.</p>
      <h3>2. La photographie et la vidéo</h3>
      <p>Comptez entre 10% et 15% de votre budget pour immortaliser votre journée. Les tarifs varient selon la durée, le nombre de photographes, les albums et la vidéo.</p>
      <h2>Prévoir une marge de sécurité</h2>
      <p>Il est recommandé de prévoir 10 à 15% de votre budget total pour les imprévus. Cette marge vous permettra de faire face aux dépenses imprévues sans stress.</p>
      <h2>Conclusion</h2>
      <p>Une bonne planification budgétaire est la clé d'un mariage réussi. Prenez le temps de bien estimer chaque poste, prévoyez une marge de sécurité, et n'hésitez pas à demander plusieurs devis pour comparer les offres.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Budget",
    tags: ["budget", "mariage", "argent"],
    status: "published",
    metaTitle: "Répartir son budget mariage sans mauvaise surprise",
    metaDescription: "Guide complet pour répartir votre budget mariage intelligemment et éviter les mauvaises surprises.",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Le rétroplanning idéal, 12 mois avant le jour J",
    slug: "retroplanning-ideal-12-mois",
    excerpt: "Organiser un mariage demande du temps et de l'organisation. Voici notre rétroplanning détaillé pour planifier chaque étape, de 12 mois avant le jour J jusqu'au grand jour.",
    content: `
      <p>Organiser un mariage demande du temps et de l'organisation. Voici notre rétroplanning détaillé pour vous aider à planifier chaque étape, de 12 mois avant le jour J jusqu'au grand jour.</p>
      <h2>12 mois avant : les premières décisions</h2>
      <ul>
        <li>Fixer la date du mariage</li>
        <li>Définir le budget global</li>
        <li>Commencer la recherche du lieu de réception</li>
        <li>Créer une liste d'invités provisoire</li>
      </ul>
      <p>C'est le moment de poser les bases. Avoir une date et un budget clairs va conditionner toutes les décisions suivantes.</p>
      <h2>9-11 mois avant : les réservations</h2>
      <ul>
        <li>Réserver le lieu de réception</li>
        <li>Choisir et réserver le traiteur</li>
        <li>Commencer les recherches de prestataires</li>
        <li>Envoyer les faire-part save-the-date</li>
      </ul>
      <h2>6-8 mois avant : les détails</h2>
      <p>Réservez le photographe et le vidéaste, choisissez la musique, sélectionnez les tenues et commandez les alliances. C'est la phase où les choix artistiques prennent forme.</p>
      <h2>3-5 mois avant : les finitions</h2>
      <p>Finalisez la liste d'invités, envoyez les invitations officielles, choisissez la décoration et les fleurs, organisez le transport.</p>
      <h2>Conclusion</h2>
      <p>Un bon rétroplanning vous permet d'avancer sereinement. N'attendez pas le dernier moment et anticipez les grands postes.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Planning",
    tags: ["planning", "rétroplanning", "organisation"],
    status: "published",
    metaTitle: "Rétroplanning mariage 12 mois avant le jour J",
    metaDescription: "Rétroplanning détaillé pour organiser votre mariage sereinement de 12 mois avant le jour J.",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "5 questions à poser avant de matcher avec votre traiteur",
    slug: "questions-traiteur",
    excerpt: "Choisir un traiteur pour son mariage est une décision importante. Voici les 5 questions essentielles à poser avant de matcher.",
    content: `
      <p>Choisir un traiteur pour son mariage est une décision importante. Voici les 5 questions essentielles à poser avant de matcher avec votre traiteur.</p>
      <h2>1. Quels types de prestations proposez-vous ?</h2>
      <p>Chaque traiteur a ses spécialités. Certains proposent des formules clé en main, d'autres des services plus sur-mesure. Assurez-vous que son offre correspond à vos attentes.</p>
      <h2>2. Quel est le tarif par convive ?</h2>
      <p>Le tarif par convive varie souvent selon le menu choisi, les boissons incluses et le service. Demandez un devis détaillé.</p>
      <h2>3. Avez-vous déjà travaillé dans mon lieu de réception ?</h2>
      <p>Un traiteur connaissant le lieu saura s'adapter aux contraintes techniques et gagnera du temps le jour J.</p>
      <h2>4. Comment gérez-vous les allergies et régimes spéciaux ?</h2>
      <p>Veillez à ce que vos invités allergiques ou végétariens aient des options de qualité.</p>
      <h2>5. Quelles sont les conditions d'annulation ?</h2>
      <p>Anticipez l'imprévisible. Lisez bien le contrat concernant les reports et annulations.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Prestataires",
    tags: ["traiteur", "prestataires", "mariage"],
    status: "published",
    metaTitle: "5 questions à poser à votre traiteur",
    metaDescription: "Les questions essentielles à poser à un traiteur avant de matcher pour votre mariage.",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Boho, classique, minimaliste : trouver son style en 10 minutes",
    slug: "trouver-style-mariage",
    excerpt: "Vous ne savez pas quel style de mariage adopter ? Notre guide rapide vous aide à trouver votre univers en 10 minutes.",
    content: `
      <p>Vous ne savez pas quel style de mariage adopter ? Notre guide rapide vous aide à trouver votre univers en 10 minutes.</p>
      <h2>Le style bohème</h2>
      <p>Macramé, fleurs séchées, tons terracotta, extérieur champêtre. Le bohème est parfait pour un mariage à la belle saison, dans un jardin ou sous une tente.</p>
      <h2>Le style classique</h2>
      <p>Blanc, or, chandeliers, salle élégante. Le classique convient aux couples qui aiment la tradition et une ambiance intemporelle.</p>
      <h2>Le style minimaliste</h2>
      <p>Lignes épurées, palette restreinte, fleurs simples, pas de superflu. Le minimalisme met en valeur les moments et les émotions.</p>
      <h2>Comment choisir ?</h2>
      <p>Faites un moodboard, repérez les couleurs et matières qui vous font vibrer. Notre quiz IA peut aussi vous guider vers le style qui vous correspond.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Style",
    tags: ["style", "bohème", "classique", "minimaliste"],
    status: "published",
    metaTitle: "Trouver son style de mariage en 10 minutes",
    metaDescription: "Guide rapide pour choisir entre bohème, classique et minimaliste pour votre mariage.",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Comment lire un devis de photographe : c'est un match ou non ?",
    slug: "lire-devis-photographe",
    excerpt: "Comparer les devis de photographes peut être compliqué. Voici comment lire un devis et savoir si c'est un match.",
    content: `
      <p>Comparer les devis de photographes peut être compliqué. Voici comment lire un devis et savoir si c'est un match pour votre mariage.</p>
      <h2>Les postes à vérifier</h2>
      <ul>
        <li>Durée de présence (journée complète ou demi-journée)</li>
        <li>Nombre de photographes</li>
        <li>Livraison des photos (nombre, format, délai)</li>
        <li>Albums et tirages inclus</li>
        <li>Options vidéo</li>
      </ul>
      <h2>Les différences de tarif</h2>
      <p>Un photographe expérimenté coûte plus cher mais assure une qualité et un savoir-faire. Un tarif très bas peut cacher des détails manquants ou une expérience limitée.</p>
      <h2>Poser les bonnes questions</h2>
      <p>Demandez à voir des reportages complets, pas seulement les meilleures photos. Assurez-vous que le style correspond à vos attentes.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Prestataires",
    tags: ["photographe", "devis", "prestataires"],
    status: "published",
    metaTitle: "Lire un devis de photographe mariage",
    metaDescription: "Comment lire et comparer un devis de photographe pour votre mariage.",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Les 6 postes de dépense les plus souvent sous-estimés",
    slug: "depenses-sous-estimees",
    excerpt: "Certains postes du budget mariage sont souvent oubliés. Voici ceux qui peuvent faire exploser votre budget si vous ne les anticipez pas.",
    content: `
      <p>Certains postes du budget mariage sont souvent oubliés. Voici les 6 dépenses les plus souvent sous-estimées qui peuvent faire exploser votre budget.</p>
      <h2>1. Les frais de transport</h2>
      <p>Transport des invités, location de bus, navette, parking. Les coûts peuvent grimper vite, surtout si le lieu est excentré.</p>
      <h2>2. La coiffure et le maquillage</h2>
      <p>Essais, maquillage des proches, retouches, déplacements à domicile. Prévoyez un budget réaliste.</p>
      <h2>3. Les alliances et bijoux</h2>
      <p>Les alliances ne font pas toujours partie du premier budget. Ajoutez-les dès le départ.</p>
      <h2>4. Les cadeaux aux invités</h2>
      <p>Même un petit cadeau multiplié par 80 convives représente une somme.</p>
      <h2>5. Les boissons</h2>
      <p>Le vin d'honneur et les boissons à table peuvent être un poste important selon la formule.</p>
      <h2>6. Les imprévus</h2>
      <p>Retouches de robe, changement de dernière minute, petits extras. Une marge de 10% est indispensable.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&h=600&q=85",
    category: "Budget",
    tags: ["budget", "dépenses", "mariage"],
    status: "published",
    metaTitle: "Postes de dépense mariage sous-estimés",
    metaDescription: "Les 6 postes de dépense mariage les plus souvent sous-estimés.",
    publishedAt: new Date().toISOString(),
  },
];

export async function POST() {
  try {
    if (!isDev) await requireAdmin();

    const existing = await adminRepo.listBlogPosts(1000);
    const results = [];

    for (const post of SEED_POSTS) {
      const alreadyExists = existing.find((p) => p.slug === post.slug);
      if (alreadyExists) {
        results.push({ slug: post.slug, status: "skipped" });
      } else {
        const created = await adminRepo.createBlogPost({
          ...post,
          ...DEFAULT_AUTHOR,
        });
        results.push({ slug: created.slug, status: "created" });
      }
    }

    return NextResponse.json({
      message: `Seed terminé : ${results.filter((r) => r.status === "created").length} articles créés, ${results.filter((r) => r.status === "skipped").length} ignorés.`,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
