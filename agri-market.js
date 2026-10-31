(() => {
  const page = (location.pathname.split('/').pop() || '1.html').toLowerCase();
  const storage = {
    listingsHtml: 'agriMarketListingsHtml',
    adminDraft: 'agriMarketAdminDraft',
    language: 'agriMarketLanguage',
  };

  const routes = {
    '1.html': '1.html',
    '2.html': '2.html',
    '3.html': '3.html',
    '4.html': '4.html',
    '5.html': '5.html',
  };

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function toast(message) {
    let host = document.getElementById('agri-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'agri-toast-host';
      host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.textContent = message;
    item.style.cssText = 'background:#1b5e20;color:#fff;padding:12px 16px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.16);font:600 14px Inter, sans-serif;max-width:320px;pointer-events:none;transform:translateY(8px);opacity:0;transition:all .25s ease;';
    host.appendChild(item);
    requestAnimationFrame(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(8px)';
      setTimeout(() => item.remove(), 250);
    }, 2600);
  }

  function setActiveLinks() {
    const current = routes[page] || page;
    document.querySelectorAll('a[href$=".html"]').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      const isCurrent = href === current;
      a.dataset.active = isCurrent ? 'true' : 'false';
      if (isCurrent) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function bindTextButtons(matchText, handler) {
    document.querySelectorAll('button').forEach((btn) => {
      const label = normalize(btn.textContent);
      if (label.includes(normalize(matchText))) {
        btn.addEventListener('click', handler);
      }
    });
  }

  function buttonLabel(btn) {
    return normalize(btn?.textContent || btn?.innerText || btn?.title || '');
  }

  function navTo(url, message) {
    if (message) toast(message);
    setTimeout(() => { location.href = url; }, 120);
  }

  function initDashboard() {
    bindTextButtons('list new crop', () => navTo('4.html', 'Opening crop listings…'));
    bindTextButtons('view ledger', () => navTo('4.html', 'Opening inventory ledger…'));
    bindTextButtons('configure alerts', () => navTo('5.html', 'Opening alert controls…'));
    bindTextButtons('view all', () => navTo('2.html', 'Showing the full mandi feed…'));
    bindTextButtons('reply now', () => toast('Reply drafted.'));
    bindTextButtons('details', () => navTo('3.html', 'Opening market details…'));

    const translateBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('hindi/english'));
    if (translateBtn) {
      translateBtn.addEventListener('click', () => {
        const mode = (localStorage.getItem(storage.language) || 'en') === 'en' ? 'hi' : 'en';
        localStorage.setItem(storage.language, mode);
        translateBtn.querySelectorAll('span').forEach((s) => {
          if (normalize(s.textContent).includes('hindi/english')) {
            s.textContent = mode === 'en' ? 'Hindi/English' : 'हिंदी/English';
          }
        });
        toast(mode === 'en' ? 'Language set to English.' : 'भाषा हिंदी में बदल दी गई।');
      });
    }

    bindTextButtons('notifications', () => toast('You have 3 new updates.'));
  }

  function initMandiFinder() {
    const searchBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('search mandis'));
    const locationInput = document.querySelector('input[type="text"]');
    const cropSelect = document.querySelector('select');
    const resultBadge = [...document.querySelectorAll('span')].find((s) => /results found/i.test(s.textContent || ''));
    const cardNodes = [...document.querySelectorAll('main .md\\:col-span-4 .cursor-pointer')];
    const tableRows = [...document.querySelectorAll('tbody tr')];

    function applyFilters() {
      const query = normalize(locationInput?.value || '');
      const crop = normalize(cropSelect?.value || 'all');
      let visibleCards = 0;

      cardNodes.forEach((card) => {
        const text = normalize(card.textContent);
        const show = !query || text.includes(query.split(' ')[0]) || text.includes('haryana') || text.includes('karnal') || text.includes('hisar') || text.includes('rohtak');
        card.style.display = show ? '' : 'none';
        if (show) visibleCards += 1;
      });

      tableRows.forEach((row) => {
        const text = normalize(row.textContent);
        const cropMatch = crop === 'all' || text.includes(crop.split(' ')[0]) || text.includes('wheat') || text.includes('mustard') || text.includes('basmati');
        const locationMatch = !query || text.includes(query.split(',')[0]) || text.includes(query.split(' ')[0]);
        row.style.display = cropMatch && locationMatch ? '' : 'none';
      });

      if (resultBadge) resultBadge.textContent = `${visibleCards} Results Found`;
      toast(`Showing ${visibleCards} nearby mandis.`);
    }

    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    locationInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyFilters();
    });
    cropSelect?.addEventListener('change', applyFilters);

    [...document.querySelectorAll('button')].forEach((btn) => {
      const label = buttonLabel(btn);
      if (label === 'call') {
        btn.addEventListener('click', () => toast('Calling the mandi office…'));
      }
      if (label === 'route') {
        btn.addEventListener('click', () => toast('Opening route directions…'));
      }
      if (label === 'map') {
        btn.addEventListener('click', () => toast('Refreshing the live mandi map…'));
      }
      if (label === 'today' || label === 'last 7 days') {
        btn.addEventListener('click', () => {
          document.querySelectorAll('button').forEach((b) => {
            const t = buttonLabel(b);
            if (t === 'today' || t === 'last 7 days') {
              b.classList.remove('bg-surface-container-lowest', 'border', 'border-outline-variant/10', 'rounded-lg', 'text-xs', 'font-bold', 'text-primary', 'shadow-sm');
              b.classList.add('text-on-surface-variant');
            }
          });
          btn.classList.add('bg-surface-container-lowest', 'border', 'border-outline-variant/10', 'rounded-lg', 'text-xs', 'font-bold', 'text-primary', 'shadow-sm');
          btn.classList.remove('text-on-surface-variant');
          toast(`${btn.textContent.trim()} view selected.`);
        });
      }
    });

    applyFilters();
  }

  function initMarketplace() {
    const cardsGrid = document.querySelector('.editorial-grid');
    if (!cardsGrid) return;
    const cards = [...cardsGrid.children];
    const sortSelect = document.querySelector('select');
    const updateBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('update search'));
    const prevBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('chevron_left'));
    const nextBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('chevron_right'));
    const cropInputs = [...document.querySelectorAll('aside input[type="checkbox"]')].slice(0, 3);
    const districtInputs = [...document.querySelectorAll('aside input[type="checkbox"]')].slice(3);

    const originalOrder = [...cards];

    function getCardText(card) {
      return normalize(card.textContent);
    }

    function priceOf(card) {
      const m = card.textContent.replace(/,/g, '').match(/₹\s*([0-9]+(?:\.[0-9]+)?)/);
      return m ? Number(m[1]) : 0;
    }

    function cropCategory(cardText) {
      if (/mustard|oilseed/i.test(cardText)) return 'oilseeds';
      if (/wheat|basmati|rice|grain/i.test(cardText)) return 'grains';
      return 'pulses';
    }

    function district(cardText) {
      if (/karnal/i.test(cardText)) return 'karnal';
      if (/kurukshetra/i.test(cardText)) return 'kurukshetra';
      if (/rohtak/i.test(cardText)) return 'rohtak';
      return 'other';
    }

    function render() {
      const selectedCrops = cropInputs.filter((i) => i.checked).map((i) => normalize(i.closest('label')?.textContent));
      const selectedDistricts = districtInputs.filter((i) => i.checked).map((i) => normalize(i.closest('label')?.textContent));

      const visibleCards = cards.filter((card) => {
        const text = getCardText(card);
        const cropOk = !selectedCrops.length || selectedCrops.some((label) => {
          if (label.includes('grain')) return cropCategory(text) === 'grains';
          if (label.includes('pulse')) return cropCategory(text) === 'pulses';
          if (label.includes('oilseed')) return cropCategory(text) === 'oilseeds';
          return true;
        });
        const districtOk = !selectedDistricts.length || selectedDistricts.some((label) => {
          if (label.includes('karnal')) return district(text) === 'karnal';
          if (label.includes('kurukshetra')) return district(text) === 'kurukshetra';
          if (label.includes('rohtak')) return district(text) === 'rohtak';
          return true;
        });
        card.style.display = cropOk && districtOk ? '' : 'none';
        return cropOk && districtOk;
      });

      const order = normalize(sortSelect?.value || '');
      if (order.includes('low to high')) {
        [...visibleCards].sort((a, b) => priceOf(a) - priceOf(b)).forEach((card) => cardsGrid.appendChild(card));
      } else {
        originalOrder.forEach((card) => cardsGrid.appendChild(card));
      }

      toast(`Marketplace updated: ${visibleCards.length} listings visible.`);
    }

    cropInputs.concat(districtInputs).forEach((input) => input.addEventListener('change', render));
    sortSelect?.addEventListener('change', render);
    updateBtn?.addEventListener('click', render);

    [...document.querySelectorAll('button')].forEach((btn) => {
      const label = buttonLabel(btn);
      if (label.includes('contact verified farmer')) {
        btn.addEventListener('click', () => toast('Opening buyer contact details…'));
      }
    });

    prevBtn?.addEventListener('click', () => {
      const last = cardsGrid.lastElementChild;
      if (last) cardsGrid.prepend(last);
      toast('Moved to previous produce highlight.');
    });
    nextBtn?.addEventListener('click', () => {
      const first = cardsGrid.firstElementChild;
      if (first) cardsGrid.append(first);
      toast('Moved to next produce highlight.');
    });

    render();
  }

  function createListingRow({ name, qty, origin, current, expected, status }) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-fixed-dim flex items-center justify-center text-primary-container">
            <span class="material-symbols-outlined text-xl">agriculture</span>
          </div>
          <div>
            <div class="font-bold text-primary">${name}</div>
            <div class="text-[10px] uppercase tracking-widest text-on-surface-variant">New Listing</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-5 text-sm text-on-surface-variant">
        <div class="font-bold text-on-surface">${qty}</div>
        <div>${origin}</div>
      </td>
      <td class="px-6 py-5 text-sm text-on-surface-variant">
        <div class="font-bold text-on-surface">${current}</div>
        <div>Current Mandi Rate</div>
      </td>
      <td class="px-6 py-5 text-sm text-on-surface-variant">
        <div class="font-bold text-on-surface">${expected}</div>
        <div>${status}</div>
      </td>
      <td class="px-6 py-5">
        <div class="flex gap-2">
          <button class="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-white transition-all flex items-center justify-center" title="Edit Metrics">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button class="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-secondary hover:text-white transition-all flex items-center justify-center" title="Mark as Sold">
            <span class="material-symbols-outlined text-sm">check_circle</span>
          </button>
          <button class="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error hover:text-white transition-all flex items-center justify-center" title="Delete">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </td>`;
    return tr;
  }

  function initListings() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    const buttons = [...document.querySelectorAll('button')];
    const newRowKey = storage.listingsHtml;
    const saved = localStorage.getItem(newRowKey);
    if (saved) tbody.innerHTML = saved;

    function save() {
      localStorage.setItem(newRowKey, tbody.innerHTML);
    }

    function promptNewListing() {
      const name = prompt('Crop name', 'New Crop Listing');
      if (!name) return;
      const qty = prompt('Quantity', '50 Quintals') || '50 Quintals';
      const origin = prompt('Origin', 'Rohtak, Haryana') || 'Rohtak, Haryana';
      const current = prompt('Current rate', '₹3,100 /quintal') || '₹3,100 /quintal';
      const expected = prompt('Expected price', '₹3,350 /quintal') || '₹3,350 /quintal';
      const status = prompt('Status', 'Live') || 'Live';
      tbody.appendChild(createListingRow({ name, qty, origin, current, expected, status }));
      save();
      toast('New listing added.');
    }

    tbody.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;
      const row = btn.closest('tr');
      if (!row) return;
      const title = normalize(btn.title || btn.textContent);
      const cropCell = row.children[0];
      const qtyCell = row.children[1];
      const currentCell = row.children[2];
      const expectedCell = row.children[3];

      if (title.includes('edit')) {
        const name = prompt('Update crop name', cropCell?.innerText.split('\n')[0].trim() || 'Updated Listing');
        const current = prompt('Update current rate', currentCell?.innerText.split('\n')[0].trim() || '₹0 /quintal');
        if (name && cropCell.querySelector('.font-bold')) cropCell.querySelector('.font-bold').textContent = name;
        if (current && currentCell.querySelector('.font-bold')) currentCell.querySelector('.font-bold').textContent = current;
        toast('Listing updated.');
      } else if (title.includes('sold') || title.includes('check_circle')) {
        row.classList.toggle('opacity-60');
        row.classList.toggle('bg-green-50');
        if (expectedCell) {
          const lines = expectedCell.querySelectorAll('div');
          if (lines[1]) lines[1].textContent = row.classList.contains('bg-green-50') ? 'Sold' : 'Live';
        }
        toast('Listing status changed.');
      } else if (title.includes('delete')) {
        if (confirm('Delete this listing?')) {
          row.remove();
          toast('Listing removed.');
        }
      }
      save();
    });

    buttons.forEach((btn) => {
      const label = buttonLabel(btn);
      if (label.includes('list new crop') || label.includes('list new harvest') || label.includes('add detailed listing')) {
        btn.addEventListener('click', promptNewListing);
      }
      if (label.includes('hindi/english')) {
        btn.addEventListener('click', () => toast('Language toggle is ready.'));
      }
    });

    save();
  }

  function initAdmin() {
    const inputs = [...document.querySelectorAll('input[type="text"]')];
    const select = document.querySelector('select');
    const draftBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('save as local draft'));
    const submitBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('submit to state exchange'));
    const reportBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('generate report'));
    const manageBtn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('manage all hr tradelinks'));

    const saved = JSON.parse(localStorage.getItem(storage.adminDraft) || 'null');
    if (saved?.inputs?.length) {
      inputs.forEach((input, i) => { if (saved.inputs[i] != null) input.value = saved.inputs[i]; });
      if (select && saved.select) select.value = saved.select;
    }

    function currentDraft() {
      return {
        inputs: inputs.map((i) => i.value),
        select: select?.value || '',
      };
    }

    function saveDraft(message = 'Draft saved locally.') {
      localStorage.setItem(storage.adminDraft, JSON.stringify(currentDraft()));
      toast(message);
    }

    inputs.forEach((input) => input.addEventListener('input', () => localStorage.setItem(storage.adminDraft, JSON.stringify(currentDraft()))));
    select?.addEventListener('change', () => localStorage.setItem(storage.adminDraft, JSON.stringify(currentDraft())));

    draftBtn?.addEventListener('click', () => saveDraft('Draft saved locally.'));
    submitBtn?.addEventListener('click', () => {
      localStorage.setItem(storage.adminDraft, JSON.stringify(currentDraft()));
      toast('Submitted to the state exchange.');
    });
    reportBtn?.addEventListener('click', () => {
      const report = [
        'AgriMarket Haryana Price Report',
        `Window: ${select?.value || 'Current'}`,
        '',
        ...inputs.map((input, i) => `Band ${i + 1}: ${input.value}`),
      ].join('\n');
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agri-market-report.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Report downloaded.');
    });
    manageBtn?.addEventListener('click', () => navTo('2.html', 'Opening district trade links…'));

    document.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;
      const icon = normalize(btn.querySelector('.material-symbols-outlined')?.textContent || '');
      if (icon === 'close' || icon === 'check') {
        const card = btn.closest('div.bg-surface-container-lowest.p-4, div.bg-surface-container-lowest.p-5');
        if (card && card.textContent.includes('Trader')) {
          if (icon === 'close') {
            card.style.display = 'none';
            toast('Verification rejected.');
          } else {
            card.style.opacity = '0.55';
            toast('Verification approved.');
          }
        }
      }
      if (buttonLabel(btn).includes('notifications')) {
        toast('No new authority alerts.');
      }
      if (buttonLabel(btn) === 'en') {
        toast('English mode selected.');
      }
      if (buttonLabel(btn) === 'hr') {
        toast('Hindi/Haryanvi mode selected.');
      }
    });
  }

  function initCommon() {
    setActiveLinks();
    const language = localStorage.getItem(storage.language);
    if (language === 'hi') {
      const btn = [...document.querySelectorAll('button')].find((b) => buttonLabel(b).includes('hindi/english'));
      if (btn) btn.querySelectorAll('span').forEach((s) => { if (/hindi\/english/i.test(s.textContent || '')) s.textContent = 'हिंदी/English'; });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCommon();
    if (page === '1.html') initDashboard();
    if (page === '2.html') initMandiFinder();
    if (page === '3.html') initMarketplace();
    if (page === '4.html') initListings();
    if (page === '5.html') initAdmin();
  });
})();