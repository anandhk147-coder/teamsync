const { Project, Task, User } = require('./models');

async function seedData() {
  try {
    const adminUser = await User.findOne({ where: { email: 'admin@app.com' } });
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }

    // Create a new project
    const project = await Project.create({
      name: 'Website Redesign',
      description: 'Redesigning the corporate website for 2026',
      status: 'active',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      ownerId: adminUser.id
    });

    console.log('Created project:', project.name);

    // Create some tasks assigned to the admin user
    const tasksToCreate = [
      {
        title: 'Design Mockups',
        description: 'Create Figma mockups for the new homepage',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        projectId: project.id,
        assigneeId: adminUser.id
      },
      {
        title: 'Setup Frontend Architecture',
        description: 'Initialize React project with Vite and Tailwind CSS',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        projectId: project.id,
        assigneeId: adminUser.id
      },
      {
        title: 'Write User Stories',
        description: 'Document all requirements for the sprint planning',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        projectId: project.id,
        assigneeId: adminUser.id
      },
      {
        title: 'API Authentication',
        description: 'Implement JWT based authentication in the backend',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        projectId: project.id,
        assigneeId: adminUser.id
      }
    ];

    await Task.bulkCreate(tasksToCreate);
    console.log('Successfully added sample tasks for the admin user!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
