"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/couple/PageHeader";
import {
  Check,
  Clock,
  Loader2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Search,
  ListChecks,
  Target,
  CalendarPlus,
  Sparkles,
} from "lucide-react";
import type { WeddingProject, TimelineTask } from "@/types/marketplace";

interface Milestone {
  monthsBeforeWedding: number;
  title: string;
  tasks: string[];
}

interface Timeline {
  milestones: Milestone[];
}

type PlanningTask = TimelineTask & { dueDate?: string };

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const TASK_COLORS = [
  { bg: "#dff05a", text: "#1c1c1c" },      // jaune DA
  { bg: "#dbeafe", text: "#1e3a8a" },      // bleu
  { bg: "#dcfce7", text: "#14532d" },      // vert
  { bg: "#fce7f3", text: "#831843" },      // rose
  { bg: "#ffedd5", text: "#7c2d12" },      // orange
  { bg: "#ede9fe", text: "#4c1d95" },      // violet
  { bg: "#cffafe", text: "#164e63" },      // cyan
  { bg: "#fef3c7", text: "#78350f" },      // ambre
  { bg: "#f3e8ff", text: "#581c87" },      // lavande
  { bg: "#d1fae5", text: "#064e3b" },      // menthe
];

function getTaskColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return TASK_COLORS[Math.abs(hash) % TASK_COLORS.length];
}

export default function CouplePlanningPage() {
  const router = useRouter();
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlanningTask | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", monthsBeforeWedding: 12, dueDate: "" });
  const [saving, setSaving] = useState(false);

  // Calendar view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [projectRes, tasksRes, resultRes] = await Promise.all([
          fetch("/api/couple/project"),
          fetch("/api/couple/tasks"),
          fetch("/api/couple/result"),
        ]);
        if (projectRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const projectData = (await projectRes.json()).project;
        setProject(projectData);
        const existingTasks = (await tasksRes.json()).tasks || [];
        setTasks(existingTasks);
        if (resultRes.ok) {
          const resultData = await resultRes.json();
          const aiTimeline =
            resultData.session?.aiOutput?.timeline ??
            resultData.project?.aiOutput?.timeline ??
            null;
          setTimeline(aiTimeline);

          if (existingTasks.length === 0 && aiTimeline?.milestones?.length) {
            const toImport = aiTimeline.milestones.flatMap((m: Milestone) =>
              m.tasks.map((title: string) => ({
                projectId: projectData.id,
                title,
                monthsBeforeWedding: m.monthsBeforeWedding,
              }))
            );
            const imported: PlanningTask[] = [];
            for (const t of toImport) {
              const res = await fetch("/api/couple/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(t),
              });
              const json = await res.json();
              if (res.ok) imported.push(json.task as PlanningTask);
            }
            setTasks(imported);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function toggleTask(id: string, completed: boolean) {
    const res = await fetch("/api/couple/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
    if (res.ok) setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  }

  async function saveTask() {
    if (!taskForm.title.trim() || !project) return;
    setSaving(true);
    try {
      if (selectedTask) {
        const res = await fetch("/api/couple/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedTask.id, title: taskForm.title, monthsBeforeWedding: taskForm.monthsBeforeWedding }),
        });
        const json = await res.json();
        if (res.ok) {
          setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? json.task : t)));
        }
      } else {
        const res = await fetch("/api/couple/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            title: taskForm.title,
            monthsBeforeWedding: taskForm.monthsBeforeWedding,
          }),
        });
        const json = await res.json();
        if (res.ok) setTasks((prev) => [...prev, json.task]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(id: string) {
    const res = await fetch("/api/couple/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      closeModal();
    }
  }

  function openNewTask() {
    setSelectedTask(null);
    setTaskForm({ title: "", monthsBeforeWedding: 12, dueDate: "" });
    setShowTaskModal(true);
  }

  function openEditTask(task: PlanningTask) {
    setSelectedTask(task);
    setTaskForm({ title: task.title, monthsBeforeWedding: task.monthsBeforeWedding, dueDate: task.dueDate || "" });
    setShowTaskModal(true);
  }

  function closeModal() {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskForm({ title: "", monthsBeforeWedding: 12, dueDate: "" });
  }

  // Derived data
  const sorted = useMemo(
    () => tasks.slice().sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding),
    [tasks]
  );
  const done = sorted.filter((t) => t.completed).length;
  const total = sorted.length;

  // Group tasks by milestone month
  const byMonth = useMemo(() => {
    const map = new Map<number, typeof sorted>();
    for (const t of sorted) {
      const m = t.monthsBeforeWedding;
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [sorted]);

  // Stats
  const weddingDate = project?.weddingDate ? new Date(project.weddingDate) : null;
  const monthsLeft = weddingDate
    ? Math.max(0, Math.round((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
    : null;

  // Month name
  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long" });
  const year = currentDate.getFullYear();

  function navigate(dir: number) {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + dir);
    setCurrentDate(newDate);
  }

  // Filtered tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((t) => t.title.toLowerCase().includes(q));
  }, [sorted, searchQuery]);

  // Calendar month days
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay() || 7; // 1 = Monday
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];
    // Previous month padding
    for (let i = startDayOfWeek - 1; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Next month padding to fill 42 cells (6 weeks)
    while (days.length < 42) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    return days;
  }, [currentDate]);

  function getTaskTargetDate(task: PlanningTask, weddingDate: Date) {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const target = new Date(weddingDate);
    target.setMonth(target.getMonth() - task.monthsBeforeWedding);
    target.setDate(1);
    target.setHours(0, 0, 0, 0);
    return target;
  }

  // Tasks for a calendar day
  const tasksForDay = (day: Date) => {
    const weddingDate = project?.weddingDate ? new Date(project.weddingDate) : null;
    if (!weddingDate) return [];
    const projectStart = project?.createdAt ? new Date(project.createdAt) : null;
    const projectStartMonth = projectStart ? new Date(projectStart.getFullYear(), projectStart.getMonth(), 1) : null;
    const check = new Date(day);
    check.setHours(0, 0, 0, 0);
    return sorted.filter((t) => {
      const target = getTaskTargetDate(t, weddingDate);
      // masquer les tâches du plan antérieures au mois de création du compte
      if (projectStartMonth && target < projectStartMonth) return false;
      return target.getTime() === check.getTime();
    });
  };

  if (loading) return <div className="min-h-[80dvh] bg-surface" />;

  return (
    <div className="min-h-[100dvh] bg-surface">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        <PageHeader eyebrow="Organisation" title="Mon planning">
          <button
            onClick={openNewTask}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            <Plus size={15} strokeWidth={2} /> Nouvelle étape
          </button>
        </PageHeader>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des tâches, étapes..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
            />
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dff05a] flex items-center justify-center">
              <Calendar size={20} className="text-[#1c1c1c]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1c1c1c] text-lg">Calendrier</h2>
              <p className="text-xs text-[#8b8b86]">Vue mensuelle de vos étapes</p>
            </div>
          </div>

          {/* Navigation mois */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="w-8 h-8 rounded-lg border border-[#e6e4dd] bg-white flex items-center justify-center text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 bg-white border border-[#e6e4dd] rounded-lg text-[13px] font-semibold text-[#1c1c1c] min-w-[160px] text-center capitalize">
              {monthName} {year}
            </div>
            <button 
              onClick={() => navigate(1)} 
              className="w-8 h-8 rounded-lg border border-[#e6e4dd] bg-white flex items-center justify-center text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Grand Calendrier */}
          <div className="flex-1">
            {searchQuery.trim() ? (
              // Si recherche active, affiche les résultats filtrés
              <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
                <h3 className="font-bold text-[#1c1c1c] mb-4">
                  Résultats de recherche ({filteredTasks.length})
                </h3>
                {filteredTasks.length === 0 ? (
                  <p className="text-[#8b8b86]">Aucune étape ne correspond à votre recherche.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f1f0eb] transition cursor-pointer"
                        onClick={() => openEditTask(task)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id, !task.completed);
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                            task.completed ? "bg-[#dff05a] border-[#dff05a]" : "border-[#8b8b86]"
                          }`}
                        >
                          {task.completed && <Check size={12} className="text-[#1c1c1c]" />}
                        </button>
                        <span className={`flex-1 text-sm ${task.completed ? "line-through text-[#8b8b86]" : "text-[#1c1c1c]"}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Grand calendrier par mois
              <div className="bg-white rounded-2xl border border-[#e6e4dd] overflow-hidden">
                {/* Calendar header */}
                <div className="grid grid-cols-7 border-b border-[#e6e4dd]">
                  {DAYS_SHORT.map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-[#8b8b86] uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 auto-rows-fr">
                  {monthDays.map((day, idx) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayTasks = tasksForDay(day);

                    return (
                      <div
                        key={idx}
                        className={`min-h-[120px] sm:min-h-[140px] p-2 border-b border-r border-[#e6e4dd] relative ${
                          isCurrentMonth ? "bg-white" : "bg-[#f1f0eb]/50"
                        } ${isToday ? "ring-2 ring-inset ring-[#dff05a]" : ""}`}
                      >
                        <div className={`text-xs font-medium mb-1 ${isToday ? "text-[#1c1c1c]" : "text-[#8b8b86]"}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map((task) => {
                            const color = task.completed
                              ? { bg: "#f1f0eb", text: "#8b8b86" }
                              : getTaskColor(task.id || task.title);
                            return (
                              <button
                                key={task.id}
                                onClick={() => openEditTask(task)}
                                className="w-full text-left px-2 py-1 rounded-lg text-[10px] font-medium leading-tight transition hover:opacity-80 truncate"
                                style={{
                                  backgroundColor: color.bg,
                                  color: color.text,
                                  textDecoration: task.completed ? "line-through" : "none",
                                }}
                              >
                                {task.title.slice(0, 20)}
                                {task.title.length > 20 ? "..." : ""}
                              </button>
                            );
                          })}
                          {dayTasks.length > 3 && (
                            <div className="text-[9px] text-[#8b8b86] pl-2">
                              +{dayTasks.length - 3} autres
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - visible sur mobile aussi */}
          <div className="w-full lg:w-72 space-y-6">
            {/* This Week Stats */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <h4 className="text-sm font-bold text-[#1c1c1c] mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-[#1c1c1c]" />
                Cette semaine
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#dff05a] rounded-lg">
                      <ListChecks size={16} className="text-[#1c1c1c]" />
                    </div>
                    <span className="text-sm text-[#1c1c1c]">Complétées</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1c1c1c]">{done}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#dff05a] rounded-lg">
                      <Target size={16} className="text-[#1c1c1c]" />
                    </div>
                    <span className="text-sm text-[#1c1c1c]">Restantes</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1c1c1c]">{total - done}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#dff05a] rounded-lg">
                      <Clock size={16} className="text-[#1c1c1c]" />
                    </div>
                    <span className="text-sm text-[#1c1c1c]">Mois restants</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1c1c1c]">{monthsLeft ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Upcoming milestones */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <h4 className="text-sm font-bold text-[#1c1c1c] mb-4">Prochaines étapes</h4>
              <div className="space-y-3">
                {byMonth.slice(0, 3).map(([month, monthTasks]) => {
                  const completedCount = monthTasks.filter((t) => t.completed).length;
                  const milestoneTitle = timeline?.milestones?.find((m) => m.monthsBeforeWedding === month)?.title;
                  return (
                    <div
                      key={month}
                      className="p-3 bg-[#f1f0eb] rounded-xl cursor-pointer hover:bg-[#e6e4dd] transition"
                      onClick={() => openEditTask(monthTasks[0])}
                    >
                      <div className="text-[13px] font-bold text-[#1c1c1c] mb-1">
                        {milestoneTitle || `M-${month}`}
                      </div>
                      <div className="text-[11px] text-[#8b8b86]">
                        {completedCount}/{monthTasks.length} tâches
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <h4 className="text-sm font-bold text-[#1c1c1c] mb-4">Actions rapides</h4>
              <div className="space-y-2">
                <button
                  onClick={openNewTask}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f1f0eb] transition text-left"
                >
                  <div className="p-2 bg-[#dff05a] rounded-lg">
                    <CalendarPlus size={16} className="text-[#1c1c1c]" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Planifier une étape</span>
                </button>
                <button
                  onClick={openNewTask}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f1f0eb] transition text-left"
                >
                  <div className="p-2 bg-[#dff05a] rounded-lg">
                    <Plus size={16} className="text-[#1c1c1c]" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Créer une tâche</span>
                </button>
              </div>
            </div>

            {/* Progress - Jaune DA sans gradient */}
            <div className="bg-[#dff05a] rounded-2xl p-6">
              <h4 className="text-sm font-bold text-[#1c1c1c] mb-3">Progression globale</h4>
              <div className="text-3xl font-bold text-[#1c1c1c] mb-1">
                {total > 0 ? Math.round((done / total) * 100) : 0}%
              </div>
              <div className="text-sm text-[#1c1c1c]/70 mb-3">de votre planning complété</div>
              <div className="h-2 bg-[#1c1c1c]/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1c1c1c] rounded-full transition-all"
                  style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-[#1c1c1c]/60 mt-2">
                {done} sur {total} tâches
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Style témoin */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#f3f2ee] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#dff05a] flex items-center justify-center">
                <Calendar size={20} className="text-[#1c1c1c]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#1c1c1c]">
                  {selectedTask ? "Modifier l&apos;étape" : "Nouvelle étape"}
                </h2>
                <p className="text-[#8b8b86] text-sm">Planifiez votre mariage</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Titre de l&apos;étape *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ex: Réserver le lieu de réception"
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Mois avant le mariage
                </label>
                <select
                  value={taskForm.monthsBeforeWedding}
                  onChange={(e) => setTaskForm({ ...taskForm, monthsBeforeWedding: Number(e.target.value) })}
                  className="w-full appearance-none bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a] cursor-pointer"
                >
                  {[...Array(25)].map((_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? "Jour J" : `M-${i}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTask && (
                <div className="flex items-center gap-3 p-3 bg-white border border-[#e4e2db] rounded-xl">
                  <button
                    onClick={() => toggleTask(selectedTask.id, !selectedTask.completed)}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      selectedTask.completed ? "bg-[#dff05a] border-[#dff05a]" : "border-[#8b8b86]"
                    }`}
                  >
                    {selectedTask.completed && <Check size={10} className="text-[#1c1c1c]" />}
                  </button>
                  <span className="text-[13px] text-[#1c1c1c]">
                    {selectedTask.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                  </span>
                </div>
              )}

              {selectedTask && (
                <button
                  onClick={() => deleteTask(selectedTask.id)}
                  className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 rounded-xl py-3 font-semibold text-[14px] hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                  Supprimer cette étape
                </button>
              )}

              <button
                onClick={saveTask}
                disabled={saving || !taskForm.title.trim()}
                className="w-full bg-[#1c1c1c] text-white rounded-xl py-3 font-semibold text-[14px] hover:bg-[#333] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {selectedTask ? "Mettre à jour" : "Créer l&apos;étape"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
