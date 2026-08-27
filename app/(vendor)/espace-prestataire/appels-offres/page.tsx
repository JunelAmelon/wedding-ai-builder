'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  Banknote,
  X,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Heart,
  ArrowLeft,
  Bell,
  TrendingUp,
  FileText,
  Lock,
  Crown,
  Check,
} from 'lucide-react';
import type { ProjectVendorMatch, WeddingProject } from '@/types/marketplace';

type Opportunity = {
  match: ProjectVendorMatch;
  project: WeddingProject | null;
};

export default function VendorOpportunitiesPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [plan, setPlan] = useState<{ name: string; status: string }>({ name: "Gratuit", status: "inactive" });
  const pageSize = 5;

  useEffect(() => {
    async function load() {
      try {
        const oppRes = await fetch('/api/vendor/opportunities');
        if (oppRes.status === 401) {
          router.push('/login?role=vendor');
          return;
        }
        const oppJson = await oppRes.json();
        setOpportunities(oppJson.opportunities || []);
        setSubscriptionActive(oppJson.subscriptionActive ?? true);
        setPlan(oppJson.plan || { name: "Gratuit", status: "inactive" });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function respond() {
    if (!selected || !message.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/vendor/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selected.match.id,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 402 && json.needsSubscription) {
          router.push('/espace-prestataire/offres');
          return;
        }
        if (res.status === 409) {
          setSelected(null);
          setMessage('');
          setSuccess(true);
          return;
        }
        throw new Error(json.error || `Échec de l'envoi`);
      }
      setSelected(null);
      setMessage('');
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  }

  async function ignore(matchId: string) {
    await fetch('/api/matching', { method: 'POST', body: JSON.stringify({}) });
    setOpportunities((prev) => prev.filter((o) => o.match.id !== matchId));
  }

  const sorted = useMemo(
    () =>
      [...opportunities].sort(
        (a, b) => (b.match.score || 0) - (a.match.score || 0)
      ),
    [opportunities]
  );

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const featured = sorted[0] ?? null;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) return <div className='min-h-screen bg-[#fff0f3]' />;

  return (
    <div className='min-h-screen bg-[#fff0f3] text-[#15181c] font-sans'>
      <div className='max-w-[1400px] mx-auto px-10 sm:px-20 py-12'>
        {/* Header */}
        <header className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-10'>
          <div className='text-center lg:text-left'>
            <h1 className='font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#15181c]'>
              Appels d'offres
            </h1>
            <p className='text-sm sm:text-base text-[#6b7076] font-medium mt-1'>
              Découvrez les couples qui correspondent à votre univers
            </p>
          </div>

          <div className='flex items-center justify-center lg:justify-end gap-3'>
            <Link
              href='/espace-prestataire'
              className='w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] transition active:scale-95'
              title='Retour'
            >
              <ArrowLeft className='w-5 h-5 stroke-[1.8]' />
            </Link>

            <Link
              href='/espace-prestataire/offres'
              className='w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] transition active:scale-95'
              title='Offres'
            >
              <Star className='w-5 h-5 stroke-[1.8]' />
            </Link>
          </div>
        </header>

        {/* Dashboard */}
        <main className='flex flex-col gap-6'>
          {!subscriptionActive && (
            <div className='rounded-3xl bg-gradient-to-r from-[#15181c] to-[#2c3036] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0'>
                  <Crown className='w-7 h-7 text-[#fde68a]' />
                </div>
                <div>
                  <h3 className='font-display text-lg font-bold mb-0.5'>Activez votre abonnement</h3>
                  <p className='text-sm text-white/70'>
                    Vous avez {sorted.length} opportunité{sorted.length > 1 ? 's' : ''} qui vous attend{sorted.length > 1 ? 'ent' : ''}. Activez un plan pour voir les détails et répondre aux couples.
                  </p>
                </div>
              </div>
              <Link
                href='/espace-prestataire/offres'
                className='shrink-0 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#fde68a] text-[#15181c] font-bold text-sm hover:bg-[#fcd34d] transition'
              >
                <Crown size={18} /> Voir les offres
              </Link>
            </div>
          )}
          <div className='flex flex-col gap-5'>
            <div className='h-[500px] lg:h-[540px] bg-white border border-[#ececec] shadow-md overflow-hidden flex flex-col'>
              <div className='flex items-center justify-between p-5 border-b border-[#ececec]'>
                <div>
                  <h2 className='font-display text-xl font-bold text-[#15181c]'>
                    Vos appels d'offres
                  </h2>
                  <p className='text-sm text-[#6b7076] mt-0.5'>
                    {sorted.length} opportunité{sorted.length > 1 ? 's' : ''} reçue
                    {sorted.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-full bg-[#fff0f3] flex items-center justify-center text-[#15181c]'>
                  <TrendingUp className='w-5 h-5 stroke-[2]' />
                </div>
              </div>

              {/* Tableau desktop */}
              <div className='overflow-x-auto hidden lg:block'>
                <table className='w-full text-left border-collapse'>
                  <thead className='bg-[#fff0f3]'>
                    <tr>
                      <th className='py-3.5 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]'>
                        Projet
                      </th>
                      <th className='py-3.5 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]'>
                        Catégorie
                      </th>
                      <th className='py-3.5 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]'>
                        Lieu
                      </th>
                      <th className='py-3.5 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]'>
                        Score
                      </th>
                      <th className='py-3.5 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076] text-right'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan={5} className='py-16 px-5 text-center'>
                          <div className='flex flex-col items-center gap-3 text-[#6b7076]'>
                            <div className='w-14 h-14 rounded-full bg-[#fff0f3] flex items-center justify-center text-[#15181c]'>
                              <FileText className='w-6 h-6' />
                            </div>
                            <p className='text-base font-semibold text-[#15181c]'>
                              Aucun appel d'offre reçu
                            </p>
                            <p className='text-sm'>
                              Revenez plus tard pour découvrir de nouvelles
                              opportunités.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map(({ match, project }) => (
                        <tr
                          key={match.id}
                          onClick={() =>
                            router.push(
                              `/espace-prestataire/appels-offres/${match.id}`
                            )
                          }
                          className='border-t border-[#ececec] hover:bg-[#f4f1f7] cursor-pointer transition group'
                        >
                          <td className='py-4 px-5'>
                            <div className='font-semibold text-[#15181c] flex items-center gap-2'>
                              {!subscriptionActive && <Lock size={12} className='text-[#6b7076]' />}
                              {project?.name || 'Projet sans nom'}
                            </div>
                            {project?.weddingDate && (
                              <div className='text-xs text-[#6b7076] mt-0.5'>
                                {new Date(
                                  project.weddingDate
                                ).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </td>
                          <td className='py-4 px-5'>
                            <span className='inline-flex items-center rounded-full bg-[#fff0f3] text-[#15181c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] border border-[#ececec]'>
                              {match.category}
                            </span>
                          </td>
                          <td className='py-4 px-5 text-sm text-[#6b7076]'>
                            {project?.location?.city || 'Lieu non précisé'}
                          </td>
                          <td className='py-4 px-5'>
                            <div className='inline-flex items-center gap-1 bg-[#fff0f3] px-2.5 py-1 rounded-full text-xs font-bold text-[#15181c]'>
                              <Sparkles className='w-3.5 h-3.5' />
                              {match.score}
                            </div>
                          </td>
                          <td className='py-4 px-5 text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              {match.status === "contacted" ? (
                                <span className='h-9 px-4 rounded-full bg-[#e4f4ed] text-[#2e7d5e] text-xs font-bold flex items-center gap-1.5'>
                                  <Check className='w-3.5 h-3.5' />
                                  Répondu
                                </span>
                              ) : !subscriptionActive ? (
                                <Link
                                  href='/espace-prestataire/offres'
                                  className='h-9 px-4 rounded-full bg-[#fde68a] text-[#15181c] text-xs font-bold hover:bg-[#fcd34d] transition flex items-center gap-1.5'
                                >
                                  <Crown className='w-3.5 h-3.5' />
                                  Activer
                                </Link>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected({ match, project });
                                  }}
                                  className='h-9 px-4 rounded-full bg-[#15181c] text-white text-xs font-bold hover:bg-[#2c3036] transition flex items-center gap-1.5'
                                >
                                  <Send className='w-3.5 h-3.5' />
                                  Répondre
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  ignore(match.id);
                                }}
                                className='h-9 w-9 rounded-full border border-[#ececec] bg-white text-[#6b7076] hover:bg-[#f4f1f7] hover:text-[#15181c] transition flex items-center justify-center'
                                aria-label='Ignorer'
                              >
                                <X className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cartes mobile */}
              <div className='lg:hidden p-5'>
                {sorted.length === 0 ? (
                  <div className='py-12 text-center'>
                    <div className='flex flex-col items-center gap-3 text-[#6b7076]'>
                      <div className='w-14 h-14 rounded-full bg-[#fff0f3] flex items-center justify-center text-[#15181c]'>
                        <FileText className='w-6 h-6' />
                      </div>
                      <p className='text-base font-semibold text-[#15181c]'>
                        Aucun appel d'offre reçu
                      </p>
                      <p className='text-sm'>
                        Revenez plus tard pour découvrir de nouvelles
                        opportunités.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    {paginated.map(({ match, project }) => (
                      <DossierCard
                        key={match.id}
                        match={match}
                        project={project}
                        subscriptionActive={subscriptionActive}
                        onView={() =>
                          router.push(
                            `/espace-prestataire/appels-offres/${match.id}`
                          )
                        }
                        onRespond={() => setSelected({ match, project })}
                        onIgnore={() => ignore(match.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2'>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className='w-10 h-10 rounded-2xl border border-[#ececec] bg-white flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-sm font-semibold transition ${
                        page === p
                          ? 'bg-[#15181c] text-white border-[#15181c]'
                          : 'bg-white text-[#6b7076] border-[#ececec] hover:bg-[#f4f1f7]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className='w-10 h-10 rounded-2xl border border-[#ececec] bg-white flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* 3 cartes smart home en bas */}
        <section className='mt-6 grid grid-cols-2 sm:grid-cols-3 gap-5'>
          <div
            onClick={() => router.push('/espace-prestataire/offres')}
            className='rounded-[20px] bg-[#f4f1f7] p-6 shadow-md flex flex-col justify-end h-[140px] cursor-pointer active:scale-[0.99] transition group'
          >
            <p className='text-xs text-[#6b7076] font-semibold uppercase tracking-wider'>
              {plan.status === 'active' ? 'Plan actif' : 'Plan inactif'}
            </p>
            <svg viewBox='0 0 160 36' className='w-full h-9 overflow-visible my-3'>
              <defs>
                <linearGradient id='propGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#15181c' stopOpacity='0.2' />
                  <stop offset='100%' stopColor='#15181c' stopOpacity='0' />
                </linearGradient>
              </defs>
              <path
                d='M 0 28 L 25 24 L 55 26 L 85 29 L 115 17 L 135 23 L 160 21'
                fill='url(#propGrad)'
                stroke='#15181c'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <div className='flex items-baseline gap-1.5'>
              <span className='text-lg font-bold text-[#15181c]'>{plan.name}</span>
              {plan.status !== 'active' && (
                <span className='text-xs font-semibold text-[#6b7076]'>({plan.status})</span>
              )}
            </div>
          </div>

          <div
            onClick={() => featured && setSelected({ match: featured.match, project: featured.project })}
            className='rounded-[20px] bg-[#cbd5e1] p-6 shadow-md flex flex-col items-center justify-end h-[140px] cursor-pointer active:scale-[0.99] transition group text-center'
          >
            <div className='w-11 h-11 rounded-full bg-white/60 flex items-center justify-center text-[#15181c] mb-2'>
              <Send className='w-5 h-5 stroke-[2]' />
            </div>
            <p className='text-xs text-[#15181c] font-semibold uppercase tracking-wider'>
              Réponse
            </p>
            <p className='text-base font-bold text-[#15181c]'>Répondre maintenant</p>
          </div>

          <div
            onClick={() => setPage(1)}
            className='col-span-2 sm:col-span-1 rounded-[20px] bg-[#fde68a] p-6 shadow-md flex flex-col justify-between h-[140px] cursor-pointer active:scale-[0.99] transition'
          >
            <p className='text-xs text-[#15181c] font-semibold uppercase tracking-wider'>
              Catégories
            </p>
            <div className='flex items-center justify-center gap-2 flex-wrap'>
              {sorted.length === 0 ? (
                <span className='text-xs font-semibold px-3 py-1.5 rounded-full bg-white/60 text-[#15181c]'>
                  Mariage
                </span>
              ) : (
                Array.from(new Set(sorted.map((o) => o.match.category))).slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className='text-xs font-semibold px-3 py-1.5 rounded-full bg-white/60 text-[#15181c]'
                  >
                    {cat}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Response Modal */}
        {selected && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
            <div
              className='absolute inset-0'
              onClick={() => setSelected(null)}
            />
            <div className='relative w-full max-w-lg bg-white border border-[#ececec] rounded-[20px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto'>
              <button
                onClick={() => setSelected(null)}
                className='absolute top-5 right-5 h-10 w-10 rounded-full bg-white border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#f4f1f7] transition'
                aria-label='Fermer'
              >
                <X size={18} />
              </button>

              <div className='flex items-center gap-3 mb-6'>
                <div className='w-14 h-14 rounded-2xl bg-[#fff0f3] flex items-center justify-center'>
                  <Send size={26} className='text-[#15181c]' />
                </div>
                <div>
                  <p className='text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider'>
                    Réponse
                  </p>
                  <h3 className='font-display text-2xl font-bold text-[#15181c]'>
                    Répondre à l'appel d'offres
                  </h3>
                </div>
              </div>

              <div className='mb-6 p-4 rounded-2xl bg-[#fff0f3] border border-[#ececec]'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='inline-flex items-center rounded-full bg-white text-[#15181c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em]'>
                    {selected.match.category}
                  </span>
                  <span className='text-sm text-[#6b7076]'>
                    Score : {selected.match.score}
                  </span>
                </div>
                <div className='text-sm text-[#6b7076]'>
                  Budget :{' '}
                  {selected.project?.budget?.amount?.toLocaleString('fr-FR') ||
                    '—'}{' '}
                  {selected.project?.budget?.currency || 'EUR'}
                </div>
              </div>

              <label className='block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2'>
                Votre message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Votre message de réponse...'
                className='w-full bg-white border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#cbd5e1] transition min-h-[120px] resize-none'
              />

              <div className='flex items-center justify-end mt-6'>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setSelected(null)}
                    className='py-3.5 px-5 rounded-full border-2 border-[#ececec] bg-white text-sm font-bold font-sans text-[#15181c] hover:bg-[#f4f1f7] transition'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={respond}
                    disabled={submitting || !message.trim()}
                    className='py-3.5 px-5 rounded-full bg-[#15181c] text-white font-bold font-sans hover:bg-[#2c3036] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {submitting ? (
                      <Loader2 size={16} className='animate-spin' />
                    ) : (
                      <Send size={16} />
                    )}
                    Envoyer
                  </button>
                </div>
              </div>

              {success && (
                <div className='mt-4 p-4 rounded-xl bg-[#fff0f3] border border-[#fff0f3]/20'>
                  <p className='text-sm text-[#15181c]'>
                    Proposition envoyée avec succès !
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DossierCard({
  match,
  project,
  subscriptionActive,
  onView,
  onRespond,
  onIgnore,
}: {
  match: ProjectVendorMatch;
  project: WeddingProject | null;
  subscriptionActive: boolean;
  onView: () => void;
  onRespond: () => void;
  onIgnore: () => void;
}) {
  return (
    <div className='rounded-[20px] bg-white border border-[#ececec] p-6 shadow-md hover:shadow-lg transition group'>
      <div className='flex items-start justify-between mb-5'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='inline-flex items-center rounded-full bg-[#fff0f3] text-[#15181c] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em]'>
            {match.category}
          </span>
          <div className='flex items-center gap-1 bg-[#fff0f3] px-2.5 py-1 rounded-full'>
            <Sparkles size={13} className='text-[#15181c]' />
            <span className='text-xs font-bold text-[#15181c]'>
              {match.score}
            </span>
          </div>
        </div>
        <button
          onClick={onIgnore}
          className='h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#f4f1f7] text-[#6b7076] transition'
        >
          <X size={16} />
        </button>
      </div>

      <div className='space-y-2.5 mb-6 text-sm text-[#6b7076]'>
        <div className='flex items-center gap-2.5'>
          <MapPin size={16} className='text-[#cbd5e1]' />
          {project?.location?.city || 'Lieu non précisé'}
        </div>
        <div className='flex items-center gap-2.5'>
          <Calendar size={16} className='text-[#cbd5e1]' />
          {project?.weddingDate
            ? new Date(project.weddingDate).toLocaleDateString('fr-FR')
            : 'Date non précisée'}
        </div>
        <div className='flex items-center gap-2.5'>
          <Users size={16} className='text-[#cbd5e1]' />
          {project?.guestCount || '—'} invités
        </div>
        <div className='flex items-center gap-2.5'>
          <Banknote size={16} className='text-[#cbd5e1]' />
          Budget {project?.budget?.amount?.toLocaleString('fr-FR') || '—'}{' '}
          {project?.budget?.currency || 'EUR'}
        </div>
      </div>

      <div className='flex gap-3'>
        <button
          onClick={onView}
          className='flex-1 py-3 px-4 rounded-full border border-[#ececec] bg-white text-sm font-bold text-[#15181c] hover:bg-[#f4f1f7] transition flex items-center justify-center gap-2'
        >
          {!subscriptionActive && <Lock size={14} />} Voir
        </button>
        {match.status === "contacted" ? (
          <span className='flex-1 py-3 px-4 rounded-full bg-[#e4f4ed] text-sm font-bold text-[#2e7d5e] flex items-center justify-center gap-2'>
            <Check size={16} /> Répondu
          </span>
        ) : subscriptionActive ? (
          <button
            onClick={onRespond}
            className='flex-1 py-3 px-4 rounded-full bg-[#15181c] text-sm font-bold text-white hover:bg-[#2c3036] transition flex items-center justify-center gap-2'
          >
            <Send size={16} /> Répondre
          </button>
        ) : (
          <Link
            href='/espace-prestataire/offres'
            className='flex-1 py-3 px-4 rounded-full bg-[#fde68a] text-[#15181c] text-sm font-bold hover:bg-[#fcd34d] transition flex items-center justify-center gap-2'
          >
            <Crown size={16} /> Activer
          </Link>
        )}
      </div>
    </div>
  );
}
