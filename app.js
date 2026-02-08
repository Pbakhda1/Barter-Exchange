const listingsGrid = document.getElementById("listingsGrid");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");

const postBtn = document.getElementById("postBtn");
const resetBtn = document.getElementById("resetBtn");
const postStatus = document.getElementById("postStatus");

const titleInput = document.getElementById("titleInput");
const categoryInput = document.getElementById("categoryInput");
const valueInput = document.getElementById("valueInput");
const wantInput = document.getElementById("wantInput");
const detailsInput = document.getElementById("detailsInput");

const durationWrap = document.getElementById("durationWrap");
const durationInput = document.getElementById("durationInput");
const durationCustom = document.getElementById("durationCustom");

const offerTarget = document.getElementById("offerTarget");
const offerInput = document.getElementById("offerInput");
const offerValueInput = document.getElementById("offerValueInput");
const sendOfferBtn = document.getElementById("sendOfferBtn");
const clearOfferBtn = document.getElementById("clearOfferBtn");
const offerResult = document.getElementById("offerResult");

const targetValue = document.getElementById("targetValue");
const offerValue = document.getElementById("offerValue");
const calcBtn = document.getElementById("calcBtn");
const fillExampleBtn = document.getElementById("fillExampleBtn");
const calcResult = document.getElementById("calcResult");

const hoursInput = document.getElementById("hoursInput");
const rateInput = document.getElementById("rateInput");
const itemAddInput = document.getElementById("itemAddInput");
const bundleBtn = document.getElementById("bundleBtn");
const bundleToOfferBtn = document.getElementById("bundleToOfferBtn");
const bundleResult = document.getElementById("bundleResult");

let selectedListingId = null;
let lastBundleValue = null;

function getListingType() {
  const checked = document.querySelector('input[name="listingType"]:checked');
  return checked ? checked.value : "service";
}

function nowId() {
  return String(Date.now()) + String(Math.floor(Math.random()*1000));
}

function loadUserListings() {
  try {
    const raw = localStorage.getItem("bx_listings_v2");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserListings(list) {
  localStorage.setItem("bx_listings_v2", JSON.stringify(list));
}

const demoListings = [
  {
    id: "d1",
    type: "service",
    category: "home",
    title: "Lawn mowing (front + backyard)",
    value: 45,
    want: "Trade for TV installation help or equal value item",
    details: "45–60 minutes. Bring your mower or use mine.",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*10
  },
  {
    id: "d2",
    type: "service",
    category: "handyman",
    title: "TV mount installation (standard wall)",
    value: 120,
    want: "Trade for cleaning service, tools, or equal value item",
    details: "Includes leveling + basic setup. Mount not included.",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*22
  },
  {
    id: "d3",
    type: "service",
    category: "cleaning",
    title: "Roof / gutter cleaning (small home)",
    value: 160,
    want: "Trade for painting help or high-value item",
    details: "Safety-first. Weather dependent. Ladder required.",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*30
  },
  {
    id: "d4",
    type: "item",
    category: "items",
    title: "Tool set (new) — 100+ pieces",
    value: 85,
    want: "Trade for 2 hours of painting or similar value item",
    details: "Sealed box. Great for DIY.",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*12
  },
  {
    id: "d5",
    type: "house",
    category: "housing",
    title: "House swap — 2 weeks (private room + kitchen access)",
    value: 600,
    want: "Swap with similar space or service+item bundle",
    details: "Duration flexible. Requires ID + rules checklist + deposit (production feature).",
    duration: "2 weeks",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*8
  },
  {
    id: "d6",
    type: "platonic",
    category: "community",
    title: "Museum buddy (platonic) — 2 hours",
    value: 30,
    want: "Trade for a small item or service help (platonic only)",
    details: "Strictly platonic companionship. No adult content or romantic services.",
    location: "Local",
    postedAt: Date.now() - 1000*60*60*16
  }
];

function allListings() {
  return [...loadUserListings(), ...demoListings];
}

function labelType(t) {
  if (t === "service") return "Service";
  if (t === "item") return "Item";
  if (t === "house") return "House Swap";
  if (t === "platonic") return "Platonic";
  return "Listing";
}

function labelCat(c) {
  return ({
    home: "Home Services",
    handyman: "Handyman",
    cleaning: "Cleaning",
    moving: "Moving Help",
    tech: "Tech Help",
    items: "Items",
    housing: "Housing",
    community: "Community"
  }[c] || "Other");
}

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  const hours = Math.max(1, Math.floor(diff / (1000*60*60)));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[s]));
}

function applyFilters(list) {
  const type = typeFilter.value;
  const cat = categoryFilter.value;
  const q = searchInput.value.trim().toLowerCase();

  let out = list;

  if (type !== "all") out = out.filter(x => x.type === type);
  if (cat !== "all") out = out.filter(x => x.category === cat);

  if (q) {
    out = out.filter(x =>
      (x.title || "").toLowerCase().includes(q) ||
      (x.want || "").toLowerCase().includes(q) ||
      (x.details || "").toLowerCase().includes(q) ||
      (x.duration || "").toLowerCase().includes(q)
    );
  }

  const sort = sortFilter.value;
  if (sort === "newest") out = out.sort((a,b) => b.postedAt - a.postedAt);
  if (sort === "valueHigh") out = out.sort((a,b) => b.value - a.value);
  if (sort === "valueLow") out = out.sort((a,b) => a.value - b.value);

  return out;
}

function renderListings() {
  const list = applyFilters(allListings());
  listingsGrid.innerHTML = "";

  if (list.length === 0) {
    listingsGrid.innerHTML = `<div class="callout"><strong>No results:</strong> Try different filters or search terms.</div>`;
    return;
  }

  list.forEach(item => {
    const selected = item.id === selectedListingId;
    const durationLine = item.type === "house" && item.duration ? ` • Duration: ${escapeHtml(item.duration)}` : "";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id;

    card.innerHTML = `
      <div style="font-weight:900; display:flex; justify-content:space-between; gap:10px;">
        <span>${escapeHtml(item.title)}</span>
        <span class="badge" style="${selected ? "border-color: rgba(94,234,212,.35); background: rgba(94,234,212,.10);" : ""}">
          ${selected ? "Selected" : labelType(item.type)}
        </span>
      </div>

      <div class="meta">${labelCat(item.category)} • ${escapeHtml(item.location)}${durationLine} • ${formatTimeAgo(item.postedAt)}</div>

      <div class="value">$${Number(item.value).toFixed(0)} <span class="muted" style="font-size:12px;font-weight:800;">estimated value</span></div>

      <div class="badges">
        <div class="badge">Wants: ${escapeHtml(item.want)}</div>
      </div>

      <div class="meta" style="margin-top:10px;">
        ${escapeHtml(item.details)}
      </div>
    `;

    card.addEventListener("click", () => selectListing(item.id));
    listingsGrid.appendChild(card);
  });
}

function selectListing(id) {
  selectedListingId = id;

  const listing = allListings().find(x => x.id === id);
  if (!listing) return;

  const durationLine = (listing.type === "house" && listing.duration) ? ` • Duration: ${escapeHtml(listing.duration)}` : "";

  offerTarget.innerHTML = `
    <div class="offer-title">${escapeHtml(listing.title)}</div>
    <div class="offer-meta muted">
      Type: ${labelType(listing.type)} • Category: ${labelCat(listing.category)} • Value: $${Number(listing.value).toFixed(0)}${durationLine}<br/>
      Wants: ${escapeHtml(listing.want)}
    </div>
  `;

  sendOfferBtn.disabled = false;
  clearOfferBtn.disabled = false;
  offerResult.innerHTML = `<strong>Status:</strong> Enter your offer and value estimate, then send.`;
  renderListings();
}

function resetOffer() {
  offerInput.value = "";
  offerValueInput.value = "";
  offerResult.innerHTML = `<strong>Status:</strong> Select a listing to compare value and send an offer.`;
  sendOfferBtn.disabled = !selectedListingId;
  clearOfferBtn.disabled = !selectedListingId;
}

sendOfferBtn.addEventListener("click", () => {
  const listing = allListings().find(x => x.id === selectedListingId);
  if (!listing) return;

  const offerText = offerInput.value.trim();
  const val = Number(offerValueInput.value);

  if (!offerText || !val || val <= 0) {
    offerResult.innerHTML = `<strong>Status:</strong> Please enter an offer description and value estimate.`;
    return;
  }

  const accepted = val >= Number(listing.value);
  const diff = val - Number(listing.value);

  if (accepted) {
    offerResult.innerHTML = `<strong>Accepted (demo):</strong> Your offer meets the equal-or-greater value rule (+$${diff.toFixed(0)}).`;
  } else {
    offerResult.innerHTML = `<strong>Not enough value (demo):</strong> Add $${Math.abs(diff).toFixed(0)} more value (bundle items or more service hours).`;
  }
});

clearOfferBtn.addEventListener("click", resetOffer);

function onTypeChange() {
  const t = getListingType();
  if (t === "house") {
    durationWrap.classList.remove("hidden");
  } else {
    durationWrap.classList.add("hidden");
    durationCustom.classList.add("hidden");
  }
}

document.querySelectorAll('input[name="listingType"]').forEach(r =>
  r.addEventListener("change", onTypeChange)
);

durationInput.addEventListener("change", () => {
  if (durationInput.value === "Custom") durationCustom.classList.remove("hidden");
  else durationCustom.classList.add("hidden");
});

postBtn.addEventListener("click", () => {
  const t = getListingType();
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const value = Number(valueInput.value);
  const want = wantInput.value.trim();
  const details = detailsInput.value.trim();

  if (!title || !want || !details || !value || value <= 0) {
    postStatus.textContent = "Please fill in title, category, value, what you want, and details.";
    return;
  }

  let duration = null;
  if (t === "house") {
    duration = durationInput.value === "Custom" ? durationCustom.value.trim() : durationInput.value;
    if (!duration) {
      postStatus.textContent = "Please set a house swap duration.";
      return;
    }
  }

  if (t === "platonic") {
    // enforce a safety reminder in the listing details
    if (!details.toLowerCase().includes("platonic")) {
      postStatus.textContent = "For Companionship listings, include the word 'platonic' in details.";
      return;
    }
  }

  const newItem = {
    id: nowId(),
    type: t,
    category,
    title,
    value: Math.floor(value),
    want,
    details,
    duration,
    location: "Local",
    postedAt: Date.now()
  };

  const userList = loadUserListings();
  userList.unshift(newItem);
  saveUserListings(userList);

  postStatus.textContent = "Posted! Scroll to Marketplace to see it.";
  titleInput.value = "";
  valueInput.value = "";
  wantInput.value = "";
  detailsInput.value = "";
  if (t === "house") {
    durationInput.value = "1 week";
    durationCustom.value = "";
    durationCustom.classList.add("hidden");
  }

  renderListings();
});

resetBtn.addEventListener("click", () => {
  titleInput.value = "";
  valueInput.value = "";
  wantInput.value = "";
  detailsInput.value = "";
  durationInput.value = "1 week";
  durationCustom.value = "";
  durationCustom.classList.add("hidden");
  postStatus.textContent = "Reset. Fill in your listing details.";
});

calcBtn.addEventListener("click", () => {
  const t = Number(targetValue.value);
  const o = Number(offerValue.value);
  if (!t || !o || t <= 0 || o <= 0) {
    calcResult.innerHTML = `<strong>Result:</strong> Please enter positive numbers for both values.`;
    return;
  }
  const diff = o - t;
  if (diff >= 0) {
    calcResult.innerHTML = `<strong>Match:</strong> Your offer meets the equal-or-greater value rule (+$${diff.toFixed(0)}).`;
  } else {
    calcResult.innerHTML = `<strong>Short:</strong> Add $${Math.abs(diff).toFixed(0)} more value to match.`;
  }
});

fillExampleBtn.addEventListener("click", () => {
  targetValue.value = 120;
  offerValue.value = 150;
  calcResult.innerHTML = `<strong>Result:</strong> Example filled. Click “Check match”.`;
});

bundleBtn.addEventListener("click", () => {
  const hours = Number(hoursInput.value) || 0;
  const rate = Number(rateInput.value) || 0;
  const itemVal = Number(itemAddInput.value) || 0;

  const bundle = (hours * rate) + itemVal;
  lastBundleValue = bundle;

  bundleResult.innerHTML = `<strong>Bundle value:</strong> $${bundle.toFixed(0)} (hours: ${hours} × $${rate} + items: $${itemVal})`;
  bundleToOfferBtn.disabled = !(bundle > 0);
});

bundleToOfferBtn.addEventListener("click", () => {
  if (!selectedListingId) {
    bundleResult.innerHTML = `<strong>Tip:</strong> Select a listing in Marketplace first, then apply bundle value.`;
    return;
  }
  offerValueInput.value = String(Math.floor(lastBundleValue || 0));
  offerInput.value = offerInput.value || "Bundle offer (service hours + item value)";
  offerResult.innerHTML = `<strong>Status:</strong> Bundle value applied to your offer. Click “Send offer”.`;
});

[typeFilter, categoryFilter, sortFilter].forEach(el => el.addEventListener("change", renderListings));
searchInput.addEventListener("input", renderListings);

// initial
onTypeChange();
renderListings();
