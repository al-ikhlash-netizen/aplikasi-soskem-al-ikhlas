/* SOSKEM reference compatibility layer
 * Ground truth: index_5.html
 * This module is intentionally additive: it does not replace the existing UI/state.
 * Include after the existing application script:
 * <script src="./soskem-reference-enhancements.js"></script>
 */
(() => {
  'use strict';

  const KEYS = Object.freeze({
    master: 'soskem_master_kk',
    iuran: 'soskem_log_iuran',
    klaim: 'soskem_log_klaim'
  });
  const FEE = 25000;
  const STARTING_BALANCE = 18127500;
  const PERIODS = [
    'Triwulan 1 (Jan-Mar)',
    'Triwulan 2 (Apr-Jun)',
    'Triwulan 3 (Jul-Sep)',
    'Triwulan 4 (Okt-Des)'
  ];
  const PAGE_SIZE = 15;

  const read = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch (_) { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const rupiah = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  const number = value => Number(String(value ?? '').replace(/[^0-9]/g, '')) || 0;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function currentPeriod(date = new Date()) {
    const month = date.getMonth() + 1;
    if (month <= 3) return PERIODS[0];
    if (month <= 6) return PERIODS[1];
    if (month <= 9) return PERIODS[2];
    return PERIODS[3];
  }

  function formatRupiahInput(value, prefix = 'Rp ') {
    const digits = String(value ?? '').replace(/[^0-9]/g, '');
    return digits ? `${prefix}${Number(digits).toLocaleString('id-ID')}` : '';
  }

  function getData() {
    return {
      master: read(KEYS.master),
      iuran: read(KEYS.iuran),
      klaim: read(KEYS.klaim)
    };
  }

  function normalizeMaster(data) {
    return data.map((item, index) => ({
      kode: String(item.kode || item.code || `ISK18/${String(index + 4).padStart(3, '0')}`).toUpperCase(),
      nomor: String(item.nomor || item.kk || '').trim(),
      nama_kk: item.nama_kk || item.name || `Keluarga ${item.kode || ''}`,
      rw: item.rw || 'RW 18'
    }));
  }

  function statusIuran(kode, period = currentPeriod(), data = getData()) {
    if (data.iuran.some(row => row.kode === kode && row.periode === period)) return 'LANCAR';
    return period === currentPeriod() ? 'BERJALAN' : 'TUNGGAK';
  }

  function totals(data = getData()) {
    const masuk = STARTING_BALANCE + data.iuran.reduce((sum, row) => sum + number(row.nominal), 0);
    const keluar = data.klaim.reduce((sum, row) => sum + number(row.nominal), 0);
    return { masuk, keluar, saldo: masuk - keluar, warga: data.master.length };
  }

  function toast(title, text = '', icon = 'success') {
    if (window.Swal) return Swal.fire(title, text, icon);
    window.alert(text ? `${title}\n${text}` : title);
    return Promise.resolve();
  }

  function confirmAction(title, text) {
    if (window.Swal) return Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, lanjutkan!' });
    return Promise.resolve({ isConfirmed: window.confirm(`${title}\n${text}`) });
  }

  function installLegacyBridge() {
    const existing = window.state;
    if (!existing || !Array.isArray(existing.residents)) return;
    const data = getData();
    if (!data.master.length && existing.residents.length) {
      const master = existing.residents.map((r, i) => ({
        kode: `ISK${String(r.rw || 'RW 18').replace(/\\D/g, '') || '18'}/${String(i + 4).padStart(3, '0')}`,
        nomor: r.kk || '', nama_kk: r.name || '', rw: r.rw || 'RW 18'
      }));
      write(KEYS.master, master);
    }
    if (!data.iuran.length && existing.payments.length) {
      write(KEYS.iuran, existing.payments.map(p => {
        const resident = existing.residents.find(r => r.id === p.residentId) || {};
        return { tanggal: String(p.createdAt || '').slice(0, 10), kode: resident.kode || resident.kk || '', rw: resident.rw || '', periode: p.period || currentPeriod(), nominal: number(p.amount) };
      }));
    }
  }

  function enhanceMoneyInputs(root = document) {
    root.querySelectorAll('input[data-rupiah], input[name="amount"], #setor-nominal').forEach(input => {
      if (input.dataset.rupiahBound) return;
      input.dataset.rupiahBound = '1';
      input.type = 'text';
      input.addEventListener('input', () => { input.value = formatRupiahInput(input.value); });
    });
  }

  function dashboardSnapshot() {
    const data = getData();
    const t = totals(data);
    return {
      ...t,
      byRw: ['RW 18', 'RW 19', 'RW 20'].reduce((result, rw) => {
        const people = data.master.filter(row => row.rw === rw);
        result[rw] = { total: people.length, lancar: people.filter(row => statusIuran(row.kode, currentPeriod(), data) !== 'TUNGGAK').length };
        result[rw].tunggak = result[rw].total - result[rw].lancar;
        return result;
      }, {})
    };
  }

  function renderChart(canvas, snapshot = dashboardSnapshot()) {
    if (!canvas || !window.Chart) return null;
    if (canvas._soskemChart) canvas._soskemChart.destroy();
    canvas._soskemChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['RW 18', 'RW 19', 'RW 20'],
        datasets: [
          { label: 'Lancar / Berjalan', data: ['RW 18', 'RW 19', 'RW 20'].map(rw => snapshot.byRw[rw].lancar), backgroundColor: '#2ecc71', borderRadius: 4 },
          { label: 'Menunggak', data: ['RW 18', 'RW 19', 'RW 20'].map(rw => snapshot.byRw[rw].tunggak), backgroundColor: '#e74c3c', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } }
    });
    return canvas._soskemChart;
  }

  function paginate(items, page = 1, size = PAGE_SIZE) {
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    const safePage = Math.min(Math.max(1, page), totalPages);
    return { items: items.slice((safePage - 1) * size, safePage * size), page: safePage, totalPages, total: items.length };
  }

  function liveSearch(items, query, fields = ['kode', 'nomor', 'nama_kk', 'rw']) {
    const q = String(query || '').trim().toLowerCase();
    return q ? items.filter(row => fields.some(field => String(row[field] ?? '').toLowerCase().includes(q))) : items.slice();
  }

  function exportBackup() {
    const data = getData();
    const blob = new Blob([JSON.stringify({ master_kk: data.master, log_iuran: data.iuran, log_klaim: data.klaim, waktu_backup: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BACKUP_SOSKEM_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  }

  function printClean(element) {
    if (!element) return;
    const previous = document.body.className;
    document.body.classList.add('soskem-print-mode');
    element.classList.add('soskem-print-target');
    window.print();
    element.classList.remove('soskem-print-target');
    document.body.className = previous;
  }

  window.SOSKEMReference = Object.freeze({
    KEYS, FEE, STARTING_BALANCE, PERIODS, PAGE_SIZE,
    read, write, getData, normalizeMaster, statusIuran, totals, dashboardSnapshot,
    currentPeriod, formatRupiahInput, number, rupiah, esc, paginate, liveSearch,
    enhanceMoneyInputs, renderChart, exportBackup, printClean, toast, confirmAction
  });

  document.addEventListener('DOMContentLoaded', () => {
    installLegacyBridge();
    enhanceMoneyInputs();
    const canvas = document.querySelector('#kepatuhanChart, canvas[data-soskem-chart]');
    if (canvas) renderChart(canvas);
  });
})();
