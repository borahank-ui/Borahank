/**
 * worker.js — Autonomous task processor with hourly cron
 *
 * Run standalone:  node worker.js
 * It schedules itself to fire every hour (top of the hour) and also
 * runs once immediately on startup for testing convenience.
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const TASKS_FILE = path.join(__dirname, 'tasks.json');
const LOG_FILE = path.join(__dirname, 'tasks.log');

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  process.stdout.write(line);
}

// ---------------------------------------------------------------------------
// Simulated autonomous task work
//
// In a real deployment you would replace this with actual Claude API calls,
// shell commands, or any other automation.  Here we produce plausible log
// entries for each task to demonstrate the pipeline.
// ---------------------------------------------------------------------------

function simulateWork(task) {
  const actions = {
    critical: [
      `Escalating critical task: "${task.title}"`,
      `Performing immediate triage for "${task.title}"`,
      `Allocating max resources to "${task.title}"`,
      `Critical task "${task.title}" — executing emergency protocol`,
    ],
    high: [
      `Prioritising high-priority task: "${task.title}"`,
      `Starting high-priority work on "${task.title}"`,
      `Processing "${task.title}" with elevated priority`,
    ],
    medium: [
      `Working on "${task.title}"`,
      `Processing task "${task.title}"`,
      `Executing steps for "${task.title}"`,
    ],
    low: [
      `Picking up low-priority task: "${task.title}"`,
      `Handling "${task.title}" as time allows`,
    ],
  };

  const pool = actions[task.priority] || actions.medium;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Simulate a sequence of sub-steps
  const steps = [];
  steps.push(`[START] ${chosen}`);

  if (task.description) {
    steps.push(`[INFO]  Description: ${task.description}`);
  }

  steps.push(`[STEP1] Analysing requirements for "${task.title}"`);
  steps.push(`[STEP2] Executing primary action for "${task.title}"`);
  steps.push(`[STEP3] Verifying completion for "${task.title}"`);
  steps.push(`[DONE]  Task "${task.title}" successfully completed`);

  return steps;
}

// ---------------------------------------------------------------------------
// Main processor
// ---------------------------------------------------------------------------

function processTasks() {
  log('WORKER run started');

  const tasks = readTasks();
  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

  if (pending.length === 0) {
    log('WORKER task list is empty — nothing to do');
    log('WORKER run finished');
    return;
  }

  log(`WORKER found ${pending.length} pending/in-progress task(s)`);

  // Sort by priority then creation date
  pending.sort((a, b) => {
    const pd = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    if (pd !== 0) return pd;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  for (const task of pending) {
    const taskIdx = tasks.findIndex(t => t.id === task.id);
    if (taskIdx === -1) continue;

    log(`WORKER processing [${task.priority.toUpperCase()}] "${task.title}" (id: ${task.id})`);

    // Mark in_progress
    tasks[taskIdx].status = 'in_progress';
    tasks[taskIdx].updatedAt = new Date().toISOString();
    writeTasks(tasks);

    // Do the work
    const steps = simulateWork(task);
    const taskLog = [];

    for (const step of steps) {
      const entry = `[${new Date().toISOString()}] ${step}`;
      log(`  ${step}`);
      taskLog.push(entry);
    }

    // Mark complete
    tasks[taskIdx].status = 'complete';
    tasks[taskIdx].completedAt = new Date().toISOString();
    tasks[taskIdx].updatedAt = new Date().toISOString();
    tasks[taskIdx].log = (tasks[taskIdx].log || []).concat(taskLog);
    writeTasks(tasks);

    log(`WORKER completed "${task.title}"`);
  }

  log(`WORKER run finished — processed ${pending.length} task(s)`);
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

// Run once immediately so you can verify it works without waiting an hour
log('WORKER initialising — running immediately then scheduling hourly');
processTasks();

// Every hour at minute 0 (e.g. 09:00, 10:00, …)
cron.schedule('0 * * * *', () => {
  log('WORKER cron triggered (hourly)');
  processTasks();
});

log('WORKER scheduled: runs every hour at :00. Press Ctrl+C to stop.');
