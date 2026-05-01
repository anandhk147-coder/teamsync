import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Users, 
  MoreVertical,
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '' });

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`/projects/${id}`);
      setProject(data);
      
      const groupedTasks = {
        todo: data.tasks.filter(t => t.status === 'todo'),
        in_progress: data.tasks.filter(t => t.status === 'in_progress'),
        done: data.tasks.filter(t => t.status === 'done')
      };
      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching project', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/tasks/project/${id}`, {
        ...newTask,
        assigneeId: newTask.assigneeId || user.id
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '' });
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (error) {
      console.error('Error updating task status', error);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await updateTaskStatus(taskId, targetStatus);
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    try {
      await axios.put(`/tasks/${taskId}`, { priority: newPriority });
      fetchProject();
    } catch (error) {
      console.error('Error updating task priority', error);
    }
  };

  const isProjectAdmin = user?.role === 'admin' || project?.ownerId === user?.id || project?.members?.find(m => m.id === user?.id)?.role === 'admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;
    try {
      await axios.post(`/projects/${id}/members`, { userId: newMemberId, role: 'member' });
      setNewMemberId('');
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`/projects/${id}/members/${memberId}`);
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing member');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link to="/projects" className="text-sm font-semibold text-blue-600 hover:underline">Projects</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <h1 className="text-[26px] font-semibold text-slate-900 leading-tight">{project?.name}</h1>
            <span className={`badge ${
              project?.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              project?.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {project?.status}
            </span>
          </div>
          <p className="text-slate-500 max-w-2xl">{project?.description || 'No description provided.'}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-2">
            {project?.members?.slice(0, 4).map((m, i) => (
              <div 
                key={i} 
                className="w-9 h-9 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm"
                title={m.name}
              >
                {m.name.charAt(0)}
              </div>
            ))}
            {project?.members?.length > 4 && (
              <div className="w-9 h-9 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          
          {isProjectAdmin && (
            <button 
              onClick={() => setShowMembersModal(true)}
              className="w-9 h-9 rounded-full bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm ml-2"
              title="Manage Members"
            >
              <Plus size={16} />
            </button>
          )}
          
          <div className="h-8 w-px bg-slate-200 ml-4" />
          
          <button 
            onClick={() => setShowTaskModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="bg-slate-50/50 rounded-[16px] p-4 min-h-[600px] border border-[#E8EAF0]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{column.title}</h3>
                <span className="text-[11px] font-bold bg-white text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">
                  {tasks[column.id].length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-white rounded">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {tasks[column.id].map(task => (
                <motion.div
                  key={task.id}
                  layoutId={task.id.toString()}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-white border border-[#E8EAF0] rounded-xl p-4 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="relative group/priority">
                      <button className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        task.priority === 'high' ? "bg-rose-50 text-rose-600 hover:bg-rose-100" :
                        task.priority === 'medium' ? "bg-amber-50 text-amber-600 hover:bg-amber-100" :
                        "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}>
                        {task.priority}
                      </button>
                      <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-slate-100 rounded-lg shadow-xl opacity-0 invisible group-hover/priority:opacity-100 group-hover/priority:visible transition-all z-20 overflow-hidden">
                        {['low', 'medium', 'high'].map(p => (
                          <button 
                            key={p}
                            onClick={() => updateTaskPriority(task.id, p)}
                            className={`w-full text-left px-3 py-2 text-[11px] font-bold tracking-wider hover:bg-slate-50 transition-colors ${
                              task.priority === p ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                            }`}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400">
                      <Calendar size={12} className="shrink-0" />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'No date'}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-[15px] font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                  <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description || 'No description available for this task.'}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600" title={task.assignee?.name}>
                        {task.assignee?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{task.assignee?.name?.split(' ')[0]}</span>
                    </div>
                    
                    <div className="relative group/menu">
                      <button className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        <span>Move</span>
                        <ChevronRight size={14} />
                      </button>
                      <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-slate-100 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden">
                        {['todo', 'in_progress', 'done'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateTaskStatus(task.id, s)}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                              task.status === s ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                            }`}
                          >
                            {s.replace('_', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {tasks[column.id].length === 0 && (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-[16px] flex flex-col items-center justify-center text-slate-400">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                    <Plus size={20} className="text-slate-300" />
                  </div>
                  <span className="text-[13px] font-medium">No tasks here</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaskModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Create New Task</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Task Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Design user profile"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Provide some context for this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                    <select
                      className="input-field appearance-none cursor-pointer"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Due Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Assign To</label>
                  <select
                    className="input-field appearance-none cursor-pointer"
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  >
                    <option value="">Select a member</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-3 px-6 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Manage Members Modal */}
      <AnimatePresence>
        {showMembersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMembersModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Manage Members</h2>
                <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Current Members</h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {project?.members?.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                            <p className="text-[11px] text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        {member.id !== project.ownerId && isProjectAdmin && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        {member.id === project.ownerId && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">Owner</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Add New Member</h3>
                  <form onSubmit={handleAddMember} className="flex space-x-3">
                    <select
                      className="input-field flex-1 appearance-none cursor-pointer"
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                    >
                      <option value="">Select a user...</option>
                      {users.filter(u => !project?.members?.find(m => m.id === u.id)).map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    <button type="submit" disabled={!newMemberId} className="btn-primary whitespace-nowrap disabled:opacity-50">
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
