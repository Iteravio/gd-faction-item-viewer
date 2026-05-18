document.getElementById("all-factions-area").style.visibility = "hidden";

let items = [];

let selectedLevelMin = 0;
let selectedLevelMax = 90;
let activeFilter = "all_augments";
let showPotent = true;

const searchInput = document.getElementById("searchInput");
let searchQuery = "";

const itemTypeMetadata = {
    "accessory_augment": { label: "Ring/Amulet",            color: "#fff62c" },
    "weapon_augment":    { label: "Weapon/Shield/Off-hand", color: "#fff62c" },
    "2h_weapon_augment": { label: "2H Weapon Only",         color: "#fff62c" },
    "armor_augment":     { label: "All Armor",              color: "#fff62c" }
}

const colorTextMetadata = {
    "elemental": "#fff62c",
    "fire": "#f3a44d",
    "burn": "#f3a44d",
    "cold": "#00ffff",
    "lightning": "#6a91e0",
    "electrocute": "#6a91e0",
    "poison": "#92cc00",
    "acid": "#92cc00",
    "pierce": "#ff4200",
    "piercing": "#ff4200",
    "bleeding": "#ff1e00",
    "vitality": "#800000",
    "aether": "#80ffd5",
    "chaos": "#bd94c6",
    "physical": "#f1e78c",
    "trauma": "#f1e78c",
    "health": "#ff69b5",
    "physique": "#ff69b5",
    "spirit": "#ff69b5",
    "constitution": "#ff69b5",
    "healing": "#38592e",
    "all damage": "#38592e",
    "offensive": "#38592e",
    "defensive": "#38592e",
    "armor": "#38592e",
    "energy": "#38592e",
    "speed": "#38592e",
    "block": "#38592e",
    "retaliation": "#38592e",
    "stun": "#38592e",
    "slow": "#38592e",
    "freeze": "#38592e",
    "petrify": "#38592e",
    "entrapment": "#38592e",
    "reduced": "#38592e",
    "reduction": "#38592e",
    "confuse": "#38592e",
    "damage to": "#38592e",
    "less damage": "#38592e"
};

fetch ("items_db.json")
    .then(response => response.json())
    .then(data => {
        items = data;
        render_faction_items(items);
        document.getElementById("all-factions-area").style.visibility = "";
    });

function render_faction_items(filteredItems) {
    document.querySelectorAll(".faction-items").forEach(container => {
        container.innerHTML = "";
    })

    document.querySelectorAll(".faction-items").forEach(container => {
        const factionName = container.closest("[id$='-area").querySelector("h3").textContent;
        const factionItems = filteredItems.filter(item => item.faction === factionName);

        factionItems.forEach(item => {
            container.appendChild(create_item_card(item));
        });
    });

    updateFactionAreasVisibility()
}

function getStatColor (text) {
    const lowercaseText = text.toLowerCase()
    
    for (const [key, color] of Object.entries(colorTextMetadata)) {
        if (lowercaseText.includes(key)) {
            return color;
        }
    }

    return "";
}

function create_item_card(item) {
    const card = document.createElement("div");
    card.className = "item-card";

    const titleRow = document.createElement("div");
    titleRow.className = "item-title-row";

    const title = document.createElement("h4");
    title.textContent = item.name;
    title.title = item.name;
    titleRow.appendChild(title);

    const reputationBadge = document.createElement("span");
    reputationBadge.className = `reputation-badge ${item.required_reputation}`;
    reputationBadge.textContent = item.required_reputation.charAt(0).toUpperCase();
    titleRow.appendChild(reputationBadge)

    const augmentType = document.createElement("div");
    augmentType.className = "augment-type"
    augmentType.textContent = itemTypeMetadata[item.item_type].label;
    if (item.name.startsWith("Potent ")) {
        augmentType.textContent = itemTypeMetadata["2h_weapon_augment"].label;
    }

    const imgAndStats = document.createElement("div");
    imgAndStats.className = "item-img-and-stats"

    const img = document.createElement("div");
    img.className = "item-img";

    if (item.sprite) {
        img.style.width = item.sprite.width;
        img.style.height = item.sprite.height;
        img.style.backgroundPosition = item.sprite.background_position;
        imgAndStats.appendChild(img);
    }

    const allStatsArea = document.createElement("div");
    allStatsArea.className = "all-stats-area"

    if (item.stats.player.length > 0) {
        const playerStatsSection = document.createElement("div");
        playerStatsSection.className = "player-stats-section";

        const playerStatsList = document.createElement("ul");

        for (const line of item.stats.player) {
            const li = document.createElement("li");
            li.textContent = line;

            const color = getStatColor(line);
            if (color) {
                li.style.color = color;
            }

            playerStatsList.appendChild(li);
        }

        playerStatsSection.appendChild(playerStatsList);
        allStatsArea.appendChild(playerStatsSection);

    }

    if (item.stats.pet.length > 0) {
        const petStatsSection = document.createElement("div");
        petStatsSection.className = "pet-stats-section";

        const petHeading = document.createElement("h5");
        petHeading.textContent = "Pet Bonuses:"

        const petStatsList = document.createElement("ul");

        for (const line of item.stats.pet) {
            const li = document.createElement("li");
            li.textContent = line;
            li.style.color = "#38592e";

            petStatsList.appendChild(li);
        }

        petStatsSection.appendChild(petHeading)
        petStatsSection.appendChild(petStatsList)
        allStatsArea.appendChild(petStatsSection);

    }

    const requiredLevelandFactionRow = document.createElement("div");
    requiredLevelandFactionRow.className = "required-level-and-faction-row";

    const requiredLevel = document.createElement("div");
    requiredLevel.className = "required-level"
    requiredLevel.textContent = `Required Level: ${item.required_level}`

    const factionName = document.createElement("div");
    factionName.className = "faction-name";
    factionName.textContent = item.faction;

    imgAndStats.appendChild(allStatsArea);

    requiredLevelandFactionRow.appendChild(requiredLevel);
    requiredLevelandFactionRow.appendChild(factionName);

    card.appendChild(titleRow);
    card.appendChild(augmentType);
    card.appendChild(imgAndStats);
    card.appendChild(requiredLevelandFactionRow);

    return card;
}

searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value.toLowerCase().trim();
    render_faction_items(get_filtered_items());
});

document.getElementById("level-min-select").addEventListener("change", (event) => {
    selectedLevelMin = parseInt(event.target.value);
    if (selectedLevelMin > selectedLevelMax) {
        selectedLevelMax = selectedLevelMin;
        document.getElementById("level-max-select").value = selectedLevelMin;
    }
    render_faction_items(get_filtered_items());
});

document.getElementById("level-max-select").addEventListener("change", (event) => {
    selectedLevelMax = parseInt(event.target.value);
    if (selectedLevelMax < selectedLevelMin) {
        selectedLevelMin = selectedLevelMax;
        document.getElementById("level-min-select").value = selectedLevelMax;
    }
    render_faction_items(get_filtered_items());
});

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.type;
        render_faction_items(get_filtered_items());
    });
});

document.querySelector("#show-potent-toggle input").addEventListener("change", (event) => {
    showPotent = event.target.checked;
    render_faction_items(get_filtered_items());
});

function get_filtered_items() {
    let filteredItems = items;

    // Level filter
    filteredItems = filteredItems.filter(item =>
        item.required_level >= selectedLevelMin &&
        item.required_level <= selectedLevelMax
    );

    // Item type filter
    if (activeFilter !== "all_augments") {
        if (activeFilter === "pet_augment") {
            filteredItems = filteredItems.filter(item => item.stats.pet.length > 0);
        }
        else filteredItems = filteredItems.filter(item =>
            item.item_type === activeFilter);
    }

    // Search filter
    if (searchQuery !== "") {
        filteredItems = filteredItems.filter(item => {

            const nameMatch = item.name.toLowerCase().includes(searchQuery)

            const statsMatch = [...item.stats.player, ...item.stats.pet].some(stat =>
                stat.toLowerCase().includes(searchQuery)
            );

            return nameMatch || statsMatch;
        })
    }

    if (!showPotent) {
        filteredItems = filteredItems.filter(item => !item.name.startsWith("Potent "));
    }

    return filteredItems
}

function updateFactionAreasVisibility() {
    const factions = document.querySelectorAll(".faction-area");
    let anyVisible = false;

    factions.forEach(faction => {
        const items = faction.querySelector(".faction-items");
        const hasItems = items && items.children.length > 0;
        faction.style.display = hasItems ? "" : "none";
        if (hasItems) anyVisible = true;
    });

    document.getElementById("no-results").style.display = anyVisible ? "none" : "block";
}