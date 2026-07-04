"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Check, Loader2, Pencil, Trash2, X } from "lucide-react";

interface Milestone {
  monthsBeforeWedding: number;
  title: string;
  tasks: string[];
}

interface Timeline {
  milestones: Milestone[];
}

export default function CouplePlanningPage() {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState("");
  const [newMonths, setNewMonths] = useState("6");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMonths, setEditMonths] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          const aiTimeline = resultData.session?.aiOutput?.timeline ?? resultData.project?.aiOutput?.timeline ?? null;
          setTimeline(aiTimeline);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function addTask() {
    if (!project || !newTask.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/couple/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, title: newTask, monthsBeforeWedding: Number(newMonths) }),
      });
      const json = await res.json();
      if (res.ok) {
        setTasks((prev) => [...prev, json.task]);
        setNewTask("");
      }
    } finally {
      setAdding(false);
    }
  }

  async function addSuggestedTask(title: string, monthsBeforeWedding: number) {
    if (!project) return;
    const res = await fetch("/api/couple/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, title, monthsBeforeWedding }),
    });
    const json = await res.json();
    if (res.ok) setTasks((prev) => [...prev, json.task]);
  }

  async function toggleTask(id: string, completed: boolean) {
    const res = await fetch("/api/couple/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
    if (res.ok) setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/couple/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle, monthsBeforeWedding: Number(editMonths) }),
      });
      const json = await res.json();
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === id ? json.task : t)));
        setEditingId(null);
      }
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteTask(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch("/api/couple/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(task: any) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditMonths(String(task.monthsBeforeWedding));
  }

  const taskList = tasks || [];
  const sorted = taskList.slice().sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);
  const done = sorted.filter((t) => t.completed).length;

  const aiSuggestions = timeline?.milestones?.length
    ? timeline.milestones.flatMap((m) => m.tasks.map((title) => ({ title, monthsBeforeWedding: m.monthsBeforeWedding })))
    : [];

  const suggestedTasks = aiSuggestions.filter(
    (s) => !taskList.some((t) => t.title.toLowerCase().trim() === s.title.toLowerCase().trim())
  );

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="h-px w-5 bg-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Organisation</p>
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
          <span className="text-5xl font-bold text-primary leading-none mr-0.5">M</span>on planning
        </h1>
        <p className="mt-2 text-text-secondary italic max-w-md">
          Suivez les étapes proposées par l'IA ou composez votre propre feuille de route. Vous gardez la main.
        </p>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center gap-3 mb-10">
          <div className="h-1 flex-1 rounded-full bg-black/[0.06] overflow-hidden">
            <div className="h-full bg-success rounded-full transition-[width]" style={{ width: `${(done / sorted.length) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-secondary shrink-0">{done}/{sorted.length} faites</span>
        </div>
      )}

      {/* Add form */}
      <div className="rounded-2xl bg-white border border-black/[0.06] px-6 sm:px-8 py-6 mb-8 shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
        <div className="relative flex flex-col sm:flex-row gap-3">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nom de l'étape..."
            className="flex-1 bg-transparent border-0 border-b border-primary/30 text-text-primary text-lg py-2 pr-2 focus:outline-none focus:border-primary placeholder:text-text-secondary/50 transition-colors"
          />
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="number"
                value={newMonths}
                onChange={(e) => setNewMonths(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Mois"
                className="w-24 bg-transparent border-0 border-b border-primary/30 text-text-primary text-lg py-2 pr-6 focus:outline-none focus:border-primary text-center transition-colors"
              />
              <span className="absolute right-0 top-3 text-xs text-text-secondary">M</span>
            </div>
            <Button
              variant="primary"
              onClick={addTask}
              disabled={adding || !newTask.trim()}
              iconLeft={adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestedTasks.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="h-px w-5 bg-primary" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Suggestions de l'IA</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.06] px-6 py-5 shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
            <div className="relative flex flex-wrap gap-2">
              {suggestedTasks.map((s, i) => (
                <button
                  key={i}
                  onClick={() => addSuggestedTask(s.title, s.monthsBeforeWedding)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-sm text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
                >
                  <Plus size={14} /> {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white border border-black/[0.06] px-8 py-12 text-center shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
            <Plus size={24} className="text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-2">Aucune étape pour le moment</h2>
          <p className="text-text-secondary max-w-md mx-auto text-sm leading-relaxed">
            Ajoutez vos propres étapes ci-dessus ou sélectionnez les suggestions proposées par l'IA.
          </p>
        </div>
      ) : (
        <div className="relative pl-9">
          <span className="absolute left-2 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-primary to-primary/10" />

          <div className="space-y-4">
            {sorted.map((t) => (
              <div key={t.id} className="relative">
                <span className="absolute -left-[26px] top-4 h-2 w-2 rounded-full bg-primary ring-4 ring-white" />
                <div className="rounded-2xl bg-white border border-black/[0.06] px-5 py-4 shadow-[0_8px_24px_rgba(11,15,26,0.04)]">

                  {editingId === t.id ? (
                    <div className="relative flex flex-col sm:flex-row gap-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(t.id)}
                        className="flex-1 bg-transparent border-0 border-b border-primary/30 text-text-primary text-base py-1 focus:outline-none focus:border-primary transition-colors"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={editMonths}
                          onChange={(e) => setEditMonths(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(t.id)}
                          className="w-20 bg-transparent border-0 border-b border-primary/30 text-text-primary text-base py-1 text-center focus:outline-none focus:border-primary transition-colors"
                        />
                        <Button
                          variant="primary"
                          onClick={() => saveEdit(t.id)}
                          disabled={savingEdit || !editTitle.trim()}
                          iconLeft={savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        />
                        <Button variant="secondary" onClick={() => setEditingId(null)} iconLeft={<X size={14} />} />
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-4">
                      <button
                        onClick={() => toggleTask(t.id, !t.completed)}
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          t.completed ? "bg-success border-success text-white" : "border-black/20 text-transparent hover:border-primary"
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${t.completed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                          {t.title}
                        </span>
                        <span className="block text-[11px] text-text-secondary mt-0.5">
                          M-{t.monthsBeforeWedding}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(t)}
                          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          disabled={deletingId === t.id}
                          className="p-2 text-text-secondary hover:text-error transition-colors"
                        >
                          {deletingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
