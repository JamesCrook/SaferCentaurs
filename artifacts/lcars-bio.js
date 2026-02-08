let stage;
let component;
let isSpinning = false;
let currentRepresentation = 'cartoon';
let currentBatch = 0;
let currentPdbId = null;

const DNA_INFO = 
    { pdb: '1BNA', name: 'B-DNA', desc: 'Genetic Information', color: 'blue',
      info: 'B-DNA is the most common form of the DNA double helix found under physiological conditions. It consists of two antiparallel polynucleotide chains.' }


// Expanded protein database
const PROTEIN_DATABASE = [
    { pdb: '3ARC', name: 'Chlorophyll', desc: 'Light Harvesting', color: 'green',
      info: 'Photosystem II captures photons from sunlight to energize electrons. It is the only known biological system that can oxidize water into molecular oxygen.',
      html: `   <h2>CHLOROPHYLL / PSII</h2>
    <p><strong>Primary Function:</strong> Light Harvesting / Energy Conversion</p>
    <p>Photosystem II (PSII) is the first link in the photosynthetic chain. It captures photons from sunlight to energize electrons that are then used to create chemical energy. Crucially, it is the only known biological system that can oxidize water into molecular oxygen.</p>
    <ul>
        <li><strong>Pigments:</strong> Contains Chlorophyll-a which absorbs light in the blue and red spectrums.</li>
        <li><strong>Complexity:</strong> A multi-subunit membrane protein complex.</li>
    </ul>` },
    { pdb: '1DGF', name: 'Catalase', desc: 'Antioxidant Defense', color: 'cyan',
      info: 'Catalase is a common enzyme found in nearly all living organisms exposed to oxygen. It catalyzes the decomposition of hydrogen peroxide to water and oxygen.',
      html: `   <h2>CATALASE</h2>
    <p><strong>Primary Function:</strong> Antioxidant Defense</p>
    <p>Catalase is a common enzyme found in nearly all living organisms exposed to oxygen. It catalyzes the decomposition of hydrogen peroxide to water and oxygen. It is a very important enzyme in protecting the cell from oxidative damage by reactive oxygen species (ROS).</p>
    <ul>
        <li><strong>Turnover Rate:</strong> One of the highest known; millions of hydrogen peroxide molecules per second.</li>
        <li><strong>Morphology:</strong> A massive tetramer with four identical subunits.</li>
    </ul>` },
    { pdb: '1A3N', name: 'Hemoglobin', desc: 'Oxygen Transport', color: 'blood-red', 
      info: 'Hemoglobin is the iron-containing oxygen-transport metalloprotein in the red blood cells of all vertebrates. It carries oxygen from the lungs to the rest of the body.',
      html: `<h2>HEMOGLOBIN</h2>
    <p><strong>Primary Function:</strong> Oxygen Transport</p>
    <p>Hemoglobin is the iron-containing oxygen-transport metalloprotein in the red blood cells of all vertebrates. It carries oxygen from the lungs to the rest of the body, where it releases the oxygen to burn nutrients to provide energy to power the functions of the organism.</p>
    <ul>
        <li><strong>Quaternary Structure:</strong> A tetramer consisting of two alpha and two beta subunits.</li>
        <li><strong>Active Site:</strong> Each subunit contains a heme group with an iron atom at its center.</li>
    </ul>`},
    { pdb: '1WYI', name: 'TIM Barrel', desc: 'Glycolysis', color: 'yellow',
      info: 'Triosephosphate isomerase is the "perfect enzyme," famous in structural biology for its "TIM Barrel" fold with eight alpha-helices and eight beta-strands.',
      html: `   <h2>TIM BARREL</h2>
    <p><strong>Primary Function:</strong> Glycolysis (Energy Metabolism)</p>
    <p>Triosephosphate isomerase (TIM) is the "perfect enzyme," meaning its catalysis is limited only by the rate at which substrates can diffuse into its active site. It is famous in structural biology for its "TIM Barrel" fold.</p>
    <ul>
        <li><strong>The Barrel:</strong> An alpha/beta barrel consisting of eight alpha-helices and eight parallel beta-strands.</li>
        <li><strong>Evolution:</strong> One of the most common and versatile protein folds in nature.</li>
    </ul>` },
    { pdb: '1TRZ', name: 'Insulin', desc: 'Glucose Regulation', color: 'tan',
      info: 'Insulin is a peptide hormone produced by pancreatic beta cells. It regulates metabolism of carbohydrates, fats, and protein by promoting glucose absorption.',
      html: `   <h2>INSULIN</h2>
    <p><strong>Primary Function:</strong> Hormonal Regulation of Glucose</p>
    <p>Insulin is a peptide hormone produced by beta cells of the pancreatic islets. It is considered to be the main anabolic hormone of the body. It regulates the metabolism of carbohydrates, fats, and protein by promoting the absorption of glucose from the blood.</p>
    <ul>
        <li><strong>Structure:</strong> Composed of two peptide chains (A and B) linked by disulfide bonds.</li>
        <li><strong>Storage:</strong> Often found in a hexameric form stabilized by zinc ions.</li>
    </ul>` },
    
    { pdb: '1EMA', name: 'Green Fl.', desc: 'Bioluminescence', color: 'green',
      info: 'Originally from jellyfish Aequorea victoria, GFP exhibits bright green fluorescence. Used extensively as a reporter gene in molecular biology.',
      html: `   <h2>GREEN FL. PROTEIN (GFP)</h2>
    <p><strong>Primary Function:</strong> Bioluminescence (Tool for Imaging)</p>
    <p>Originally isolated from the jellyfish <em>Aequorea victoria</em>, GFP exhibits bright green fluorescence when exposed to light in the blue to ultraviolet range. It is used extensively as a reporter gene in molecular biology.</p>
    <ul>
        <li><strong>Beta-Can:</strong> A unique fold where 11 beta-strands form a cylinder protecting the central fluorophore.</li>
        <li><strong>Fluorophore:</strong> Formed spontaneously from three amino acids (Ser65, Tyr66, Gly67).</li>
    </ul>` },
    { pdb: '4HHB', name: 'OVERVIEW2', desc: 'Oxygen Carrier', color: 'beige',
      info: 'Hemoglobin tetramer showing the quaternary structure. A tetramer with two alpha and two beta subunits, each containing a heme group.',
      html: `   <h2>SYSTEM OVERVIEW2</h2>
    <p><strong>Atlas Scope:</strong> Fundamental Biopolymers</p>
    <p>This module provides a comparative look at 36 protein structures.</p>
    <ul>
        <li><strong>Visual Legend:</strong> Use buttons around the main panel to toggle between atomic detail and tertiary structure.</li>
        <li><strong>Navigation:</strong> &lt;&lt and &gt;&gt; to move through batches.</li>
        <li><strong>Reconfiguration:</strong> In some demos, not this one, buttons reconfigure as you use them.</li>
    </ul>` },
    { pdb: '2LYZ', name: 'Lysozyme', desc: 'Cell Wall Lysis', color: 'orange',
      info: 'Lysozyme catalyzes hydrolysis of bacterial cell walls. One of the first enzymes to have its structure determined by X-ray crystallography.' },
    { pdb: '1MBO', name: 'Myoglobin', desc: 'Oxygen Storage', color: 'pink',
      info: 'Myoglobin stores oxygen in muscle cells. It was the first protein to have its three-dimensional structure revealed by X-ray crystallography.' },
    { pdb: '2HHB', name: 'Deoxy Hemoglobin', desc: 'O2 Unbound State', color: 'purple',
      info: 'Deoxygenated hemoglobin structure showing the T (tense) state. Demonstrates allosteric regulation in oxygen binding.' },
    { pdb: '1CRN', name: 'Crambin', desc: 'Plant Seed Protein', color: 'yellow',
      info: 'Crambin is a small plant seed protein. Its high-resolution structure made it important for developing crystallographic refinement techniques.' },
    
    { pdb: '1GFL', name: 'GB1 Domain', desc: 'Protein Binding', color: 'cyan',
      info: 'Immunoglobulin-binding domain from Streptococcal protein G. A model system for protein folding studies.' },
    { pdb: '1UBQ', name: 'Ubiquitin', desc: 'Protein Tagging', color: 'tan',
      info: 'Ubiquitin tags proteins for degradation. Highly conserved across eukaryotes and essential for cellular regulation.' },
    { pdb: '1AKI', name: 'Ribonuclease', desc: 'RNA Degradation', color: 'orange',
      info: 'Ribonuclease A catalyzes RNA degradation. A workhorse enzyme in molecular biology and a model for protein folding.' },
    { pdb: '1ATP', name: 'ATP Synthase', desc: 'Energy Production', color: 'purple',
      info: 'ATP synthase produces ATP from ADP. A molecular motor driven by proton gradient across the membrane.' },
    { pdb: '1HHO', name: 'Immunoglobulin', desc: 'Antibody Fragment', color: 'blue',
      info: 'Antibody fragment showing the characteristic immunoglobulin fold. Essential for adaptive immune recognition.' },
    { pdb: '1BYI', name: 'Beta-lactamase', desc: 'Antibiotic Resistance', color: 'rust',
      info: 'Beta-lactamase confers antibiotic resistance by hydrolyzing beta-lactam rings in penicillin and related antibiotics.' },
    
    { pdb: '1LDM', name: 'L-Lactate Dehydrogenase', desc: 'Lactate Metabolism', color: 'green',
      info: 'Lactate dehydrogenase catalyzes interconversion of pyruvate and lactate. Critical for anaerobic glycolysis.' },
    { pdb: '1AMY', name: 'Amylase', desc: 'Starch Breakdown', color: 'yellow',
      info: 'Alpha-amylase breaks down starch into sugars. Present in saliva and pancreatic secretions for digestion.' },
    { pdb: '1PPE', name: 'Elastase', desc: 'Protein Degradation', color: 'pink',
      info: 'Pancreatic elastase breaks down elastin and other proteins. A serine protease important for digestion.' },
    { pdb: '1THM', name: 'Thrombin', desc: 'Blood Clotting', color: 'blood-red',
      info: 'Thrombin converts fibrinogen to fibrin during blood clotting. A key serine protease in the coagulation cascade.' },
    { pdb: '1CHO', name: 'Chymotrypsin', desc: 'Protein Digestion', color: 'orange',
      info: 'Chymotrypsin is a digestive enzyme that breaks down proteins in the small intestine by cleaving peptide bonds.' },
    { pdb: '2ACE', name: 'Acetylcholinesterase', desc: 'Neurotransmitter', color: 'cyan',
      info: 'Acetylcholinesterase terminates neurotransmission at cholinergic synapses by rapid hydrolysis of acetylcholine.' },
    
    { pdb: '1CSE', name: 'Subtilisin', desc: 'Bacterial Protease', color: 'tan',
      info: 'Subtilisin is a serine protease from Bacillus. Despite different evolutionary origin, it shares catalytic mechanism with chymotrypsin.' },
    { pdb: '1HEW', name: 'Lysozyme C', desc: 'Bacteriolytic', color: 'purple',
      info: 'Hen egg white lysozyme. One of the most studied enzymes, important in host defense against bacterial infection.' },
    { pdb: '1RBP', name: 'Retinol Binding Protein', desc: 'Vitamin Transport', color: 'yellow',
      info: 'Retinol-binding protein transports vitamin A in blood. Part of the lipocalin family with a characteristic beta-barrel.' },
    { pdb: '1A6M', name: 'Lactoferrin', desc: 'Iron Transport', color: 'rust',
      info: 'Lactoferrin binds iron in milk and mucosal secretions. Provides antimicrobial protection by sequestering iron.' },
    { pdb: '1CBN', name: 'Carbonic Anhydrase', desc: 'CO2 Hydration', color: 'cyan',
      info: 'Carbonic anhydrase catalyzes rapid interconversion of CO2 and water to bicarbonate and protons.' },
    { pdb: '1G3P', name: 'Glyceraldehyde Dehydrogenase', desc: 'Glycolysis Enzyme', color: 'green',
      info: 'Glyceraldehyde-3-phosphate dehydrogenase catalyzes a key step in glycolysis. Found in all organisms.' },
    
    { pdb: '1MCT', name: 'Metallothionein', desc: 'Metal Binding', color: 'orange',
      info: 'Metallothionein binds heavy metals like zinc and copper. Important for metal homeostasis and detoxification.' },
    { pdb: '1FAS', name: 'Fatty Acid Synthase', desc: 'Lipid Synthesis', color: 'pink',
      info: 'Fatty acid synthase catalyzes synthesis of long-chain fatty acids. A large multifunctional enzyme complex.' },
    { pdb: '1COX', name: 'Cytochrome C', desc: 'Electron Transfer', color: 'blood-red',
      info: 'Cytochrome c oxidase catalyzes the final step in electron transport chain, reducing oxygen to water.' },
    { pdb: '1POH', name: 'Porin', desc: 'Membrane Channel', color: 'blue',
      info: 'Porin forms beta-barrel channels in bacterial outer membranes, allowing passive diffusion of small molecules.' },
    { pdb: '1IGT', name: 'Trypsin', desc: 'Protein Cleavage', color: 'tan',
      info: 'Trypsin is a digestive enzyme that cleaves proteins at lysine and arginine residues. A model serine protease.' },
    { pdb: '1CTS', name: 'Citrate Synthase', desc: 'Krebs Cycle', color: 'purple',
      info: 'Citrate synthase catalyzes the first step of the Krebs cycle, combining acetyl-CoA with oxaloacetate.' },

    { pdb: '1A3N', name: 'Hemoglobin', desc: 'Oxygen Transport', color: 'blood-red', 
      info: 'Hemoglobin is the iron-containing oxygen-transport metalloprotein in the red blood cells of all vertebrates. It carries oxygen from the lungs to the rest of the body.' },

];

window.onload = function() {
    console.log('Initializing LCARS Molecular Viewer...');
    console.log(`Loaded ${PROTEIN_DATABASE.length} proteins`);
    
    stage = new NGL.Stage("viewport", { backgroundColor: "black", tooltip: false });
    
    let resizeTimeout;
    window.addEventListener("resize", function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (stage) stage.handleResize();
        }, 10);
    }, false);

    // Check for URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pdbParam = urlParams.get('pdb');
    
    if (pdbParam) {
        console.log(`URL parameter detected: ${pdbParam}`);
        const index = PROTEIN_DATABASE.findIndex(p => p.pdb.toLowerCase() === pdbParam.toLowerCase());
        if (index >= 0) {
            currentBatch = Math.floor(index / 6);
            currentPdbId = PROTEIN_DATABASE[index].pdb;
            console.log(`Found protein at index ${index}, batch ${currentBatch}`);
        }
    }
    
    // Initialize UI
    console.log('Updating protein buttons...');
    updateProteinButtons();
    updateBatchIndicator();
    
    // Load initial molecule
    const initialPdb = currentPdbId || PROTEIN_DATABASE[currentBatch * 6+2].pdb;
    console.log(`Loading initial molecule: ${initialPdb}`);
    loadMolecule(initialPdb);
};

function updateProteinButtons() {
    const startIdx = currentBatch * 6;
    const batch = PROTEIN_DATABASE.slice(startIdx, startIdx + 6);
    
    // Get the bottom panel by ID (more reliable than :last-of-type)
    const bottomPanel = document.getElementById('protein-panel');
    
    if (!bottomPanel) {
        console.error('Protein panel not found! Make sure the HTML has id="protein-panel" on the bottom .lcars-panel');
        return;
    }
    
    // Get the button containers from the bottom panel
    const leftButtons = bottomPanel.querySelectorAll('.lcars-left .lcars-block');
    const rightButtons = bottomPanel.querySelectorAll('.lcars-right .lcars-block');
    
    console.log(`Batch ${currentBatch + 1}: Found ${leftButtons.length} left buttons, ${rightButtons.length} right buttons`);
    console.log(`Displaying proteins:`, batch.map(p => p.name).join(', '));
    
    // Update left sidebar buttons (first 3 proteins: 0, 1, 2)
    leftButtons.forEach((btn, idx) => {
        if (batch[idx]) {
            const protein = batch[idx];
            btn.setAttribute('data-group', protein.name);
            btn.setAttribute('data-pdb', protein.pdb);
            btn.textContent = protein.name;
            btn.className = `lcars-block lcars-${protein.color}`;
            if (idx === 0) btn.classList.add('lcars-tl');
            if (idx === 2) btn.classList.add('lcars-sblock');
            btn.style.visibility = 'visible';
        } else {
            btn.style.visibility = 'hidden';
        }
    });
    
    // Right sidebar keeps Overview and Credits static (no dynamic proteins)

    // Update left sidebar buttons (first 3 proteins: 0, 1, 2)
    rightButtons.forEach((btn, idx) => {
        if( idx == 1){
            if (batch[0]) {
                const protein = DNA_INFO;
                btn.setAttribute('data-group', protein.name);
                btn.setAttribute('data-pdb', protein.pdb);
                btn.textContent = protein.name;
                btn.className = `lcars-block lcars-${protein.color}`;
                btn.style.visibility = 'visible';
            } else {
                btn.style.visibility = 'hidden';
            }
        }
    });
    
    // Update top bar buttons
    // Button 0 is ◄ (prev)
    // Buttons 1, 2, 3 are proteins 3, 4, 5
    // Button 4 is ► (next)
    const topButtons = bottomPanel.querySelectorAll('.lcars-bartop .lcars-block');
    topButtons.forEach((btn, idx) => {
        if (idx === 0) {
            btn.setAttribute('data-group', 'PrevBatch');
            btn.textContent = '<<';//'◀';
            const protein = batch[0]
            btn.className = `lcars-block lcars-sssblock lcars-${protein.color} stub`;
        } else if (idx === 4) {
            btn.setAttribute('data-group', 'NextBatch');
            btn.textContent = '>>';//'▶';

            btn.className = `lcars-block lcars-sblock lcars-beige stub`;
        } else {
            // idx 1, 2, 3 map to proteins 3, 4, 5
            const proteinIdx = idx + 2; // idx=1 -> protein 3, idx=2 -> protein 4, idx=3 -> protein 5
            if (batch[proteinIdx]) {
                const protein = batch[proteinIdx];
                btn.setAttribute('data-group', protein.name);
                btn.setAttribute('data-pdb', protein.pdb);
                btn.textContent = protein.name;
                btn.className = `lcars-block lcars-${protein.color}`;
                if (idx === 2) btn.classList.add('lcars-optional');
                btn.style.visibility = 'visible';
            } else {
                btn.style.visibility = 'hidden';
            }
        }
    });
    
    updateInfoPanel();
    
    // Re-attach event listeners to updated buttons
    if (typeof reactivateBlocks === 'function') {
        reactivateBlocks();
    }
}

let bFirstTime = true;
function updateInfoPanel() {
    const infoContainer = document.getElementById('SubPanel');
    const startIdx = currentBatch * 6;
    const batch = PROTEIN_DATABASE.slice(startIdx, startIdx + 6);
    
    let html = bFirstTime ? `
<section id="info-overview">
  <h2>Display Selection Panel</h2>
  <p>Try 'Overview'.</p>
</section>
`
     :
    `
<section id="info-overview">
    <h2>ATLAS NAVIGATION - BATCH ${currentBatch + 1} of ${Math.ceil(PROTEIN_DATABASE.length / 6)}</h2>
    <p><strong>Atlas Scope:</strong> Fundamental Biopolymers</p>
    <p>This module provides access to ${PROTEIN_DATABASE.length} protein structures from the PDB Global Archive.</p>
    <ul>
        <li><strong>Navigation:</strong> Use << >> buttons to browse batches of 6 proteins</li>
        <li><strong>Visual Controls:</strong> Toggle between atomic detail and tertiary structure views</li>
        <li><strong>Current Batch:</strong> Proteins ${startIdx + 1}-${Math.min(startIdx + 6, PROTEIN_DATABASE.length)}</li>
    </ul>
</section>
`;
    bFirstTime = false;    
    html += `<section id="info-overview-basic" style="display:none;">
<h2>SYSTEM OVERVIEW</h2>
<p><strong>Atlas Scope:</strong> Fundamental Biopolymers</p>
<p>This module provides a comparative look at the building blocks of life. From the genetic blueprint (DNA) to the enzymes that facilitate metabolism (TIM) and the hormones that regulate system-wide state (Insulin).</p>
<ul>
    <li><strong>Visual Legend:</strong> Use buttons around the main panel to toggle between atomic detail and tertiary structure.</li>
    <li><strong>Bio-Data:</strong> Structural data is retrieved in real-time from the PDB Global Archive.</li>
</ul>
</section>`

    batch.forEach(protein => {
        const sectionId = protein.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        let inner = protein.html ?? 
`   <h2>${protein.name}</h2>
    <p><strong>PDB ID:</strong> ${protein.pdb}</p>
    <p><strong>Primary Function:</strong> ${protein.desc}</p>
    <p>${protein.info}</p>
`
        html += `
<section id="info-${sectionId}" style="display:none;">
   ${inner}
</section>
`;
    });

    html += `
<section id="info-bdna" style="display:none;">
    <h2>B-DNA</h2>
    <p><strong>Primary Function:</strong> Genetic Information Storage</p>
    <p>B-DNA is the most common form of the DNA double helix found under physiological conditions. It consists of two antiparallel polynucleotide chains held together by hydrogen bonds between complementary base pairs (A-T and C-G).</p>
    <ul>
        <li><strong>Geometry:</strong> Right-handed helix with approximately 10.5 base pairs per turn.</li>
        <li><strong>Key Features:</strong> Distinct major and minor grooves which serve as binding sites for proteins.</li>
    </ul>
</section>
`;
    
    html += `
<section id="info-credits" style="display:none;">
    <h2>CREDITS</h2>
    <ul>
        <li><strong>PDB:</strong> Protein Data Bank provides 3D coordinate data</li>
        <li><strong>NGL:</strong> NGL Viewer provides 3D molecular visualization</li>
    </ul>
</section>
`;
    
    infoContainer.innerHTML = html;
    
    // Show overview by default
    showInfoSection('overview');
}

function updateBatchIndicator() {
    const totalBatches = Math.ceil(PROTEIN_DATABASE.length / 6);
    const startIdx = currentBatch * 6 + 1;
    const endIdx = Math.min((currentBatch + 1) * 6, PROTEIN_DATABASE.length);
    
    // Update a status indicator if you want to add one to the UI
    console.log(`Showing proteins ${startIdx}-${endIdx} of ${PROTEIN_DATABASE.length} (Batch ${currentBatch + 1}/${totalBatches})`);
}

async function loadMolecule(pdbId) {
    currentPdbId = pdbId;
    const loading = document.getElementById('loading');
    const statusText = document.getElementById('status-text');
    loading.style.display = 'flex';
    statusText.innerText = `FETCHING ${pdbId}...`;
    
    if (component) {
        stage.removeComponent(component);
    }

    const url = `https://files.rcsb.org/download/${pdbId}.pdb`;

    try {
        const o = await stage.loadFile(url, { defaultRepresentation: false });
        component = o;
        updateRepresentation();
        component.autoView();
        loading.style.display = 'none';
        
        const protein = PROTEIN_DATABASE.find(p => p.pdb === pdbId);
        if (protein) {
            document.getElementById('mol-id').innerText = protein.name;
            document.getElementById('mol-pdb').innerText = `PDB: ${pdbId} | ${protein.desc}`;
        } else {
            document.getElementById('mol-id').innerText = pdbId;
            document.getElementById('mol-pdb').innerText = `PDB: ${pdbId} | STRUCTURAL ATLAS`;
        }
    } catch (err) {
        console.error("Load failed:", err);
        statusText.innerText = "LINK FAILURE";
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
    const sections = document.querySelectorAll('#SubPanel section');
    sections.forEach(section => {
        section.style.display = (section.id === `info-${infoId}`) ? 'block' : 'none';
    });
}

function switchMolecule(id, name) {
    const sectionId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    showInfoSection(sectionId);
    loadMolecule(id);
}

function nextBatch() {
    const totalBatches = Math.ceil(PROTEIN_DATABASE.length / 6);
    currentBatch = (currentBatch + 1) % totalBatches;
    updateProteinButtons();
    updateBatchIndicator();
    
    // Load first protein of new batch
    const firstProtein = PROTEIN_DATABASE[currentBatch * 6+2];
    loadMolecule(firstProtein.pdb);
    showInfoSection('overview');
}

function prevBatch() {
    const totalBatches = Math.ceil(PROTEIN_DATABASE.length / 6);
    currentBatch = (currentBatch - 1 + totalBatches) % totalBatches;
    updateProteinButtons();
    updateBatchIndicator();
    
    // Load first protein of new batch
    const firstProtein = PROTEIN_DATABASE[currentBatch * 6+2];
    loadMolecule(firstProtein.pdb);
    showInfoSection('overview');
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