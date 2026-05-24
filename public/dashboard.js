async function fetchStats() {
  try {
    const response = await fetch('/velocity/health');
    const data = await response.json();

    document.getElementById('heapUsed').textContent = data.memory.heapUsed;
    document.getElementById('heapTotal').textContent = data.memory.heapTotal;
    document.getElementById('heapPercentage').textContent = data.memory.heapPercentage;
    const percent = parseFloat(data.memory.heapPercentage);
    document.getElementById('heapProgress').style.width = percent + '%';

    const memoryStatus = document.getElementById('memoryStatus');
    if (percent > 80) {
      memoryStatus.textContent = '🔴';
    } else if (percent > 60) {
      memoryStatus.textContent = '🟡';
    } else {
      memoryStatus.textContent = '🟢';
    }

    document.getElementById('totalRequests').textContent = data.stats.memory.requests;
    document.getElementById('totalErrors').textContent = data.stats.memory.errors;
    document.getElementById('avgResponse').textContent = data.stats.memory.avgResponseTime + ' ms';

    document.getElementById('hitRate').textContent = data.stats.cache.hitRate + '%';
    document.getElementById('cacheEntries').textContent = data.stats.cache.entries;
    document.getElementById('hitProgress').style.width = data.stats.cache.hitRate + '%';

    document.getElementById('uptime').textContent = data.uptime;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

async function fetchMetrics() {
  try {
    const response = await fetch('/velocity/metrics?limit=5');
    const data = await response.json();

    const tbody = document.querySelector('#slowestEndpoints');
    tbody.innerHTML = '';

    if (data.metrics.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">Sin métricas aún</td></tr>';
      return;
    }

    data.metrics.forEach((metric) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${metric.path}</td>
        <td>${metric.duration} ms</td>
        <td>${metric.status}</td>
      `;
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
}

async function clearCache() {
  try {
    const response = await fetch('/velocity/cache/clear', { method: 'POST' });
    const data = await response.json();
    alert(`✅ ${data.message}\n${data.cleared} entries eliminadas`);
    refreshData();
  } catch (error) {
    alert('❌ Error al limpiar cache: ' + error.message);
  }
}

async function forceGC() {
  try {
    const response = await fetch('/velocity/gc', { method: 'POST' });
    const data = await response.json();
    alert(`✅ ${data.message}`);
    setTimeout(() => fetchStats(), 1000);
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

function refreshData() {
  fetchStats();
  fetchMetrics();
}

setInterval(refreshData, 5000);
refreshData();
