import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  X, 
  Folder, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Trash2
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    deadline: '', 
    status: 'active',
    members: [] 
  });
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
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
    fetchProjects();
    if (user?.role === 'admin') fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', deadline: '', status: 'active', members: [] });
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    console.log('Attempting to delete project:', projectId);
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) {
      try {
        const response = await axios.delete(`/projects/${projectId}`);
        console.log('Delete response:', response.data);
        fetchProjects();
      } catch (error) {
        console.error('Delete error:', error);
        alert(error.response?.data?.message || 'Error deleting project');
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.status.replace('_', ' ').toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'on_hold': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDotColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'on_hold': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-semibold text-slate-900 leading-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and track your team projects.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2 shadow-blue-500/20"
          >
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-6">
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="input-field !pl-14 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Active', 'Completed', 'On Hold'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => {
            const progress = calculateProgress(project.tasks);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-[#E8EAF0] rounded-[12px] p-5 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all group"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`w-2.5 h-2.5 rounded-full ${getDotColor(project.status)} shrink-0`} />
                    <h2 className="text-[15px] font-semibold text-slate-900 truncate">{project.name}</h2>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    {(user?.role === 'admin' || project.ownerId === user?.id) && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-slate-500 mb-6 line-clamp-2 min-h-[40px]">
                  {project.description || 'No description provided for this project.'}
                </p>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>Progress</span>
                    <span className="text-slate-900">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-[#378ADD] rounded-full"
                    />
                  </div>
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 3).map((m, i) => (
                        <div 
                          key={i} 
                          className="w-[26px] h-[26px] rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600"
                          title={m.name}
                        >
                          {m.name.charAt(0)}
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-[26px] h-[26px] rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="ml-3 text-[13px] font-medium text-slate-500">
                      {project.deadline ? `Deadline: ${new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : 'No deadline'}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/projects/${project.id}`}
                    className="text-[13px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View Tasks</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-[#E8EAF0] rounded-[16px]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Folder size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
            <p className="text-slate-500 mt-1 mb-8">Get started by creating your first project.</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Create First Project</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Project Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Website Redesign"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Describe the project goals..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Deadline</label>
                    <input
                      type="date"
                      className="input-field"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
                    <select
                      className="input-field appearance-none cursor-pointer"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Assign Members</label>
                  <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 bg-slate-50/50">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={newProject.members.includes(u.id)}
                          onChange={(e) => {
                            const members = e.target.checked 
                              ? [...newProject.members, u.id]
                              : newProject.members.filter(id => id !== u.id);
                            setNewProject({ ...newProject, members });
                          }}
                        />
                        <span className="ml-3 text-sm text-slate-700 font-medium">{u.name}</span>
                        <span className="ml-auto text-[10px] uppercase font-bold text-slate-400">{u.role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-6 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
