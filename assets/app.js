
const tools = window.HESAPGO_TOOLS || [];

const popularNames = [
  "Yüzde Hesaplama",
  "İndirim Hesaplama",
  "KDV Hesaplama",
  "Yaş Hesaplama",
  "Not Ortalaması",
  "Kelime Sayacı"
];

function createCard(tool) {
  const a = document.createElement("a");
  a.className = "tool-card";
  a.href = "/arac.html?tool=" + encodeURIComponent(tool.slug);

  const title = document.createElement("strong");
  title.textContent = tool.name;

  const desc = document.createElement("small");
  desc.textContent = tool.description || tool.category;

  a.append(title, desc);
  a.dataset.name = (tool.name + " " + tool.category).toLocaleLowerCase("tr-TR");
  return a;
}

function renderTools() {
  const all = document.getElementById("allTools");
  const popular = document.getElementById("popularTools");
  const categories = document.getElementById("categories");

  if (!all || !popular || !categories) return;

  all.replaceChildren();
  popular.replaceChildren();
  categories.replaceChildren();

  tools.forEach(tool => all.appendChild(createCard(tool)));

  tools
    .filter(tool => popularNames.includes(tool.name))
    .forEach(tool => popular.appendChild(createCard(tool)));

  const names = [...new Set(tools.map(tool => tool.category))];

  names.forEach(name => {
    const count = tools.filter(t => t.category === name).length;
    const card = document.createElement("a");
    card.className = "category-card";
    card.href = "/kategori.html?category=" + encodeURIComponent(name);

    const title = document.createElement("strong");
    title.textContent = name;

    const number = document.createElement("small");
    number.textContent = count + " araç";

    card.append(title, number);
    categories.appendChild(card);
  });

  document.getElementById("toolCount").textContent =
    tools.length + " araç listeleniyor.";

  document.getElementById("year").textContent =
    new Date().getFullYear();
}

const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", () => {
    const query = search.value.toLocaleLowerCase("tr-TR");

    document.querySelectorAll("#allTools .tool-card").forEach(card => {
      card.hidden = !card.dataset.name.includes(query);
    });
  });
}

renderTools();
