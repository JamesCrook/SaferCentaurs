let stage;
let component;
let isSpinning = false;
let currentRepresentation = 'cartoon';

const MOLECULES = {
    '1A3N': 'HEMOGLOBIN',
    '1DGF': 'CATALASE',
    '1BNA': 'B-DNA',
    '3ARC': 'CHLOROPHYL',
    '1WYI': 'TIM BARREL',
    '1TRZ': 'INSULIN',
    '1EMA': 'GREEN FL.',
    '4HHB': 'HGB HEX'
};

window.onload = function() {
    stage = new NGL.Stage("viewport", { backgroundColor: "black",                 tooltip: false });
    
            // Reverting to debounced window resize for stability
            let resizeTimeout;
            window.addEventListener("resize", function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (stage) stage.handleResize();
                }, 10);
            }, false);

    // Using direct HTTPS URL as a more reliable method than rcsb://
    loadMolecule("1DGF");
};

async function loadMolecule(pdbId) {
    const loading = document.getElementById('loading');
    const statusText = document.getElementById('status-text');
    loading.style.display = 'flex';
    statusText.innerText = `FETCHING ${pdbId}...`;
    
    if (component) {
        stage.removeComponent(component);
    }

    // Using the direct PDB file URL which often bypasses certain proxy issues
    const url = `https://files.rcsb.org/download/${pdbId}.pdb`;

    try {
        const o = await stage.loadFile(url, { defaultRepresentation: false });
        component = o;
        updateRepresentation();
        component.autoView();
        loading.style.display = 'none';
        
        document.getElementById('mol-id').innerText = MOLECULES[pdbId] || pdbId;
        document.getElementById('mol-pdb').innerText = `PDB: ${pdbId} | STRUCTURAL ATLAS`;
    } catch (err) {
        console.error("Load failed:", err);
        statusText.innerText = "LINK FAILURE";
        // Add a small delay then hide so user can see buttons
        setTimeout(() => {
            if (statusText.innerText === "LINK FAILURE") loading.style.display = 'none';
        }, 2000);
    }
}

function updateRepresentation() {
    if (!component) return;
    component.removeAllRepresentations();

    switch(currentRepresentation) {
        case 'cartoon':
            component.addRepresentation("cartoon", { color: "chainid" });
            break;
        case 'spacefill':
            component.addRepresentation("spacefill", { color: "element" });
            break;
        case 'surface':
            component.addRepresentation("surface", { opacity: 0.7, color: "hydrophobicity" });
            break;
        case 'licorice':
            component.addRepresentation("licorice", { color: "residueindex" });
            break;
        case 'ball+stick':
            component.addRepresentation("ball+stick", { color: "element" });
            break;
    }
}

function showInfoSection(infoId) {
    const sections = document.querySelectorAll('[id^="info-"]');
    sections.forEach(section => {
        if (section.id === "info-overlay") return; // Skip container
        section.style.display = (section.id === `info-${infoId}`) ? 'block' : 'none';
    });
}

function switchMolecule(id, name) {
    showInfoSection( name.toLowerCase().split(" ")[0] );
    loadMolecule(id);
}

function changeRepresentation(type) {
    currentRepresentation = type;
    updateRepresentation();
}

function toggleSpin() {
    isSpinning = !isSpinning;
    stage.setSpin(isSpinning);
}

function centerView() {
    if (component) component.autoView();
}

function setTheme(mode) {
    stage.setParameters({ backgroundColor: mode === 'light' ? "white" : "black" });
}

function resetAll() {
    isSpinning = false;
    stage.setSpin(false);
    currentRepresentation = 'cartoon';
    updateRepresentation();
    centerView();
    setTheme('dark');
}
