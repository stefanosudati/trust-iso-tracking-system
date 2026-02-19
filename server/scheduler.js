/**
 * Periodic task scheduler for changelog summary emails.
 * Uses setInterval (no external cron dependencies).
 * Stores last run timestamp in the app_settings table.
 */
const db = require('./db');
const { sendMail, isConfigured } = require('./email');

const SETTING_KEY = 'changelog_email_last_run';

// Interval configuration from env (default: 'daily')
const interval = (process.env.CHANGELOG_EMAIL_INTERVAL || 'daily').toLowerCase();
const INTERVAL_MS = interval === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
const LOOKBACK_MS = INTERVAL_MS; // match lookback to interval

let timerId = null;

/**
 * Get the last run timestamp from the database.
 * @returns {string|null} ISO datetime string or null
 */
function getLastRun() {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(SETTING_KEY);
  return row ? row.value : null;
}

/**
 * Store the current timestamp as the last run.
 */
function setLastRun(isoString) {
  db.prepare(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(SETTING_KEY, isoString);
}

/**
 * Query changelog entries since a given datetime.
 * @param {string} since - ISO datetime string
 * @returns {Array} changelog rows
 */
function getChangelogSince(since) {
  return db.prepare(`
    SELECT c.*, p.client_name
    FROM changelog c
    LEFT JOIN projects p ON p.id = c.project_id
    WHERE c.created_at > ?
    ORDER BY c.created_at DESC
  `).all(since);
}

/**
 * Get all admin users with their email addresses.
 * @returns {Array} user rows with email and name
 */
function getAdminUsers() {
  return db.prepare(
    "SELECT id, email, name FROM users WHERE role = 'admin'"
  ).all();
}

/**
 * Group changelog entries by project.
 * @param {Array} entries
 * @returns {Object} { projectId: { clientName, entries: [...] } }
 */
function groupByProject(entries) {
  const grouped = {};
  for (const entry of entries) {
    if (!grouped[entry.project_id]) {
      grouped[entry.project_id] = {
        clientName: entry.client_name || entry.project_id,
        entries: [],
      };
    }
    grouped[entry.project_id].entries.push(entry);
  }
  return grouped;
}

/**
 * Build an HTML email summarizing changelog entries.
 * @param {Object} grouped - Output of groupByProject()
 * @param {string} since - ISO datetime of the period start
 * @returns {string} HTML string
 */
function buildSummaryHtml(grouped, since) {
  const projectIds = Object.keys(grouped);
  const totalChanges = projectIds.reduce((sum, id) => sum + grouped[id].entries.length, 0);

  const sinceDate = new Date(since + 'Z');
  const sinceFormatted = sinceDate.toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Trust ISO Tracker - Riepilogo Changelog</h1>
        <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Dal ${sinceFormatted}</p>
      </div>
      <div style="background: #f8fafc; padding: 20px 24px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
          <strong>${totalChanges}</strong> modifiche in <strong>${projectIds.length}</strong> progetto/i.
        </p>
  `;

  for (const projectId of projectIds) {
    const { clientName, entries } = grouped[projectId];
    html += `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <h2 style="margin: 0 0 12px; font-size: 16px; color: #1e293b;">${escapeHtml(clientName)}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 6px 8px; color: #64748b; font-weight: 600;">Requisito</th>
                <th style="text-align: left; padding: 6px 8px; color: #64748b; font-weight: 600;">Campo</th>
                <th style="text-align: left; padding: 6px 8px; color: #64748b; font-weight: 600;">Utente</th>
                <th style="text-align: left; padding: 6px 8px; color: #64748b; font-weight: 600;">Data</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Show up to 20 entries per project, then summarize
    const displayEntries = entries.slice(0, 20);
    for (const e of displayEntries) {
      const date = new Date(e.created_at + 'Z');
      const dateStr = date.toLocaleDateString('it-IT', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
      html += `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 8px; color: #334155;">${escapeHtml(e.requirement_id)}</td>
                <td style="padding: 6px 8px; color: #334155;">${escapeHtml(e.field)}</td>
                <td style="padding: 6px 8px; color: #64748b;">${escapeHtml(e.user_name)}</td>
                <td style="padding: 6px 8px; color: #64748b; white-space: nowrap;">${dateStr}</td>
              </tr>
      `;
    }

    if (entries.length > 20) {
      html += `
              <tr>
                <td colspan="4" style="padding: 8px; color: #64748b; font-style: italic; text-align: center;">
                  ...e altre ${entries.length - 20} modifiche
                </td>
              </tr>
      `;
    }

    html += `
            </tbody>
          </table>
        </div>
    `;
  }

  html += `
        <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0; text-align: center;">
          Email generata automaticamente da Trust ISO Tracker.
        </p>
      </div>
    </div>
  `;

  return html;
}

/**
 * Escape HTML entities to prevent XSS in email content.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Execute the changelog summary email task.
 * Can be called manually (from admin endpoint) or by the scheduler.
 * @returns {{ changeCount: number, recipientCount: number, since: string }}
 */
async function runChangelogSummary() {
  const lastRun = getLastRun();
  const since = lastRun || new Date(Date.now() - LOOKBACK_MS).toISOString().replace('T', ' ').slice(0, 19);

  const entries = getChangelogSince(since);

  if (entries.length === 0) {
    // Update last run even if no changes, to avoid re-scanning
    setLastRun(new Date().toISOString().replace('T', ' ').slice(0, 19));
    return { changeCount: 0, recipientCount: 0, since };
  }

  const grouped = groupByProject(entries);
  const html = buildSummaryHtml(grouped, since);
  const admins = getAdminUsers();

  let recipientCount = 0;
  for (const admin of admins) {
    try {
      await sendMail(
        admin.email,
        `Trust ISO Tracker - Riepilogo changelog (${entries.length} modifiche)`,
        html
      );
      recipientCount++;
    } catch (err) {
      console.error(`Errore invio riepilogo a ${admin.email}:`, err.message);
    }
  }

  // Update last run timestamp
  setLastRun(new Date().toISOString().replace('T', ' ').slice(0, 19));

  return { changeCount: entries.length, recipientCount, since };
}

/**
 * Start the periodic scheduler.
 * Does not start in test environment.
 */
function startScheduler() {
  if (timerId) {
    console.warn('Scheduler gia\' avviato, ignoro la chiamata.');
    return;
  }

  if (!isConfigured) {
    console.log('Scheduler changelog email: SMTP non configurato, scheduler non avviato.');
    return;
  }

  console.log(`Scheduler changelog email avviato (intervallo: ${interval}, ogni ${INTERVAL_MS / 1000 / 60 / 60}h)`);

  timerId = setInterval(async () => {
    try {
      const result = await runChangelogSummary();
      console.log(
        `Riepilogo changelog inviato: ${result.changeCount} modifiche a ${result.recipientCount} admin`
      );
    } catch (err) {
      console.error('Errore scheduler changelog:', err.message);
    }
  }, INTERVAL_MS);
}

/**
 * Stop the periodic scheduler.
 */
function stopScheduler() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    console.log('Scheduler changelog email fermato.');
  }
}

module.exports = { startScheduler, stopScheduler, runChangelogSummary };
