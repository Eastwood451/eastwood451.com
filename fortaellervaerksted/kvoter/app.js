const $ = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('da-DK').format(value);
const dateTime = value => new Intl.DateTimeFormat('da-DK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const time = value => new Intl.DateTimeFormat('da-DK', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value * 1000));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let polling = null;

async function api(path) {
  const response = await fetch(path, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Kunne ikke hente data');
  return data;
}
function message(text) { $('message').textContent = text || ''; $('message').hidden = !text; }
function windowLabel(minutes) {
  if (minutes === 10080) return 'Ugentlig grænse';
  if (minutes === 300) return '5 timers grænse';
  if (minutes % 1440 === 0) return `${minutes / 1440} dages grænse`;
  if (minutes % 60 === 0) return `${minutes / 60} timers grænse`;
  return `${minutes} minutters grænse`;
}
function renderLimit(limit, label) {
  const used = Number(limit.usedPercent);
  if (!Number.isFinite(used)) return '';
  const left = Math.max(0, Math.min(100, 100 - used));
  const colour = left <= 10 ? 'critical' : left <= 25 ? 'low' : '';
  return `<article class="limit-card"><div class="limit-top"><span class="limit-name">${escapeHtml(label)}</span><span>${escapeHtml(windowLabel(limit.windowDurationMins || 0))}</span></div><div class="limit-value">${number(Math.round(left))}<span>% tilbage</span></div><div class="progress" role="progressbar" aria-label="${escapeHtml(label)} tilbage" aria-valuenow="${Math.round(left)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill ${colour}" style="width:${left}%"></div></div><div class="limit-bottom"><span>${number(Math.round(used))}% brugt</span><span>${limit.resetsAt ? `Nulstilles ${escapeHtml(time(limit.resetsAt))}` : 'Nulstilling ukendt'}</span></div></article>`;
}
function renderLimits(data) {
  const source = data.limits?.rateLimitsByLimitId;
  const buckets = source && Object.keys(source).length ? Object.values(source) : data.limits?.rateLimits ? [data.limits.rateLimits] : [];
  const cards = [];
  for (const bucket of buckets) {
    const name = bucket.limitName && bucket.limitName !== bucket.limitId ? bucket.limitName : 'Planforbrug';
    const windows = [bucket.primary, bucket.secondary].filter(Boolean);
    for (const window of windows) cards.push(renderLimit(window, name));
  }
  $('limits').innerHTML = cards.join('') || '<p class="empty">Der er ingen kvotevinduer tilgængelige for kontoen lige nu.</p>';
}
function renderCredits(data) {
  const limits = data.limits?.rateLimitsByLimitId?.codex || data.limits?.rateLimits;
  const credits = limits?.credits;
  const resets = data.limits?.rateLimitResetCredits?.availableCount;
  if (!credits) {
    $('credits').innerHTML = '<p class="empty">Creditsaldoen er ikke oplyst for denne konto.</p>';
    return;
  }
  const balance = credits.unlimited ? 'Ubegrænset' : credits.balance == null ? 'Ukendt' : escapeHtml(credits.balance);
  $('credits').innerHTML = `<div class="metric">${balance}<small> credits tilbage</small></div><p class="supporting">Saldoen viser resterende credits. Se kredithistorik under Usage & Billing i Codex-appen.</p>${Number.isFinite(resets) ? `<div class="mini-stat"><span>Opsparede nulstillinger</span><strong>${number(resets)}</strong></div>` : ''}`;
}
function renderTokens(data) {
  const summary = data.usage?.summary;
  if (!summary) { $('tokens').innerHTML = '<p class="empty">Tokenaktivitet er ikke tilgængelig for denne konto.</p>'; return; }
  const total = summary.lifetimeTokens;
  $('tokens').innerHTML = `<div class="metric">${total == null ? '—' : number(total)}<small> i alt</small></div><p class="supporting">Samlet tokenaktivitet på din ChatGPT-konto. Det er ikke en restkvote.</p>${summary.peakDailyTokens != null ? `<div class="mini-stat"><span>Højeste dag</span><strong>${number(summary.peakDailyTokens)} tokens</strong></div>` : ''}`;
}
function renderChart(data) {
  const buckets = data.usage?.dailyUsageBuckets;
  if (!Array.isArray(buckets) || !buckets.length) { $('chart').innerHTML = '<p class="empty">Daglige tokental er ikke tilgængelige endnu.</p>'; return; }
  const days = buckets.slice(-14);
  const max = Math.max(1, ...days.map(day => Number(day.tokens) || 0));
  $('chart').innerHTML = days.map(day => {
    const value = Math.max(0, Number(day.tokens) || 0);
    const height = Math.max(3, value / max * 100);
    const label = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'numeric' }).format(new Date(`${day.startDate}T12:00:00`));
    return `<div class="chart-col" title="${escapeHtml(day.startDate)}: ${number(value)} tokens"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${height}%" aria-label="${escapeHtml(label)}: ${number(value)} tokens"></div></div><span>${escapeHtml(label)}</span></div>`;
  }).join('');
}
function render(data) {
  $('updated').textContent = data.updatedAt ? `Synkroniseret ${dateTime(data.updatedAt)}` : 'Afventer første synkronisering';
  $('account').hidden = !data.account?.planType;
  $('account').textContent = data.account?.planType || '';
  const age = data.updatedAt ? Date.now() - new Date(data.updatedAt).getTime() : Infinity;
  message(data.awaitingSync ? 'Din computer har endnu ikke sendt kvotedata.' : age > 20 * 60 * 1000 ? 'Tallene er ældre end 20 minutter. De opdateres, når din computer synkroniserer igen.' : '');
  renderLimits(data);
  renderCredits(data);
  renderTokens(data);
  renderChart(data);
}
async function update() {
  $('refresh').disabled = true;
  try { render(await api('/api/status')); }
  catch (error) { message(error.message); $('updated').textContent = 'Kunne ikke opdatere'; }
  finally { $('refresh').disabled = false; }
}
$('refresh').addEventListener('click', update);
update();
setInterval(update, 60000);
