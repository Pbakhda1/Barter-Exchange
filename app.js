const tabs = document.querySelectorAll(".tab");
const serviceForm = document.getElementById("serviceForm");
const itemForm = document.getElementById("itemForm");

const postServiceBtn = document.getElementById("postServiceBtn");
const postItemBtn = document.getElementById("postItemBtn");

const postSvcMsg = document.getElementById("postSvcMsg");
const postItemMsg = document.getElementById("postItemMsg");

const listingsGrid = document.getElementById("listingsGrid");
const viewFilter = document.getElementById("viewFilter");
const sortFilter = document.getElementById("sortFilter");

const selectedListingEl = document.getElementById("selectedListing");
const proposalHint = document.getElementById("proposalHint");

const offerType = document.getElementById("offerType");
const offerTitle = document.getElementById("offerTitle");
const offerValue = document.getElementById("offerValue");
const offerLocation = document.getElementById("offerLocation");
const offerMsg = document.getElementById("offerMsg");
const sendProposalBtn = document.getElementById("sendProposalBtn");
const proposalMsg = document.getElementById("proposalMsg");

let listings = seedListings();
let selectedId = null;

function seedListings(){
  const now = Date.now();
  return [
    {
      id: cryptoId(),
      type: "service",
      title: "Mow lawn (front + back)",
      category: "Yard Work",
      desc: "I’ll mow and edge. You provide bags if needed.",
      value: 60,
      location: "Phoenix",
      createdAt: now - 1000 * 60 * 25
    },
    {
      id: cryptoId(),
      type: "service",
      title: "Install TV mount + basic setup",
      category: "Home Install",
      desc: "Mount TV to wall (you provide mount). Includes cable tidy.",
      value: 90,
      location: "Phoenix",
      createdAt: now - 1000 * 60 * 40
    },
    {
      id: cryptoId(),
      type: "item",
      title: "Pressure washer (good condition)",
      category: "Tools",
      desc: "Works great. Looking to trade for roof cleaning or yard work.",
      value: 140,
      location: "Phoenix",
      createdAt: now - 1000 * 60 * 55
    }
  ];
}

function cryptoId(){
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}

tabs.forEach(t => {
  t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");

    const tab = t.dataset.tab;
    if (tab === "service"){
      serviceForm.classList.remove("hidden");
      itemForm.classList.add("hidden");
    } else {
      itemForm.classList.remove("hidden");
      serviceForm.classList.add("hidden");
    }
  });
});

postServiceBtn.addEventListener("click", () => {
  const title = document.getElementById("svcTitle").value.trim();
  const category = document.getElementById("svcCategory").value;
  const desc = document.getElementById("svcDesc").value.trim();
  const value = Number(document.getElementById("svcValue").value);
  const location = document.getElementById("svcLocation").value.trim();

  if (!title || !desc || !value || value <= 0 || !location){
    postSvcMsg.textContent = "Please fill out title, description, value, and location.";
    return;
  }

  listings.unshift({
    id: cryptoId(),
    type: "service",
    title, category, desc, value: Math.floor(value), location,
    createdAt: Date.now()
  });

  postSvcMsg.textContent = "Service posted!";
  clearServiceInputs();
  render();
});

postItemBtn.addEventListener("click", () => {
  const title = document.getElementById("itemTitle").value.trim();
  const category = document.getElementById("itemCategory").value;
  const desc = document.getElementById("itemDesc").value.trim();
  const value = Number(document.getElementById("itemValue").value);
  const location = document.getElementById("itemLocation").value.trim();

  if (!title || !desc || !value || value <= 0 || !location){
    postItemMsg.textContent = "Please fill out title, description, value, and location.";
    return;
  }

  listings.unshift({
    id: cryptoId(),
    type: "item",
    title, category, desc, value: Math.floor(value), location,
    createdAt: Date.now()
  });

  postItemMsg.textContent = "Item posted!";
  clearItemInputs();
  render();
});

function clearServiceInputs(){
  document.getElementById("svcTitle").value = "";
  document.getElementById("svcDesc").value = "";
  document.getElementById("svcValue").value = "";
  document.getElementById("svcLocation").value = "";
}

function clearItemInputs(){
  document.getElementById("itemTitle").value = "";
  document.getElementById("itemDesc").value = "";
  document.getElementById("itemValue").value = "";
  document.getElementById("itemLocation").value = "";
}

viewFilter.addEventListener("change", render);
sortFilter.addEventListener("change", render);

function filteredAndSorted(){
  let out = [...listings];

  const view = viewFilter.value;
  if (view !== "all") out = out.filter(x => x.type === view);

  const sort = sortFilter.value;
  if (sort === "newest") out.sort((a,b) => b.createdAt - a.createdAt);
  if (sort === "valueLow") out.sort((a,b) => a.value - b.value);
  if (sort === "valueHigh") out.sort((a,b) => b.value - a.value);

  return out;
}

function render(){
  const list = filteredAndSorted();

  if (list.length === 0){
    listingsGrid.innerHTML = `<div class="empty">No listings match your filter.</div>`;
    return;
  }

  listingsGrid.innerHTML = "";
  for (const l of list){
    const div = document.createElement("div");
    div.className = "listing";

    const typeBadge = l.type === "service" ? "Service" : "Item";
    const selectedBadge = (l.id === selectedId) ? `<span class="badge">Selected</span>` : "";

    div.innerHTML = `
      <div class="listing-top">
        <div>
          <h4>${escapeHtml(l.title)}</h4>
          <div class="badges">
            <span class="badge">${typeBadge}</span>
            <span class="badge">${escapeHtml(l.category)}</span>
            <span class="badge">$${Number(l.value).toFixed(0)} value</span>
            <span class="badge">${escapeHtml(l.location)}</span>
            ${selectedBadge}
          </div>
        </div>
        <button class="btn" data-select="${l.id}">Select</button>
      </div>
      <p>${escapeHtml(l.desc)}</p>
      <div class="actions">
        <button class="btn primary" data-propose="${l.id}">Propose a trade</button>
      </div>
    `;

    listingsGrid.appendChild(div);
  }

  document.querySelectorAll("[data-select]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedId = btn.dataset.select;
      syncSelected();
      render();
    });
  });

  document.querySelectorAll("[data-propose]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedId = btn.dataset.propose;
      syncSelected();
      render();
      document.getElementById("offerTitle").focus();
    });
  });
}

function syncSelected(){
  const listing = listings.find(x => x.id === selectedId);

  if (!listing){
    selectedListingEl.textContent = "None selected.";
    proposalHint.textContent = "Select a listing to propose a trade.";
    sendProposalBtn.disabled = true;
    return;
  }

  selectedListingEl.innerHTML = `
    <div><strong>${escapeHtml(listing.title)}</strong></div>
    <div class="muted">${listing.type === "service" ? "Service" : "Item"} • ${escapeHtml(listing.category)} • $${listing.value} • ${escapeHtml(listing.location)}</div>
    <div class="muted">${escapeHtml(listing.desc)}</div>
  `;

  proposalHint.textContent = "Fill your offer details and send a proposal.";
  sendProposalBtn.disabled = false;
  proposalMsg.textContent = "";
}

sendProposalBtn.addEventListener("click", () => {
  const listing = listings.find(x => x.id === selectedId);
  if (!listing) return;

  const myType = offerType.value;
  const myTitle = offerTitle.value.trim();
  const myValue = Number(offerValue.value);
  const myLoc = offerLocation.value.trim();
  const myMsg = offerMsg.value.trim();

  if (!myTitle || !myValue || myValue <= 0 || !myLoc || !myMsg){
    proposalMsg.textContent = "Please fill offer title, value, location, and message.";
    return;
  }

  // Fairness rule: if trading for an ITEM listing, require equal-or-greater value
  if (listing.type === "item" && myType === "item" && myValue < listing.value){
    proposalMsg.textContent = `Your item value ($${Math.floor(myValue)}) must be equal or greater than the listed item value ($${listing.value}).`;
    return;
  }

  proposalMsg.textContent = "Proposal sent (demo). In production, this would open secure messaging.";
  offerMsg.value = "";
});

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[s]));
}

render();
syncSelected();
