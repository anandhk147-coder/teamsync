import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  Users, 
  Calendar,
  RefreshCw,
  Trophy,
  Activity,
  Layout
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar as BarChartJS } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
    myTasks: 0,
    weeklyActivity: [],
    priorityStats: { high: 0, medium: 0, low: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: Layout, color: 'text-slate-500', bg: 'bg-slate-50' },
    { label: 'To Do', value: stats.todo, icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Done', value: stats.done, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'My Tasks', value: stats.myTasks, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  const barChartData = {
    labels: stats.weeklyActivity.map(d => d.day),
    datasets: [
      {
        label: 'Completed',
        data: stats.weeklyActivity.map(d => d.completed),
        backgroundColor: '#378ADD',
        borderRadius: 6,
      },
      {
        label: 'Created',
        data: stats.weeklyActivity.map(d => d.created),
        backgroundColor: '#E8EAF0',
        borderRadius: 6,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11 }
        },
        grid: {
          display: true,
          drawBorder: false,
          color: '#F4F5F8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11, weight: '500' }
        }
      }
    }
  };

  const priorityTotal = stats.priorityStats.high + stats.priorityStats.medium + stats.priorityStats.low;
  const getPercentage = (val) => priorityTotal ? Math.round((val / priorityTotal) * 100) : 0;

  const priorityItems = [
    { label: 'High Priority', value: stats.priorityStats.high, color: 'bg-rose-500', percentage: getPercentage(stats.priorityStats.high) },
    { label: 'Medium Priority', value: stats.priorityStats.medium, color: 'bg-amber-500', percentage: getPercentage(stats.priorityStats.medium) },
    { label: 'Low Priority', value: stats.priorityStats.low, color: 'bg-emerald-500', percentage: getPercentage(stats.priorityStats.low) }
  ];

  if (loading && !stats.totalTasks) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 leading-tight">Workspace Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening in your projects today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={16} />
            <input 
              type="date" 
              className="appearance-none bg-white border border-[#E8EAF0] rounded-lg !pl-10 pr-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button 
            onClick={fetchStats}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E8EAF0] rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-[#E8EAF0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon className={`${card.color}`} size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="bg-white border border-[#E8EAF0] rounded-[16px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Recent Productivity</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Daily task completion vs creation</p>
            </div>
            <Activity size={20} className="text-slate-300" />
          </div>
          <div className="h-[300px]">
            <BarChartJS data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-white border border-[#E8EAF0] rounded-[16px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Priority Distribution</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Pending tasks by urgency</p>
            </div>
            <ListTodo size={20} className="text-slate-300" />
          </div>
          <div className="space-y-6 pt-4">
            {priorityItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    className={`h-full ${item.color} rounded-full`}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
            
            {!priorityTotal && (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                <Activity size={40} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No pending tasks to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
