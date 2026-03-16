const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');
const LOG_FILE = path.join(__dirname, 'tasks.log');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers ---

function readTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function appendLog(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

// --- API Routes ---

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(readTasks());
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  const taskPriority = validPriorities.includes(priority) ? priority : 'medium';

  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: (description || '').trim(),
    priority: taskPriority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    log: []
  };

  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  appendLog(`CREATED task [${task.id}] "${task.title}" (priority: ${task.priority})`);
  res.status(201).json(task);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const { title, description, priority, status } = req.body;
  const task = tasks[idx];
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  const validStatuses = ['pending', 'in_progress', 'complete'];

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (priority !== undefined && validPriorities.includes(priority)) task.priority = priority;
  if (status !== undefined && validStatuses.includes(status)) {
    task.status = status;
    if (status === 'complete' && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }
  }
  task.updatedAt = new Date().toISOString();

  tasks[idx] = task;
  writeTasks(tasks);
  appendLog(`UPDATED task [${task.id}] "${task.title}" (status: ${task.status}, priority: ${task.priority})`);
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const [removed] = tasks.splice(idx, 1);
  writeTasks(tasks);
  appendLog(`DELETED task [${removed.id}] "${removed.title}"`);
  res.json({ success: true });
});

// GET log file contents
app.get('/api/logs', (req, res) => {
  try {
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean).slice(-200).reverse();
    res.json({ lines });
  } catch {
    res.json({ lines: [] });
  }
});

app.listen(PORT, () => {
  appendLog(`SERVER started on http://localhost:${PORT}`);
  console.log(`To-do dashboard running at http://localhost:${PORT}`);
});
