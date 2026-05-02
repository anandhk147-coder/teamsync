const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.onrender.com')) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.send('Project & Task Management API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    
    // Auto-sync database schema in all environments
    await sequelize.sync({ alter: true });
    console.log('Database synced...');

    // Automatically seed missing default users
    const { User } = require('./models');
    
    const seedUser = async (email, name, password, role) => {
      try {
        const exists = await User.findOne({ where: { email } });
        if (!exists) {
          // Pass raw password, model hook will hash it
          await User.create({ name, email, password_hash: password, role });
          console.log(`Seeded ${role} user: ${email}`);
        } else {
          // Force update to fix the double-hashed bug from previous version
          exists.password_hash = password;
          await exists.save();
          console.log(`Updated password for ${email}`);
        }
      } catch (err) {
        console.error(`Failed to seed ${email}:`, err.message);
      }
    };
    
    await seedUser('admin@app.com', 'Admin User', 'Admin@1234', 'admin');
    await seedUser('member@test.com', 'Member User', 'Member@1234', 'member');

    // Automatically seed projects and tasks if none exist
    const { Project, Task } = require('./models');
    try {
      const projectCount = await Project.count();
      if (projectCount === 0) {
        const adminUser = await User.findOne({ where: { email: 'admin@app.com' } });
        const memberUser = await User.findOne({ where: { email: 'member@test.com' } });
        
        if (adminUser) {
          console.log('Seeding sample projects and tasks...');
          
          // Project 1: Website Redesign
          const p1 = await Project.create({
            name: 'Website Redesign 2026',
            description: 'Overhauling the main corporate website with a modern look.',
            status: 'active',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            ownerId: adminUser.id
          });
          
          await Task.bulkCreate([
            { title: 'Design Mockups', description: 'Create Figma mockups', status: 'done', priority: 'high', projectId: p1.id, assigneeId: adminUser.id },
            { title: 'Frontend Setup', description: 'Initialize React/Vite', status: 'in_progress', priority: 'high', projectId: p1.id, assigneeId: adminUser.id },
            { title: 'API Integration', description: 'Connect to Render backend', status: 'todo', priority: 'medium', projectId: p1.id, assigneeId: memberUser?.id }
          ]);

          // Project 2: Mobile App MVP
          const p2 = await Project.create({
            name: 'Mobile App MVP',
            description: 'First version of the iOS and Android application.',
            status: 'active',
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            ownerId: adminUser.id
          });
          
          await Task.bulkCreate([
            { title: 'User Auth Flow', description: 'Login/Register screens', status: 'todo', priority: 'high', projectId: p2.id, assigneeId: adminUser.id },
            { title: 'Database Schema', description: 'Design offline-first DB', status: 'in_progress', priority: 'medium', projectId: p2.id, assigneeId: adminUser.id }
          ]);

          // Project 3: Marketing Campaign
          const p3 = await Project.create({
            name: 'Q3 Marketing Campaign',
            description: 'Assets and planning for the Q3 product launch.',
            status: 'completed',
            deadline: new Date(new Date().setDate(new Date().getDate() - 5)),
            ownerId: adminUser.id
          });

          await Task.bulkCreate([
            { title: 'Write copy', description: 'Ad copy for social media', status: 'done', priority: 'low', projectId: p3.id, assigneeId: adminUser.id }
          ]);
          
          console.log('Successfully seeded sample projects and tasks!');
        }
      }
    } catch (err) {
      console.error('Failed to seed projects/tasks:', err.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
