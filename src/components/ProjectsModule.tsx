import React, { useState, useMemo } from 'react';
import {
  KanbanSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  FolderGit2,
} from 'lucide-react';
import { Organization, Project, Task } from '../types';

interface ProjectsModuleProps {
  currentOrg: Organization;
  projects: Project[];
  tasks: Task[];
  onCreateTask: (task: Partial<Task>) => void;
  onUpdateTaskStatus: (id: string, status: Task['status']) => void;
}

const TASK_COLUMNS: { id: Task['status']; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500' },
  { id: 'review', title: 'Quality Review', color: 'border-amber-500' },
  { id: 'done', title: 'Completed', color: 'border-emerald-500' },
];

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({
  currentOrg,
  projects,
  tasks,
  onCreateTask,
  onUpdateTaskStatus,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: 'Aakash Verma',
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  const orgProjects = useMemo(
    () => projects.filter((p) => p.organizationId === currentOrg.id),
    [projects, currentOrg.id]
  );

  const activeProject = useMemo(
    () => orgProjects.find((p) => p.id === selectedProjectId) || orgProjects[0],
    [orgProjects, selectedProjectId]
  );

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === activeProject?.id),
    [tasks, activeProject]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    onCreateTask({
      projectId: activeProject.id,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });

    setIsNewTaskOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: 'Aakash Verma',
      priority: 'medium',
      dueDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Projects & Engineering Milestones
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Resource budget tracking · Sprint Kanban boards · Cross-functional assignments
          </div>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project Task</span>
        </button>
      </div>

      {/* Project Selector Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orgProjects.map((proj) => {
          const isSelected = activeProject?.id === proj.id;
          const budgetPercent = Math.round((proj.spent / proj.budget) * 100);

          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-xl border text-left transition-all space-y-3 ${
                isSelected
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {proj.name}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {proj.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">Client: {proj.clientName}</div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Milestone Progress</span>
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                    {proj.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Budget Strip */}
              <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-sans">Spent / Cap</span>
                <span className="text-slate-700 dark:text-slate-300">
                  ₹{(proj.spent / 100000).toFixed(1)}L / ₹{(proj.budget / 100000).toFixed(1)}L ({budgetPercent}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE PROJECT KANBAN BOARD */}
      {activeProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-emerald-500" />
              <span>Sprint Taskboard: {activeProject.name}</span>
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span>Deadline: {activeProject.deadline}</span>
              <span aria-hidden="true">·</span>
              <span>Team: {activeProject.teamMembers?.join(', ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pb-4">
            {TASK_COLUMNS.map((col) => {
              const colTasks = projectTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-3 min-h-[360px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                            {task.title}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {task.description}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 dark:border-slate-700/60 font-mono">
                          <span className="text-slate-400">{task.assignedTo}</span>
                          <span
                            className={`font-bold uppercase ${
                              task.priority === 'urgent'
                                ? 'text-rose-500'
                                : task.priority === 'high'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Status Switcher */}
                        <div className="pt-1 flex justify-end">
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                          >
                            {TASK_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Move to {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">No tasks</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Sprint Milestone Task
              </h3>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Calibrate optical sensor array hardware"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Specifications</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Technical acceptance criteria, requirements, or dependencies..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Assignee</label>
                  <input
                    type="text"
                    required
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
