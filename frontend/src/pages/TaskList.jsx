import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Calendar,
  User as UserIcon,
  ListTodo,
  Pencil,
  ChevronDown,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/tasks/my-tasks', {
        params: {
          ...filters,
          page: currentPage,
          limit: 10
        }
      });
      
      let filtered = data.tasks;
      if (search) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
      }
      
      setTasks(filtered);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, filters]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    try {
      await axios.put(`/tasks/${taskId}`, { priority: newPriority });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task priority', error);
    }
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date() && tasks.find(t => t.dueDate === date)?.status !== 'done';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'todo': return 'bg-[#F1F1F1] text-slate-700';
      case 'in_progress': return 'bg-[#FAEEDA] text-amber-700';
      case 'done': return 'bg-[#EAF3DE] text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading && tasks.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-semibold text-slate-900 leading-tight">My Tasks</h1>
          <p className="text-slate-500 mt-1">View and manage all tasks assigned to you.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-white border border-[#E8EAF0] rounded-lg !pl-14 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all w-[240px] shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
              showFilters || filters.status || filters.priority
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-[#E8EAF0] text-slate-600 hover:border-slate-300 shadow-sm'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-[#E8EAF0] rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <div className="flex gap-2">
                    {['All', 'To Do', 'In Progress', 'Done'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilters({ ...filters, status: s === 'All' ? '' : s.toLowerCase().replace(' ', '_') })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          (filters.status === s.toLowerCase().replace(' ', '_')) || (s === 'All' && !filters.status)
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                  <div className="flex gap-2">
                    {['All', 'High', 'Medium', 'Low'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilters({ ...filters, priority: p === 'All' ? '' : p.toLowerCase() })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          (filters.priority === p.toLowerCase()) || (p === 'All' && !filters.priority)
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Table */}
      <div className="bg-white border border-[#E8EAF0] rounded-[12px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F4F5F8] border-b border-[#E8EAF0]">
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400">Task</th>
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400">Due Date</th>
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400">Project</th>
                <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAF0]">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#FAFBFF] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={task.status === 'done'} readOnly />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${getStatusStyle(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group/priority inline-block">
                        <button className="flex items-center space-x-2 cursor-pointer p-1 -ml-1 rounded hover:bg-slate-50 transition-colors">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="text-xs font-semibold text-slate-700 capitalize">{task.priority}</span>
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-slate-100 rounded-lg shadow-xl opacity-0 invisible group-hover/priority:opacity-100 group-hover/priority:visible transition-all z-20 overflow-hidden">
                          {['low', 'medium', 'high'].map(p => (
                            <button 
                              key={p}
                              onClick={() => updateTaskPriority(task.id, p)}
                              className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${
                                task.priority === p ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                              }`}
                            >
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1.5 text-xs font-medium ${isOverdue(task.dueDate) ? 'text-[#E24B4A]' : 'text-slate-500'}`}>
                        {isOverdue(task.dueDate) && <AlertCircle size={14} />}
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-[3px] bg-blue-500" />
                        <span className="text-[13px] font-medium text-slate-600">{task.project?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <div className="relative group/menu">
                          <button className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 text-xs font-semibold">
                            <ChevronDown size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-100 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden">
                            {['todo', 'in_progress', 'done'].map(s => (
                              <button 
                                key={s}
                                onClick={() => updateTaskStatus(task.id, s)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-600 hover:text-blue-600"
                              >
                                {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <ClipboardList size={32} className="text-slate-300" />
                      </div>
                      <h3 className="text-[15px] font-semibold text-slate-900">No tasks found.</h3>
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-[#E8EAF0] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Showing {tasks.length} of {total} tasks
          </span>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Prev
            </button>
            <div className="flex items-center space-x-1">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm" 
              disabled={currentPage === pages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
