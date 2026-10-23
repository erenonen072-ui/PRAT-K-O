(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // Farklı araç listesi değişken adlarıyla uyum sağlamayı dene.
  let allTools = [];

  try {
    allTools =
      window.HESAPGO_TOOLS ||
      window.tools ||
      window.araclar ||
      (typeof HESAPGO_TOOLS !== "undefined" ? HESAPGO_TOOLS : null) ||
      (typeof HESAPGO_BASE !== "undefined" ? HESAPGO_BASE : null) ||
      [];
  } catch {
    allTools = [];
  }

  if (!Array.isArray(allTools)) allTools = [];

  const uniqueTools = [];
  const seen = new Set();

  allTools.forEach((tool) => {
    if (!tool || !tool.slug || !tool.name || seen.has(tool.slug)) return;
    seen.add(tool.slug);
    uniqueTools.push(tool);
  });

  let selectedCategory = "all";
  let searchQuery = "";
  let visibleLimit = 12;

  const iconByType = {
    percentage: "%",
    discount: "％",
    vat: "₺",
    age: "◷",
    "date-difference": "▦",
    average: "∑",
    "weighted-average": "∑",
    words: "Aa",
    characters: "Aa",
    sentences: "¶",
    profit: "↗",
    tip: "₺",
    split: "÷",
    fuel: "◉",
    electricity: "ϟ",
    addition: "+",
    subtraction: "−",
    multiplication: "×",
    division: "÷",
    ratio: "∶",
    "rectangle-area": "▱",
    "rectangle-perimeter": "▢",
    "circle-area": "○",
    "circle-perimeter": "◯",
    "triangle-area": "△",
    hypotenuse: "∠",
    interest: "₺",
    savings: "◇",
    installment: "▤",
    length: "↔",
    weight: "⚖",
    temperature: "°",
    volume: "◫",
    area: "▧",
    speed: "↗",
    storage: "▤",
    paint: "◒",
    tiles: "▦",
    concrete: "▥",
    salary: "₺",
    time: "◷"
  };

  const categoryIcons = {
    "Finans": "₺",
    "Matematik": "∑",
    "Tarih ve Zaman": "◷",
    "Metin": "Aa",
    "Ölçüm": "↔",
    "İnşaat": "▦",
    "Diğer": "✦"
  };

  const categories = [...new Set(
    uniqueTools
      .map((tool) => String(tool.category || "Diğer").trim())
      .filter(Boolean)
  )];

  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .trim();
  }

  function buildCategories() {
    const container = $("categoryList");
    container.replaceChildren();

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "category-chip active";
    allButton.dataset.category = "all";
    allButton.textContent = "Tüm araçlar";
    container.appendChild(allButton);

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-chip";
      button.dataset.category = category;
      button.textContent = category;
      container.appendChild(button);
    });

    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      selectedCategory = button.dataset.category;
      visibleLimit = 12;

      container.querySelectorAll(".category-chip").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("active", active);
        chip.setAttribute("aria-pressed", String(active));
      });

      renderTools();
    });
  }

  function getFilteredTools() {
    return uniqueTools.filter((tool) => {
      const category = String(tool.category || "Diğer");

      const categoryMatches =
        selectedCategory === "all" || category === selectedCategory;

      const searchableText = normalize([
        tool.name,
        tool.description,
        tool.category,
        tool.slug
      ].join(" "));

      const searchMatches =
        !searchQuery || searchableText.includes(normalize(searchQuery));

      return categoryMatches && searchMatches;
    });
  }

  function createToolCard(tool) {
    const link = document.createElement("a");
    link.className = "tool-card";
    link.href = `/arac.html?tool=${encodeURIComponent(tool.slug)}`;

    const top = document.createElement("div");
    top.className = "tool-card-top";

    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = iconByType[tool.type] || categoryIcons[tool.category] || "✦";

    const arrow = document.createElement("span");
    arrow.className = "tool-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

    top.append(icon, arrow);

    const title = document.createElement("h3");
    title.textContent = tool.name;

    const description = document.createElement("p");
    description.textContent =
      tool.description || `${tool.name} aracını kolayca kullan.`;

    const category = document.createElement("span");
    category.className = "tool-category";
    category.textContent = tool.category || "Hesaplama";

    link.append(top, title, description, category);
    return link;
  }

  function renderTools() {
    const grid = $("toolsGrid");
    const noResults = $("noResults");
    const loadMore = $("loadMore");
    const count = $("toolCount");
    const heading = $("toolsHeading");
    const description = $("toolsDescription");

    const filtered = getFilteredTools();
    const visible = filtered.slice(0, visibleLimit);

    grid.replaceChildren();

    count.textContent = `${filtered.length} araç`;

    heading.textContent = searchQuery
      ? "Arama sonuçları"
      : selectedCategory === "all"
        ? "İşini kolaylaştıran araçlar"
        : selectedCategory;

    description.textContent = searchQuery
      ? `"${searchQuery}" araması için bulunan araçlar.`
      : "Kullanmak istediğin aracı seç ve hemen hesaplamaya başla.";

    visible.forEach((tool) => {
      grid.appendChild(createToolCard(tool));
    });

    noResults.hidden = filtered.length > 0;
    grid.hidden = filtered.length === 0;

    loadMore.hidden = filtered.length <= visibleLimit;
    loadMore.textContent = "Daha fazla araç göster ↓";

    if (!uniqueTools.length) {
      grid.hidden = false;
      noResults.hidden = true;

      const message = document.createElement("div");
      message.className = "empty-state";
      message.textContent =
        "Araç listesi yüklenemedi. assets/tools.js dosyasındaki araç listesinin değişken adını kontrol et.";
      grid.appendChild(message);

      count.textContent = "0 araç";
      loadMore.hidden = true;
    }
  }

  $("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    searchQuery = $("searchInput").value.trim();
    selectedCategory = "all";
    visibleLimit = 12;

    $("categoryList").querySelectorAll(".category-chip").forEach((button) => {
      const active = button.dataset.category === "all";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    renderTools();
    $("araclar").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("searchInput").addEventListener("input", () => {
    searchQuery = $("searchInput").value.trim();
    visibleLimit = 12;
    renderTools();
  });

  document.querySelectorAll("[data-search]").forEach((button) => {
    button.addEventListener("click", () => {
      $("searchInput").value = button.dataset.search;
      searchQuery = button.dataset.search;
      selectedCategory = "all";
      visibleLimit = 12;
      renderTools();
      $("araclar").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  $("loadMore").addEventListener("click", () => {
    visibleLimit += 12;
    renderTools();
  });

  $("clearSearch").addEventListener("click", () => {
    $("searchInput").value = "";
    searchQuery = "";
    selectedCategory = "all";
    visibleLimit = 12;

    $("categoryList").querySelectorAll(".category-chip").forEach((button) => {
      const active = button.dataset.category === "all";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    renderTools();
  });

  $("mobileMenuButton").addEventListener("click", () => {
    const button = $("mobileMenuButton");
    const menu = $("mobileNav");
    const isOpen = menu.classList.toggle("open");

    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "✕" : "☰";
  });

  $("mobileNav").querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      $("mobileNav").classList.remove("open");
      $("mobileMenuButton").setAttribute("aria-expanded", "false");
      $("mobileMenuButton").textContent = "☰";
    });
  });

  $("currentYear").textContent = new Date().getFullYear();

  buildCategories();
  renderTools();
})();
