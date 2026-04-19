import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi, eventsApi, staffApi, ApiError } from '@/lib/api';
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Clock,
  AlertTriangle, Ban, ChevronDown, ChevronRight, MessageSquare,
  ExternalLink, Send, User, CalendarDays, X, Pencil, Save,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  PREPARATION: 'Preparation',
  EXECUTION: 'Execution',
  POST_EVENT: 'Post-Event',
};

const PHASE_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-50 text-blue-700 border-blue-200',
  PREPARATION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  EXECUTION: 'bg-purple-50 text-purple-700 border-purple-200',
  POST_EVENT: 'bg-teal-50 text-teal-700 border-teal-200',
};

const PHASE_BAR_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-500',
  PREPARATION: 'bg-yellow-500',
  EXECUTION: 'bg-purple-500',
  POST_EVENT: 'bg-teal-500',
};

const STATUS_ICONS: Record<string, typeof Circle> = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  BLOCKED: AlertTriangle,
  CANCELLED: Ban,
};

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'text-gray-400',
  IN_PROGRESS: 'text-blue-500',
  COMPLETED: 'text-green-500',
  BLOCKED: 'text-red-500',
  CANCELLED: 'text-gray-300',
};

const STATUS_BG: Record<string, string> = {
  NOT_STARTED: '',
  IN_PROGRESS: 'bg-blue-50/50 border-l-4 border-l-blue-400',
  COMPLETED: 'bg-green-50/40 border-l-4 border-l-green-400',
  BLOCKED: 'bg-red-50/40 border-l-4 border-l-red-400',
  CANCELLED: 'bg-gray-50/60 border-l-4 border-l-gray-300',
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'] as const;
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  CANCELLED: 'Cancelled',
};

// ── Types ────────────────────────────────────────────────────────────────────

interface ChecklistComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  linkUrl: string | null;
  linkLabel: string | null;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  assignedToName: string | null;
  dueDate: string | null;
  completedAt: string | null;
  notes: string | null;
  orderIndex: number;
  comments: ChecklistComment[];
}

interface Checklist {
  id: string;
  title: string;
  description: string | null;
  items: ChecklistItem[];
  createdAt: string;
}

// ── Staff Autocomplete ───────────────────────────────────────────────────────

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

function StaffAutocomplete({
  value,
  onChange,
  placeholder = 'Search staff...',
}: {
  value: string;
  onChange: (name: string, id: string | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<StaffUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await staffApi.search(term) as any;
        setResults(res.data ?? []);
        setOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 250);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v, null);
    doSearch(v);
  };

  const handleSelect = (u: StaffUser) => {
    const name = `${u.firstName} ${u.lastName}`;
    setQuery(name);
    onChange(name, u.id);
    setOpen(false);
  };

  const roleLabel = (r: string) => {
    if (r === 'EVENT_ORGANIZER') return 'Facilitator';
    if (r === 'PROGRAM_MANAGER') return 'Technical Staff';
    if (r === 'DIVISION_CHIEF') return 'Div. Chief';
    if (r === 'REGIONAL_DIRECTOR') return 'Regional Dir.';
    if (r === 'PROVINCIAL_DIRECTOR') return 'Provincial Dir.';
    if (r === 'SYSTEM_ADMIN') return 'Sys Admin';
    if (r === 'SUPER_ADMIN') return 'Super Admin';
    return r;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => { if (query.trim()) doSearch(query); }}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">...</div>}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map(u => (
            <li
              key={u.id}
              onClick={() => handleSelect(u)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</span>
                <span className="text-xs text-gray-400 ml-1.5">{u.email}</span>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">{roleLabel(u.role)}</span>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !loading && query.trim() && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400">
          No staff members found
        </div>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function OrganizerChecklistPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('Event Checklist');
  const [useTemplate, setUseTemplate] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', phase: 'PLANNING', priority: 'MEDIUM', assignedToName: '', assignedTo: '' as string | null, dueDate: '' });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentLink, setCommentLink] = useState('');
  const [commentLinkLabel, setCommentLinkLabel] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', phase: 'PLANNING', priority: 'MEDIUM', assignedToName: '', assignedTo: '' as string | null, dueDate: '', notes: '', description: '' });

  const { data: eventData } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.get(eventId!),
    enabled: Boolean(eventId),
  });

  const { data: checklistsData, isLoading } = useQuery({
    queryKey: ['checklists', eventId],
    queryFn: () => checklistApi.getChecklists(eventId!),
    enabled: Boolean(eventId),
  });

  const event = (eventData as any)?.data;
  const checklists: Checklist[] = ((checklistsData as any)?.data ?? []);
  const checklist = checklists[0];

  const createMut = useMutation({
    mutationFn: () => checklistApi.createChecklist(eventId!, { title: newTitle, useTemplate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
      setCreating(false);
      setMsg('Checklist created.');
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to create checklist.'),
  });

  const updateItemMut = useMutation({
    mutationFn: ({ checklistId, itemId, data }: { checklistId: string; itemId: string; data: Record<string, unknown> }) =>
      checklistApi.updateItem(checklistId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to update item.'),
  });

  const addItemMut = useMutation({
    mutationFn: () => checklistApi.addItem(checklist.id, {
      title: newItem.title,
      phase: newItem.phase,
      priority: newItem.priority,
      assignedToName: newItem.assignedToName || null,
      assignedTo: newItem.assignedTo || null,
      dueDate: newItem.dueDate ? new Date(newItem.dueDate).toISOString() : null,
      orderIndex: checklist.items.length,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
      setNewItem({ title: '', phase: 'PLANNING', priority: 'MEDIUM', assignedToName: '', assignedTo: null, dueDate: '' });
      setShowAddItem(false);
      setMsg('Task added.');
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to add task.'),
  });

  const deleteItemMut = useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: string; itemId: string }) =>
      checklistApi.deleteItem(checklistId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
      setMsg('Task removed.');
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to delete task.'),
  });

  const addCommentMut = useMutation({
    mutationFn: ({ itemId }: { itemId: string }) =>
      checklistApi.addComment(checklist.id, itemId, {
        content: commentText,
        linkUrl: commentLink || null,
        linkLabel: commentLinkLabel || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
      setCommentText('');
      setCommentLink('');
      setCommentLinkLabel('');
      setShowLinkInput(false);
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to add comment.'),
  });

  const deleteCommentMut = useMutation({
    mutationFn: ({ itemId, commentId }: { itemId: string; commentId: string }) =>
      checklistApi.deleteComment(checklist.id, itemId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklists', eventId] });
    },
    onError: (err) => setMsg(err instanceof ApiError ? err.message : 'Failed to delete comment.'),
  });

  const togglePhase = (phase: string) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title,
      phase: item.phase,
      priority: item.priority,
      assignedToName: item.assignedToName ?? '',
      assignedTo: item.assignedTo ?? null,
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      notes: item.notes ?? '',
      description: item.description ?? '',
    });
  };

  const saveEdit = (item: ChecklistItem) => {
    const data: Record<string, unknown> = {};
    if (editForm.title !== item.title) data.title = editForm.title;
    if (editForm.phase !== item.phase) data.phase = editForm.phase;
    if (editForm.priority !== item.priority) data.priority = editForm.priority;
    if ((editForm.assignedToName || null) !== (item.assignedToName || null)) {
      data.assignedToName = editForm.assignedToName || null;
      data.assignedTo = editForm.assignedTo || null;
    }
    if ((editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null) !== (item.dueDate || null)) data.dueDate = editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null;
    if ((editForm.notes || null) !== (item.notes || null)) data.notes = editForm.notes || null;
    if ((editForm.description || null) !== (item.description || null)) data.description = editForm.description || null;

    if (Object.keys(data).length > 0) {
      updateItemMut.mutate({ checklistId: checklist.id, itemId: item.id, data });
      setMsg('Task updated.');
    }
    setEditingItem(null);
  };

  // Group items by phase
  const itemsByPhase: Record<string, ChecklistItem[]> = {
    PLANNING: [],
    PREPARATION: [],
    EXECUTION: [],
    POST_EVENT: [],
  };
  if (checklist) {
    for (const item of checklist.items) {
      (itemsByPhase[item.phase] ?? []).push(item);
    }
  }

  // Progress summary
  const totalItems = checklist?.items.length ?? 0;
  const completedItems = checklist?.items.filter(i => i.status === 'COMPLETED').length ?? 0;
  const inProgressItems = checklist?.items.filter(i => i.status === 'IN_PROGRESS').length ?? 0;
  const blockedItems = checklist?.items.filter(i => i.status === 'BLOCKED').length ?? 0;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (isLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading checklist…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to={`/organizer/events/${eventId}`} className="text-gray-500 hover:text-gray-700 mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Event Checklist</h1>
            <p className="text-sm text-gray-500 mt-0.5">{event?.title ?? 'Loading…'}</p>
          </div>
        </div>
        <Link
          to={`/organizer/events/${eventId}/checklist-print`}
          className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
        >
          <ExternalLink size={14} /> Print FM-CT-7
        </Link>
      </div>

      {msg && (
        <div className={`text-sm rounded-lg px-4 py-3 flex items-center justify-between ${msg.startsWith('Failed') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-xs opacity-60 hover:opacity-100 ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* No checklist yet — create one */}
      {!checklist && !creating && (
        <div className="card text-center py-12">
          <div className="text-gray-300 mb-4">
            <ClipboardIcon className="mx-auto w-16 h-16" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No Checklist Yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Create a checklist to track tasks across all phases of your event — from planning to post-event reporting.
          </p>
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={16} /> Create Checklist
          </button>
        </div>
      )}

      {creating && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Create Event Checklist</h2>
          <div>
            <label className="label">Checklist Title</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={useTemplate} onChange={e => setUseTemplate(e.target.checked)} className="rounded" />
            Pre-populate with standard DTI event preparation items (27 tasks)
          </label>
          <div className="flex gap-2">
            <button onClick={() => createMut.mutate()} disabled={createMut.isPending || !newTitle} className="btn-primary text-sm">
              {createMut.isPending ? 'Creating…' : 'Create Checklist'}
            </button>
            <button onClick={() => setCreating(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Checklist content */}
      {checklist && (
        <>
          {/* Progress overview card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-lg">{checklist.title}</h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{progressPct}%</span>
                <p className="text-xs text-gray-500">{completedItems}/{totalItems} tasks done</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-green-500' : progressPct >= 60 ? 'bg-blue-500' : progressPct >= 30 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Status summary chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {inProgressItems > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  <Clock size={12} /> {inProgressItems} In Progress
                </span>
              )}
              {blockedItems > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium">
                  <AlertTriangle size={12} /> {blockedItems} Blocked
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                <CheckCircle2 size={12} /> {completedItems} Done
              </span>
            </div>

            {/* Phase progress bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(itemsByPhase).map(([phase, items]) => {
                const done = items.filter(i => i.status === 'COMPLETED').length;
                const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
                return (
                  <div key={phase} className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">{PHASE_LABELS[phase]}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${PHASE_BAR_COLORS[phase]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{done}/{items.length}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Task button */}
          <div className="flex justify-end">
            <button onClick={() => { setShowAddItem(s => !s); setMsg(''); }} className="btn-primary text-sm">
              <Plus size={14} /> Add Task
            </button>
          </div>

          {/* Add Task form */}
          {showAddItem && (
            <div className="card border-2 border-dashed border-blue-300 bg-blue-50/30 space-y-3">
              <p className="text-sm font-semibold text-blue-800">New Task</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Task title *"
                  value={newItem.title}
                  onChange={e => setNewItem(s => ({ ...s, title: e.target.value }))}
                  className="input sm:col-span-2"
                />
                <div>
                  <label className="label">Phase</label>
                  <select value={newItem.phase} onChange={e => setNewItem(s => ({ ...s, phase: e.target.value }))} className="input">
                    {Object.entries(PHASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={newItem.priority} onChange={e => setNewItem(s => ({ ...s, priority: e.target.value }))} className="input">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Assigned To (Staff)</label>
                  <StaffAutocomplete
                    value={newItem.assignedToName}
                    onChange={(name, id) => setNewItem(s => ({ ...s, assignedToName: name, assignedTo: id ?? s.assignedTo }))}
                    placeholder="Search staff..."
                  />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={newItem.dueDate}
                    onChange={e => setNewItem(s => ({ ...s, dueDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => addItemMut.mutate()}
                  disabled={addItemMut.isPending || !newItem.title}
                  className="btn-primary text-sm"
                >
                  {addItemMut.isPending ? 'Adding…' : 'Add Task'}
                </button>
                <button onClick={() => setShowAddItem(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}

          {/* Items grouped by phase */}
          {Object.entries(itemsByPhase).map(([phase, items]) => {
            const done = items.filter(i => i.status === 'COMPLETED').length;
            return (
              <div key={phase} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Phase header */}
                <button
                  onClick={() => togglePhase(phase)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 ${PHASE_COLORS[phase]} transition-colors hover:opacity-90`}
                >
                  <div className="flex items-center gap-2.5">
                    {collapsedPhases.has(phase) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <h3 className="font-bold text-sm">{PHASE_LABELS[phase]}</h3>
                  </div>
                  <span className="text-xs font-semibold opacity-80">{done}/{items.length} done</span>
                </button>

                {/* Items list */}
                {!collapsedPhases.has(phase) && (
                  <ul className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                      <li className="px-5 py-6 text-sm text-gray-400 text-center italic">No tasks in this phase yet.</li>
                    ) : (
                      items.map((item) => {
                        const StatusIcon = STATUS_ICONS[item.status] ?? Circle;
                        const isExpanded = expandedItem === item.id;
                        const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED' && item.status !== 'CANCELLED';
                        const commentCount = item.comments?.length ?? 0;

                        return (
                          <li key={item.id} className={`${STATUS_BG[item.status] ?? ''}`}>
                            {/* Edit mode */}
                            {editingItem === item.id ? (
                              <div className="px-5 py-4 space-y-3 bg-blue-50/30 border-l-4 border-l-blue-400">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="label">Title *</label>
                                    <input
                                      value={editForm.title}
                                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                      className="input"
                                    />
                                  </div>
                                  <div>
                                    <label className="label">Phase</label>
                                    <select value={editForm.phase} onChange={e => setEditForm(f => ({ ...f, phase: e.target.value }))} className="input">
                                      {Object.entries(PHASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="label">Priority</label>
                                    <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="input">
                                      <option value="LOW">Low</option>
                                      <option value="MEDIUM">Medium</option>
                                      <option value="HIGH">High</option>
                                      <option value="CRITICAL">Critical</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="label">Assigned To (Staff)</label>
                                    <StaffAutocomplete
                                      value={editForm.assignedToName}
                                      onChange={(name, id) => setEditForm(f => ({ ...f, assignedToName: name, assignedTo: id ?? f.assignedTo }))}
                                      placeholder="Search staff..."
                                    />
                                  </div>
                                  <div>
                                    <label className="label">Due Date</label>
                                    <input
                                      type="date"
                                      value={editForm.dueDate}
                                      onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))}
                                      className="input"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="label">Notes</label>
                                    <textarea
                                      value={editForm.notes}
                                      onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                      placeholder="Additional notes…"
                                      className="input min-h-[60px]"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => saveEdit(item)}
                                    disabled={!editForm.title.trim()}
                                    className="btn-primary text-sm inline-flex items-center gap-1.5"
                                  >
                                    <Save size={14} /> Save Changes
                                  </button>
                                  <button onClick={() => setEditingItem(null)} className="btn-secondary text-sm">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                            <>
                            {/* Main row */}
                            <div className="px-5 py-3.5 flex items-start gap-3">
                              {/* Status toggle button */}
                              <button
                                onClick={() => {
                                  const nextStatus = item.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
                                  updateItemMut.mutate({ checklistId: checklist.id, itemId: item.id, data: { status: nextStatus } });
                                }}
                                className={`mt-0.5 ${STATUS_COLORS[item.status]} hover:scale-110 transition-all shrink-0`}
                                title={item.status === 'COMPLETED' ? 'Mark as not started' : 'Mark as completed'}
                              >
                                <StatusIcon size={22} />
                              </button>

                              {/* Task details */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium leading-snug ${item.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {item.title}
                                </p>

                                {/* Meta row: priority, assignee, due date */}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${PRIORITY_BADGES[item.priority]}`}>
                                    {item.priority}
                                  </span>

                                  {item.assignedToName ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                      <User size={11} className="text-gray-500" />
                                      {item.assignedToName}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => startEditing(item)}
                                      className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-dashed border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                                      title="Click to assign"
                                    >
                                      <User size={11} />
                                      Unassigned
                                    </button>
                                  )}

                                  {item.dueDate && (
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                      isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      <CalendarDays size={11} />
                                      {new Date(item.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                      {isOverdue && ' (overdue)'}
                                    </span>
                                  )}

                                  {item.completedAt && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                      <CheckCircle2 size={11} />
                                      Done {new Date(item.completedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>

                                {/* Notes */}
                                {item.notes && (
                                  <p className="text-xs text-gray-500 mt-1.5 italic">{item.notes}</p>
                                )}
                              </div>

                              {/* Right actions */}
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {/* Edit button */}
                                <button
                                  onClick={() => startEditing(item)}
                                  className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                  title="Edit task"
                                >
                                  <Pencil size={14} />
                                </button>

                                {/* Comment toggle */}
                                <button
                                  onClick={() => {
                                    setExpandedItem(isExpanded ? null : item.id);
                                    setCommentText('');
                                    setCommentLink('');
                                    setCommentLinkLabel('');
                                    setShowLinkInput(false);
                                  }}
                                  className={`relative p-1.5 rounded-lg transition-colors ${
                                    isExpanded ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                  }`}
                                  title="Comments & Links"
                                >
                                  <MessageSquare size={15} />
                                  {commentCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                      {commentCount}
                                    </span>
                                  )}
                                </button>

                                {/* Status dropdown */}
                                <select
                                  value={item.status}
                                  onChange={e => updateItemMut.mutate({ checklistId: checklist.id, itemId: item.id, data: { status: e.target.value } })}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                  ))}
                                </select>

                                {/* Delete */}
                                <button
                                  onClick={() => { if (confirm('Delete this task?')) deleteItemMut.mutate({ checklistId: checklist.id, itemId: item.id }); }}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Expanded: Comments & Links panel */}
                            {isExpanded && (
                              <div className="px-5 pb-4 pt-0 ml-[34px] border-t border-gray-100">
                                <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-3">
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Comments & Links
                                  </h4>

                                  {/* Existing comments */}
                                  {commentCount === 0 && (
                                    <p className="text-xs text-gray-400 italic">No comments yet. Add a note, update, or link below.</p>
                                  )}
                                  {(item.comments ?? []).map(c => (
                                    <div key={c.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 text-sm group">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                                              <User size={10} className="text-gray-400" /> {c.authorName}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                              {new Date(c.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                                          {c.linkUrl && (
                                            <a
                                              href={c.linkUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1.5 font-medium"
                                            >
                                              <ExternalLink size={11} />
                                              {c.linkLabel || c.linkUrl}
                                            </a>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => deleteCommentMut.mutate({ itemId: item.id, commentId: c.id })}
                                          className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Delete comment"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Add comment form */}
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <input
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Add a comment or update…"
                                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                                            addCommentMut.mutate({ itemId: item.id });
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => setShowLinkInput(s => !s)}
                                        className={`p-2 rounded-lg border transition-colors ${showLinkInput ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                        title="Attach a link"
                                      >
                                        <ExternalLink size={14} />
                                      </button>
                                      <button
                                        onClick={() => commentText.trim() && addCommentMut.mutate({ itemId: item.id })}
                                        disabled={!commentText.trim() || addCommentMut.isPending}
                                        className="btn-primary text-sm px-3 py-2"
                                        title="Send"
                                      >
                                        <Send size={14} />
                                      </button>
                                    </div>

                                    {showLinkInput && (
                                      <div className="flex gap-2">
                                        <input
                                          value={commentLink}
                                          onChange={e => setCommentLink(e.target.value)}
                                          placeholder="https://… (link URL)"
                                          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                        />
                                        <input
                                          value={commentLinkLabel}
                                          onChange={e => setCommentLinkLabel(e.target.value)}
                                          placeholder="Link label (optional)"
                                          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            </>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
    </svg>
  );
}
