import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  MoreVertical,
  ChevronRight,
  ClipboardList,
  CheckSquare,
  Square,
  Flag,
  Activity,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { MOCK_PATIENTS } from '../constants';

interface TaskHistory {
  date: string;
  action: string;
  user: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  patientId?: string;
  patientName?: string;
  assignedTo: string;
  assigneeType: 'Clinical Team' | 'Patient';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'In Progress';
  category: 'Clinical' | 'Administrative' | 'Billing' | 'Follow-up';
  history: TaskHistory[];
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review John Doe Lab Results',
    description: 'Electrolyte imbalance detected in recent labs. Need to correlate with RPM data.',
    patientId: '1',
    patientName: 'John Doe',
    assignedTo: 'Dr. Sarah Smith',
    assigneeType: 'Clinical Team',
    dueDate: '2024-02-26',
    priority: 'High',
    status: 'Pending',
    category: 'Clinical',
    history: [
      { date: '2024-02-24 09:00', action: 'Task Created', user: 'System' },
      { date: '2024-02-24 10:30', action: 'Assigned to Dr. Sarah Smith', user: 'Admin' }
    ]
  },
  {
    id: '2',
    title: 'Call Jane Smith for RPM Onboarding',
    description: 'Patient received device but hasn\'t activated it yet.',
    patientId: '2',
    patientName: 'Jane Smith',
    assignedTo: 'Nurse Kelly',
    assigneeType: 'Clinical Team',
    dueDate: '2024-02-27',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Follow-up',
    history: [
      { date: '2024-02-25 14:00', action: 'Task Created', user: 'System' },
      { date: '2024-02-25 15:00', action: 'Status changed to In Progress', user: 'Nurse Kelly' }
    ]
  },
  {
    id: '3',
    title: 'Finalize CCM Documentation for Robert Wilson',
    description: 'Need 2 more minutes of clinical staff time to qualify for 99490.',
    patientId: '3',
    patientName: 'Robert Wilson',
    assignedTo: 'Dr. Sarah Smith',
    assigneeType: 'Clinical Team',
    dueDate: '2024-02-25',
    priority: 'High',
    status: 'Completed',
    category: 'Billing',
    history: [
      { date: '2024-02-23 11:00', action: 'Task Created', user: 'Admin' },
      { date: '2024-02-25 16:30', action: 'Status changed to Completed', user: 'Dr. Sarah Smith' }
    ]
  },
  {
    id: '4',
    title: 'Update Care Plan for Sarah Jenkins',
    description: 'Review and update the annual care plan for hypertension management.',
    patientId: '4',
    patientName: 'Sarah Jenkins',
    assignedTo: 'Dr. Sarah Smith',
    assigneeType: 'Clinical Team',
    dueDate: '2024-03-01',
    priority: 'Low',
    status: 'Pending',
    category: 'Clinical',
    history: [
      { date: '2024-02-20 08:00', action: 'Task Created', user: 'System' }
    ]
  }
];

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'Medium',
    status: 'Pending',
    category: 'Clinical',
    assigneeType: 'Clinical Team'
  });

  useEffect(() => {
    const handleNuviaCommand = (e: CustomEvent) => {
      if (e.detail.name === 'schedule_task') {
        const { title, description, assignedTo, dueDate, patientName } = e.detail.args;
        const task: Task = {
          id: Date.now().toString(),
          title: title || 'Follow-up task',
          description: description || '',
          patientName: patientName,
          assignedTo: assignedTo || 'Clinical Team',
          assigneeType: 'Clinical Team',
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          priority: 'Medium',
          status: 'Pending',
          category: 'Clinical',
          history: [
            { 
              date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
              action: 'Task Created by Nuvia', 
              user: 'Nuvia AI' 
            }
          ]
        };
        setTasks(prev => [task, ...prev]);
      }
    };

    window.addEventListener('nuvia-command', handleNuviaCommand as EventListener);
    return () => window.removeEventListener('nuvia-command', handleNuviaCommand as EventListener);
  }, []);

  const handleSuggestTasks = async () => {
    setIsSuggesting(true);
    try {
      const prompt = `Based on the following patient data, suggest 3 relevant clinical or administrative tasks. 
      Format the output as a JSON array of objects with keys: title, description, patientName, priority (High, Medium, Low), category (Clinical, Administrative, Billing).
      
      Patient Data:
      ${JSON.stringify(MOCK_PATIENTS.slice(0, 3))}
      `;
      
      const response = await geminiService.generateContent(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        const newTasks = suggestions.map((s: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: s.title,
          description: s.description,
          patientName: s.patientName,
          assignedTo: 'Clinical Team',
          assigneeType: 'Clinical Team',
          dueDate: new Date().toISOString().split('T')[0],
          priority: s.priority || 'Medium',
          status: 'Pending',
          category: s.category || 'Clinical',
          history: [
            { 
              date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
              action: 'Task Suggested by AI', 
              user: 'Nuvia AI' 
            }
          ]
        }));
        setTasks(prev => [...newTasks, ...prev]);
      }
    } catch (error) {
      console.error("Failed to suggest tasks:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.patientName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
    };
  }, [tasks]);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { 
          ...t, 
          status: newStatus,
          history: [
            ...t.history,
            { 
              date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
              action: `Status changed to ${newStatus}`, 
              user: 'Dr. Sarah Smith' 
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    if (editingTask) {
      setTasks(prev => prev.map(t => {
        if (t.id === editingTask.id) {
          const updatedTask: Task = {
            ...t,
            title: newTask.title!,
            description: newTask.description || '',
            patientId: newTask.patientId,
            patientName: newTask.patientName,
            assignedTo: newTask.assignedTo || 'Unassigned',
            assigneeType: newTask.assigneeType as any || 'Clinical Team',
            dueDate: newTask.dueDate || t.dueDate,
            priority: newTask.priority as any,
            category: newTask.category as any,
            history: [
              ...t.history,
              { 
                date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
                action: 'Task Updated', 
                user: 'Dr. Sarah Smith' 
              }
            ]
          };
          return updatedTask;
        }
        return t;
      }));
      setEditingTask(null);
    } else {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title!,
        description: newTask.description || '',
        patientId: newTask.patientId,
        patientName: newTask.patientName,
        assignedTo: newTask.assignedTo || 'Unassigned',
        assigneeType: newTask.assigneeType as any || 'Clinical Team',
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        priority: newTask.priority as any,
        status: 'Pending',
        category: newTask.category as any,
        history: [
          { 
            date: new Date().toISOString().replace('T', ' ').substring(0, 16), 
            action: 'Task Created', 
            user: 'Dr. Sarah Smith' 
          }
        ]
      };
      setTasks([task, ...tasks]);
    }
    
    setShowAddModal(false);
    setNewTask({ priority: 'Medium', status: 'Pending', category: 'Clinical', assigneeType: 'Clinical Team' });
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask(task);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Clinical Tasks</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manage your care workflow</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleSuggestTasks}
            disabled={isSuggesting}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suggest Tasks
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pending</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.pending}</p>
          <p className="text-[10px] text-orange-600 font-bold mt-1">Requires attention</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">In Progress</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.inProgress}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-1">Active workflows</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Completed</p>
          </div>
          <p className="text-3xl font-black text-zinc-900">{stats.completed}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Tasks finalized</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search tasks or patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-zinc-100 border-none rounded-2xl text-xs font-bold text-zinc-600 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-zinc-100 border-none rounded-2xl text-xs font-bold text-zinc-600 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all ${
                task.status === 'Completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.status === 'Completed' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-zinc-200 text-transparent hover:border-zinc-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`font-black text-zinc-900 tracking-tight ${
                        task.status === 'Completed' ? 'line-through' : ''
                      }`}>{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        task.priority === 'High' ? 'bg-red-100 text-red-600' :
                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[8px] font-black uppercase tracking-widest">
                        {task.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mb-4 leading-relaxed">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      {task.patientName && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                          <User className="w-3 h-3" />
                          {task.patientName}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <Tag className="w-3 h-3" />
                        <span className="text-zinc-500">{task.assigneeType}:</span> {task.assignedTo}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setShowHistoryModal(task)}
                    className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    History
                  </button>
                  <button 
                    onClick={() => startEditTask(task)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors self-end"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-[32px] border border-zinc-200 border-dashed text-center">
            <ClipboardList className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">No tasks found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {editingTask ? 'Update task details' : 'Add to your clinical workflow'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
                    setNewTask({ priority: 'Medium', status: 'Pending', category: 'Clinical', assigneeType: 'Clinical Team' });
                  }} 
                  className="p-2 bg-zinc-100 rounded-full"
                >
                  <AlertCircle className="w-5 h-5 text-zinc-500 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Review Lab Results"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea 
                    placeholder="Add more details..."
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10 h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                      className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option value="Clinical">Clinical</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Billing">Billing</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Assign To</label>
                    <select 
                      value={newTask.assigneeType}
                      onChange={(e) => setNewTask({ ...newTask, assigneeType: e.target.value as any, assignedTo: '' })}
                      className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option value="Clinical Team">Clinical Team</option>
                      <option value="Patient">Patient</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Assignee Name</label>
                    {newTask.assigneeType === 'Patient' ? (
                      <select 
                        value={newTask.assignedTo || ''}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                      >
                        <option value="">Select Patient</option>
                        {MOCK_PATIENTS.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="e.g., Nurse Kelly"
                        value={newTask.assignedTo || ''}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Due Date</label>
                    <input 
                      type="date" 
                      value={newTask.dueDate || ''}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Patient (Optional)</label>
                    <select 
                      value={newTask.patientId || ''}
                      onChange={(e) => {
                        const p = MOCK_PATIENTS.find(p => p.id === e.target.value);
                        setNewTask({ ...newTask, patientId: e.target.value, patientName: p?.name });
                      }}
                      className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option value="">None</option>
                      {MOCK_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleAddTask}
                  className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                  {editingTask ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">Task History</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{showHistoryModal.title}</p>
                </div>
                <button onClick={() => setShowHistoryModal(null)} className="p-2 bg-zinc-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-zinc-500 rotate-45" />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                {showHistoryModal.history.map((entry, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    {i !== showHistoryModal.history.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-zinc-100" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 z-10">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{entry.action}</p>
                        <p className="text-[8px] font-bold text-zinc-400">{entry.date}</p>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">By {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowHistoryModal(null)}
                className="w-full mt-6 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-200"
              >
                Close History
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
