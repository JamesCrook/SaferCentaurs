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
    <p>This module provides a comparative look at protein structures.</p>
    <ul>
        <li><strong>Visual Legend:</strong> Use buttons around the main panel to toggle between atomic detail and tertiary structure.</li>
        <li><strong>Navigation:</strong> &lt;&lt and &gt;&gt; to move through batches.</li>
        <li><strong>Reconfiguration:</strong> In some demos, not this one, buttons reconfigure as you use them.</li>
    </ul>` },
    { 
        pdb: '1CRN', name: 'Crambin', desc: 'Plant Seed Protein', color: 'yellow',
        info: 'Crambin is a small, water-insoluble protein from the Abyssinian kale seed. It is a benchmark in high-resolution crystallography.',
        html: `<h2>CRAMBIN</h2>
        <p><strong>Primary Function:</strong> Seed Storage / Structural Study</p>
        <p>Crambin is famous in structural biology because it diffracts to extremely high resolution, allowing scientists to see individual atoms with incredible clarity.</p>
        <ul>
            <li><strong>Resolution:</strong> One of the best-resolved structures in the PDB, used to refine crystallographic methods.</li>
            <li><strong>Structure:</strong> A tiny but robust protein stabilized by three disulfide bonds.</li>
        </ul>` 
    },
    { 
        pdb: '1GFL', name: 'GB1 Domain', desc: 'Protein Binding', color: 'cyan',
        info: 'The GB1 domain is a small, incredibly stable protein fold from Streptococcal Protein G, widely used as a model for folding studies.',
        html: `<h2>GB1 DOMAIN</h2>
        <p><strong>Primary Function:</strong> Immunoglobulin Binding</p>
        <p>This domain binds to the Fc region of antibodies. Because of its small size and high stability, it is a "lab workhorse" for NMR and folding simulations.</p>
        <ul>
            <li><strong>Folding Model:</strong> Used to understand how a single alpha-helix packs against a four-stranded beta-sheet.</li>
            <li><strong>Engineering:</strong> Frequently used as a fusion tag to help other proteins fold correctly in the lab.</li>
        </ul>` 
    },
    { 
        pdb: '1AKI', name: 'Ribonuclease', desc: 'RNA Degradation', color: 'orange',
        info: 'Ribonuclease A (RNase A) is an enzyme that cleaves single-stranded RNA. It was a primary subject for early protein folding theories.',
        html: `<h2>RIBONUCLEASE A</h2>
        <p><strong>Primary Function:</strong> RNA Degradation</p>
        <p>RNase A is secreted by the pancreas to break down RNA from food. It is remarkably hardy, able to survive boiling and harsh chemicals.</p>
        <ul>
            <li><strong>Anfinsen's Dogma:</strong> This protein was used to prove that a protein's sequence determines its 3D shape.</li>
            <li><strong>Mechanism:</strong> Uses a specific "catalytic triad" of histidines to snip the RNA backbone.</li>
        </ul>` 
    },
    { 
        pdb: '1HHO', name: 'Immunoglobulin', desc: 'Antibody Fragment', color: 'blue',
        info: 'Antibodies are the primary recognition molecules of the adaptive immune system, identifying and neutralizing foreign pathogens.',
        html: `<h2>IMMUNOGLOBULIN (IgG)</h2>
        <p><strong>Primary Function:</strong> Adaptive Immune Recognition</p>
        <p>This structure displays the classic "Immunoglobulin Fold"—a sandwich of beta-sheets that provides a stable framework for highly variable loops.</p>
        <ul>
            <li><strong>Specificity:</strong> The "tips" of the Y-shaped molecule are hyper-variable, allowing the body to recognize billions of different threats.</li>
            <li><strong>Effector Function:</strong> Once bound to a target, it signals white blood cells to attack.</li>
        </ul>` 
    },
    { 
        pdb: '1LDM', name: 'L-Lactate Dehydrogenase', desc: 'Lactate Metabolism', color: 'green',
        info: 'LDH catalyzes the conversion of lactate to pyruvate, a critical step in anaerobic respiration and glycolysis.',
        html: `<h2>LACTATE DEHYDROGENASE</h2>
        <p><strong>Primary Function:</strong> Anaerobic Energy Metabolism</p>
        <p>When oxygen is low, LDH allows cells to keep producing energy by converting pyruvate into lactate, regenerating the NAD+ needed for glycolysis.</p>
        <ul>
            <li><strong>Isoenzymes:</strong> Different forms exist in the heart and skeletal muscle, tailored to different metabolic needs.</li>
            <li><strong>Clinical Marker:</strong> High levels in the blood can indicate tissue damage or a recent heart attack.</li>
        </ul>` 
    },
    { 
        pdb: '1AMY', name: 'Amylase', desc: 'Starch Breakdown', color: 'yellow',
        info: 'Amylase is a digestive enzyme that breaks complex starches into simple sugars like maltose and glucose.',
        html: `<h2>AMYLASE</h2>
        <p><strong>Primary Function:</strong> Carbohydrate Digestion</p>
        <p>Digestion begins in the mouth; salivary amylase starts breaking down food before it even reaches the stomach.</p>
        <ul>
            <li><strong>Calcium Binding:</strong> Most amylases require a calcium ion to stabilize their complex 3D structure.</li>
            <li><strong>Industrial Use:</strong> Used extensively in bread making and brewing to convert starches into fermentable sugars.</li>
        </ul>` 
    },
    { 
        pdb: '1PPE', name: 'Elastase', desc: 'Protein Degradation', color: 'pink',
        info: 'Elastase is a serine protease that specifically targets elastin, the elastic fiber found in connective tissues.',
        html: `<h2>ELASTASE</h2>
        <p><strong>Primary Function:</strong> Connective Tissue Breakdown</p>
        <p>While vital for digestion, uncontrolled elastase activity (often caused by smoking) can lead to lung diseases like emphysema.</p>
        <ul>
            <li><strong>Selectivity:</strong> It has a unique small binding pocket that allows it to cleave small amino acids like alanine and valine.</li>
            <li><strong>Inhibitor:</strong> Naturally regulated by alpha-1 antitrypsin to prevent tissue damage.</li>
        </ul>` 
    },
    { 
        pdb: '1CHO', name: 'Chymotrypsin', desc: 'Protein Digestion', color: 'orange',
        info: 'Chymotrypsin is a digestive enzyme produced in the pancreas that cleaves peptide bonds following large hydrophobic amino acids.',
        html: `<h2>CHYMOTRYPSIN</h2>
        <p><strong>Primary Function:</strong> Proteolysis (Digestion)</p>
        <p>It is the classic model for "Serine Proteases," utilizing a specific Catalytic Triad (Ser-His-Asp) to cut proteins.</p>
        <ul>
            <li><strong>Zymogen:</strong> It is secreted as an inactive precursor (Chymotrypsinogen) to prevent it from digesting the pancreas itself.</li>
            <li><strong>Specificity:</strong> Features a deep, hydrophobic pocket that "plucks" bulky side chains like Phenylalanine into the active site.</li>
        </ul>` 
    },
    { 
        pdb: '1CSE', name: 'Subtilisin', desc: 'Bacterial Protease', color: 'tan',
        info: 'Subtilisin is a protease from soil bacteria. It is a famous example of convergent evolution in biochemistry.',
        html: `<h2>SUBTILISIN</h2>
        <p><strong>Primary Function:</strong> Bacterial Protein Cleavage</p>
        <p>Though it evolved completely independently from Chymotrypsin, it uses the exact same catalytic triad mechanism to break down proteins.</p>
        <ul>
            <li><strong>Industrial Use:</strong> Its extreme stability makes it a common additive in laundry detergents to remove protein-based stains.</li>
            <li><strong>Evolution:</strong> A textbook case of nature finding the same chemical solution to a problem twice.</li>
        </ul>` 
    },
    { 
        pdb: '1HEW', name: 'Lysozyme C', desc: 'Bacteriolytic', color: 'purple',
        info: 'Hen Egg White Lysozyme (HEWL) is perhaps the most heavily studied enzyme in history, serving as a structural archetype.',
        html: `<h2>LYSOZYME C (HEWL)</h2>
        <p><strong>Primary Function:</strong> Innate Immunity</p>
        <p>HEWL protects developing bird embryos from infection by dissolving the cell walls of encroaching bacteria.</p>
        <ul>
            <li><strong>Pioneering:</strong> The first enzyme to have its catalytic mechanism elucidated through X-ray crystallography.</li>
            <li><strong>Properties:</strong> Small, stable, and easy to crystallize, making it the "Hello World" of protein science.</li>
        </ul>` 
    },
    { 
        pdb: '1RBP', name: 'Retinol Binding Protein', desc: 'Vitamin Transport', color: 'yellow',
        info: 'RBP is a transport protein that carries Vitamin A (Retinol) from the liver to the peripheral tissues.',
        html: `<h2>RETINOL BINDING PROTEIN</h2>
        <p><strong>Primary Function:</strong> Vitamin A Transport</p>
        <p>Retinol is insoluble and toxic if free; RBP acts as a "molecular shuttle" to keep it safe and soluble in the blood.</p>
        <ul>
            <li><strong>Fold:</strong> A member of the Lipocalin family, characterized by an 8-stranded beta-barrel that forms a deep "calyx" or cup.</li>
            <li><strong>Protection:</strong> The vitamin sits deep inside the cup, shielded from oxidation.</li>
        </ul>` 
    },
    { 
        pdb: '1G3P', name: 'Glyceraldehyde Dehydrogenase', desc: 'Glycolysis Enzyme', color: 'green',
        info: 'GAPDH is a key enzyme in the energy-releasing phase of glycolysis, found in nearly all living organisms.',
        html: `<h2>GAPDH</h2>
        <p><strong>Primary Function:</strong> Glycolytic Energy Production</p>
        <p>It catalyzes the sixth step of glycolysis, capturing high-energy electrons to create NADH while preparing the sugar for ATP production.</p>
        <ul>
            <li><strong>Moonlighting:</strong> Beyond energy, GAPDH is involved in DNA repair, tRNA export, and cell death signaling.</li>
            <li><strong>Control:</strong> Because it is present in almost all cells, it is often used as a "housekeeping" control in lab experiments.</li>
        </ul>` 
    },
    { 
        pdb: '1FAS', name: 'Fatty Acid Synthase', desc: 'Lipid Synthesis', color: 'pink',
        info: 'FAS is a massive multi-enzyme machine that builds long-chain fatty acids from simple building blocks.',
        html: `<h2>FATTY ACID SYNTHASE</h2>
        <p><strong>Primary Function:</strong> Lipid (Fat) Synthesis</p>
        <p>FAS acts like an assembly line, passing a growing carbon chain through seven different active sites to create palmitate.</p>
        <ul>
            <li><strong>Complexity:</strong> One of the largest non-ribosomal enzyme complexes in the human body.</li>
            <li><strong>Metabolic Role:</strong> Converts excess dietary carbohydrates into stored fat for long-term energy.</li>
        </ul>` 
    },
    { 
        pdb: '1IGT', name: 'Trypsin', desc: 'Protein Cleavage', color: 'tan',
        info: 'Trypsin is a powerful digestive enzyme that cleaves proteins at the amino acids Lysine and Arginine.',
        html: `<h2>TRYPSIN</h2>
        <p><strong>Primary Function:</strong> Proteolysis (Digestion)</p>
        <p>Trypsin is the "activator" of the gut; once released, it turns on many other digestive enzymes to begin the breakdown of a meal.</p>
        <ul>
            <li><strong>Self-Defense:</strong> The pancreas produces a specific "Trypsin Inhibitor" to ensure the enzyme doesn't eat the organ from the inside out.</li>
            <li><strong>Laboratory Use:</strong> Used in cell culture to "detach" cells from growth flasks by digesting their surface attachment proteins.</li>
        </ul>` 
    },
    { 
        pdb: '1CTS', name: 'Citrate Synthase', desc: 'Krebs Cycle', color: 'purple',
        info: 'Citrate synthase is the "gatekeeper" of the Krebs cycle, controlling the rate of aerobic energy production.',
        html: `<h2>CITRATE SYNTHASE</h2>
        <p><strong>Primary Function:</strong> TCA / Krebs Cycle Initiation</p>
        <p>It combines Acetyl-CoA with Oxaloacetate to create Citrate, officially starting the cycle that powers the mitochondria.</p>
        <ul>
            <li><strong>Induced Fit:</strong> The enzyme physically "closes" around its substrates to prevent the energy from being wasted through side reactions.</li>
            <li><strong>Regulation:</strong> It is inhibited by high levels of ATP, slowing down when the cell already has enough energy.</li>
        </ul>` 
    },
    { 
        pdb: '2LYZ', name: 'Lysozyme', desc: 'Cell Wall Lysis', color: 'tan',
        info: 'Lysozyme is a primary defense enzyme that hydrolyzes bacterial cell walls. It was one of the first enzymes solved by X-ray crystallography.',
        html: `<h2>LYSOZYME</h2>
        <p><strong>Primary Function:</strong> Antibacterial Defense</p>
        <p>Lysozyme damages bacterial cell walls by catalyzing the hydrolysis of 1,4-beta-linkages between NAG and NAM residues in peptidoglycan.</p>
        <ul>
            <li><strong>Source:</strong> Found abundantly in secretions like tears, saliva, and egg whites.</li>
            <li><strong>History:</strong> Discovered by Alexander Fleming before he discovered penicillin.</li>
        </ul>` 
    },
    { 
        pdb: '1MBO', name: 'Myoglobin', desc: 'Oxygen Storage', color: 'blood-red',
        info: 'Myoglobin stores oxygen in muscle cells, providing a reserve for intense activity. It was the first protein structure ever solved.',
        html: `<h2>MYOGLOBIN</h2>
        <p><strong>Primary Function:</strong> Muscle O₂ Storage</p>
        <p>Unlike Hemoglobin, Myoglobin consists of a single polypeptide chain. It has a very high affinity for oxygen, ensuring muscles have a backup supply.</p>
        <ul>
            <li><strong>Structure:</strong> A globular protein with 8 alpha-helices and a single heme group.</li>
            <li><strong>Milestone:</strong> Solved by John Kendrew in 1958 using X-ray diffraction.</li>
        </ul>` 
    },
    
    { 
        pdb: '2HHB', name: 'Deoxy Hemoglobin', desc: 'O₂ Unbound State', color: 'rust',
        info: 'This structure represents the "Tense" (T) state of hemoglobin, which has a lower affinity for oxygen, facilitating O2 release in tissues.',
        html: `<h2>DEOXY HEMOGLOBIN</h2>
        <p><strong>Primary Function:</strong> Allosteric O₂ Regulation</p>
        <p>In the deoxygenated T-state, the subunits are held together by salt bridges that must be broken for oxygen to bind.</p>
        <ul>
            <li><strong>Conformation:</strong> Transitioning from the T-state to the R-state (relaxed) increases O₂ affinity by 150 times.</li>
            <li><strong>Visual:</strong> Shows the physical shift of the iron atom into the plane of the heme ring upon binding.</li>
        </ul>` 
    },
    { 
        pdb: '1ATP', name: 'ATP Synthase', desc: 'Energy Production', color: 'gold',
        info: 'The "world\'s smallest rotary motor," this enzyme produces ATP from ADP using a proton gradient across a membrane.',
        html: `<h2>ATP SYNTHASE</h2>
        <p><strong>Primary Function:</strong> Cellular Energy Synthesis</p>
        <p>This massive complex uses the flow of protons (like water through a turbine) to mechanically rotate and catalyze the creation of ATP.</p>
        <ul>
            <li><strong>Efficiency:</strong> Operates at near 100% mechanical efficiency.</li>
            <li><strong>Location:</strong> Embedded in the inner mitochondrial membrane and thylakoid membranes.</li>
        </ul>` 
    },
    { 
        pdb: '1UBQ', name: 'Ubiquitin', desc: 'Protein Tagging', color: 'purple',
        info: 'Ubiquitin is a small, highly conserved regulatory protein that labels other proteins for destruction by the proteasome.',
        html: `<h2>UBIQUITIN</h2>
        <p><strong>Primary Function:</strong> Protein Degradation Signaling</p>
        <p>The "kiss of death." Attaching a chain of ubiquitin molecules to a protein signals the cell to recycle it.</p>
        <ul>
            <li><strong>Conservation:</strong> Virtually identical in all eukaryotes, from yeast to humans.</li>
            <li><strong>Versatility:</strong> Also regulates DNA repair, autophagy, and cell division.</li>
        </ul>` 
    },
    { 
        pdb: '1BYI', name: 'Beta-lactamase', desc: 'Antibiotic Resistance', color: 'orange',
        info: 'Beta-lactamases are enzymes produced by bacteria that provide multi-resistance to beta-lactam antibiotics like penicillin.',
        html: `<h2>BETA-LACTAMASE</h2>
        <p><strong>Primary Function:</strong> Antibiotic Deactivation</p>
        <p>The enzyme breaks the four-atom beta-lactam ring, rendering the antibiotic ineffective before it can reach its target.</p>
        <ul>
            <li><strong>Evolution:</strong> A major hurdle in modern medicine and the primary cause of penicillin resistance.</li>
            <li><strong>Mechanism:</strong> Often secreted into the periplasmic space by Gram-negative bacteria.</li>
        </ul>` 
    },
    { 
        pdb: '1THM', name: 'Thrombin', desc: 'Blood Clotting', color: 'blood-red',
        info: 'Thrombin is a serine protease that converts soluble fibrinogen into insoluble fibrin strands, forming a blood clot.',
        html: `<h2>THROMBIN</h2>
        <p><strong>Primary Function:</strong> Coagulation Cascade</p>
        <p>Thrombin acts as a metabolic switch in the blood, triggering clotting, platelet activation, and wound healing.</p>
        <ul>
            <li><strong>Control:</strong> Its activity is strictly regulated by antithrombin to prevent dangerous internal clotting.</li>
            <li><strong>Feedback:</strong> It can also activate its own precursors to accelerate the clotting process.</li>
        </ul>` 
    },
    { 
        pdb: '2ACE', name: 'Acetylcholinesterase', desc: 'Neurotransmission', color: 'cyan',
        info: 'This enzyme terminates nerve impulses by rapidly breaking down the neurotransmitter acetylcholine in the synaptic cleft.',
        html: `<h2>ACETYLCHOLINESTERASE</h2>
        <p><strong>Primary Function:</strong> Neural Signal Termination</p>
        <p>It is one of the most efficient enzymes in nature, ensuring that nerves can reset fast enough for the next signal.</p>
        <ul>
            <li><strong>Speed:</strong> A single enzyme molecule can hydrolyze 25,000 molecules of acetylcholine per second.</li>
            <li><strong>Inhibition:</strong> The target of nerve agents (like Sarin) and many pesticides.</li>
        </ul>` 
    },
    { 
        pdb: '1POH', name: 'Porin', desc: 'Membrane Channel', color: 'blue',
        info: 'Porins are beta-barrel proteins that cross a cellular membrane and act as a pore through which molecules can diffuse.',
        html: `<h2>PORIN</h2>
        <p><strong>Primary Function:</strong> Passive Molecular Transport</p>
        <p>Unlike most membrane proteins that use alpha-helices, porins are built from a large "barrel" of beta-strands.</p>
        <ul>
            <li><strong>Selectivity:</strong> Some are general-purpose, while others are "gated" to only allow specific sugars or ions.</li>
            <li><strong>Robustness:</strong> The barrel structure is extremely stable against temperature and chemical stress.</li>
        </ul>` 
    },
    { 
        pdb: '1MBO', name: 'Myoglobin', desc: 'Oxygen Storage', color: 'dark-red',
        info: 'Myoglobin is an iron- and oxygen-binding protein found in the muscle tissue of vertebrates. It serves as an intracellular storage site for oxygen.',
        html: `<h2>MYOGLOBIN</h2>
        <p><strong>Primary Function:</strong> Intracellular O₂ Storage</p>
        <p>Myoglobin facilitates oxygen diffusion and serves as a reserve in muscle tissues. It has a higher affinity for oxygen than hemoglobin, allowing it to "grab" oxygen as it is released from the blood.</p>
        <ul>
            <li><strong>Historic Milestone:</strong> The first protein structure ever solved via X-ray crystallography (1958).</li>
            <li><strong>Structure:</strong> A single polypeptide chain with eight alpha-helices surrounding a central heme group.</li>
        </ul>` 
    },
    { 
        pdb: '1FDH', name: 'Fetal Hemoglobin (HbF)', desc: 'Placental Oxygen Transfer', color: 'pink',
        info: 'HbF is the main oxygen transport protein in the human fetus. It has a higher affinity for oxygen than adult hemoglobin, allowing it to extract O2 from maternal blood.',
        html: `<h2>FETAL HEMOGLOBIN</h2>
        <p><strong>Primary Function:</strong> Placental O₂ Transfer</p>
        <p>HbF consists of two alpha and two gamma chains. This composition prevents the binding of 2,3-BPG, giving it a higher oxygen affinity than adult HbA.</p>
        <ul>
            <li><strong>Clinical Significance:</strong> Reactivating HbF production in adults is a key strategy for treating Sickle Cell Disease.</li>
            <li><strong>Transition:</strong> Usually replaced by adult hemoglobin within the first six months of birth.</li>
        </ul>` 
    },
    { 
        pdb: '2HBS', name: 'Sickle Hemoglobin (HbS)', desc: 'Hemoglobinopathy', color: 'purple',
        info: 'HbS is a variant of hemoglobin caused by a single mutation. It causes red blood cells to rigidify into a sickle shape when deoxygenated.',
        html: `<h2>SICKLE HEMOGLOBIN</h2>
        <p><strong>Primary Function:</strong> Mutated O₂ Transport</p>
        <p>A single amino acid substitution (Glu→Val) creates a hydrophobic patch that causes hemoglobin tetramers to polymerize into long fibers under low oxygen conditions.</p>
        <ul>
            <li><strong>Evolutionary Paradox:</strong> The trait persists because it provides significant resistance against malaria.</li>
            <li><strong>Pathology:</strong> Leads to vascular occlusion, anemia, and organ damage.</li>
        </ul>` 
    },
    { 
        pdb: '1CA2', name: 'Carbonic Anhydrase', desc: 'pH & CO2 Regulation', color: 'cyan',
        info: 'Carbonic Anhydrase catalyzes the rapid interconversion of carbon dioxide and water to bicarbonate and protons.',
        html: `<h2>CARBONIC ANHYDRASE</h2>
        <p><strong>Primary Function:</strong> CO₂ / Bicarbonate Interconversion</p>
        <p>This enzyme is essential for respiration, pH homeostasis, and fluid secretion. It is one of the fastest enzymes known to science.</p>
        <ul>
            <li><strong>Catalytic Power:</strong> Processes roughly one million reactions per second.</li>
            <li><strong>Active Site:</strong> Contains a essential Zinc (Zn²⁺) ion coordinated by three histidine residues.</li>
        </ul>` 
    },
    { 
        pdb: '1FHA', name: 'Ferritin', desc: 'Iron Storage', color: 'orange',
        info: 'Ferritin is a universal intracellular protein that stores iron and releases it in a controlled fashion. It acts as a buffer against iron deficiency and iron overload.',
        html: `<h2>FERRITIN</h2>
        <p><strong>Primary Function:</strong> Intracellular Iron Storage</p>
        <p>Ferritin forms a hollow, spherical shell that safely sequesters iron in a non-toxic, mineralized form (ferrihydrite).</p>
        <ul>
            <li><strong>Capacity:</strong> A single ferritin shell can store up to 4,500 iron atoms.</li>
            <li><strong>Structure:</strong> Composed of 24 subunits consisting of "Heavy" (H) and "Light" (L) chains.</li>
        </ul>` 
    },
    { 
        pdb: '6W4S', name: 'Ferroportin', desc: 'Iron Export', color: 'teal',
        info: 'Ferroportin is the only known protein that exports iron from the inside of a cell to the outside.',
        html: `<h2>FERROPORTIN</h2>
        <p><strong>Primary Function:</strong> Cellular Iron Export</p>
        <p>It is found on the surface of cells that store or transport iron, such as enterocytes and macrophages. It is the critical "gate" for systemic iron entry into the blood.</p>
        <ul>
            <li><strong>Regulation:</strong> It is the target of the hormone Hepcidin, which triggers its degradation to lower blood iron levels.</li>
            <li><strong>Symmetry:</strong> A transmembrane transporter with two lobes that switch between inward and outward-facing states.</li>
        </ul>` 
    },
    { 
        pdb: '1M4F', name: 'Hepcidin', desc: 'Iron Homeostasis', color: 'gold',
        info: 'Hepcidin is a peptide hormone produced by the liver that acts as the master regulator of iron systemic entry in humans.',
        html: `<h2>HEPCIDIN</h2>
        <p><strong>Primary Function:</strong> Systemic Iron Regulation</p>
        <p>By binding to ferroportin, hepcidin blocks the release of iron into the plasma, effectively sequestering iron within cells.</p>
        <ul>
            <li><strong>Size:</strong> A very small peptide of only 25 amino acids.</li>
            <li><strong>Clinical Link:</strong> High levels lead to anemia of chronic disease; low levels cause hemochromatosis (iron overload).</li>
        </ul>` 
    },
    { 
        pdb: '2B3Y', name: 'IRP1 (Aconitase)', desc: 'Iron Sensing', color: 'lime',
        info: 'IRP1 is a unique dual-function protein. It acts as either a metabolic enzyme or an RNA-binding protein depending on iron availability.',
        html: `<h2>IRP1 / ACONITASE</h2>
        <p><strong>Primary Function:</strong> Iron Sensing / TCA Cycle</p>
        <p>When iron is abundant, it binds an Fe-S cluster and acts as an aconitase enzyme. When iron is scarce, it loses the cluster and binds to RNA to regulate protein synthesis.</p>
        <ul>
            <li><strong>Moonlighting:</strong> A classic example of a "moonlighting protein" with two unrelated roles.</li>
            <li><strong>Mechanism:</strong> Regulates the translation of ferritin and transferrin receptor mRNAs.</li>
        </ul>` 
    },
    { 
        pdb: '6ELW', name: 'GPX4', desc: 'Lipid Protection', color: 'silver',
        info: 'Glutathione peroxidase 4 (GPX4) is an enzyme that protects cells against oxidative damage by neutralizing lipid peroxides.',
        html: `<h2>GPX4</h2>
        <p><strong>Primary Function:</strong> Prevention of Lipid Peroxidation</p>
        <p>GPX4 is a selenium-dependent enzyme that reduces lipid hydroperoxides to non-toxic lipid alcohols.</p>
        <ul>
            <li><strong>Ferroptosis:</strong> Inhibition or loss of GPX4 leads to ferroptosis, a form of regulated cell death driven by iron-dependent lipid peroxidation.</li>
            <li><strong>Active Site:</strong> Contains the rare amino acid Selenocysteine.</li>
        </ul>` 
    },

    { 
        pdb: '1CA2', name: 'Carbonic Anhydrase', desc: 'pH & CO2 Regulation', color: 'cyan',
        info: 'Carbonic Anhydrase catalyzes the rapid interconversion of carbon dioxide and water to bicarbonate and protons.',
        html: `<h2>CARBONIC ANHYDRASE</h2>
        <p><strong>Primary Function:</strong> CO₂ / Bicarbonate Interconversion</p>
        <p>This enzyme is essential for respiration, pH homeostasis, and fluid secretion. It is one of the fastest enzymes known to science.</p>
        <ul>
            <li><strong>Catalytic Power:</strong> Processes roughly one million reactions per second.</li>
            <li><strong>Active Site:</strong> Contains a essential Zinc (Zn²⁺) ion coordinated by three histidine residues.</li>
        </ul>` 
    },
    { 
        pdb: '1FHA', name: 'Ferritin', desc: 'Iron Storage', color: 'orange',
        info: 'Ferritin is a universal intracellular protein that stores iron and releases it in a controlled fashion. It acts as a buffer against iron deficiency and iron overload.',
        html: `<h2>FERRITIN</h2>
        <p><strong>Primary Function:</strong> Intracellular Iron Storage</p>
        <p>Ferritin forms a hollow, spherical shell that safely sequesters iron in a non-toxic, mineralized form (ferrihydrite).</p>
        <ul>
            <li><strong>Capacity:</strong> A single ferritin shell can store up to 4,500 iron atoms.</li>
            <li><strong>Structure:</strong> Composed of 24 subunits consisting of "Heavy" (H) and "Light" (L) chains.</li>
        </ul>` 
    },
 /*   { 
        pdb: '6W4S', name: 'Ferroportin', desc: 'Iron Export', color: 'teal',
        info: 'Ferroportin is the only known protein that exports iron from the inside of a cell to the outside.',
        html: `<h2>FERROPORTIN</h2>
        <p><strong>Primary Function:</strong> Cellular Iron Export</p>
        <p>It is found on the surface of cells that store or transport iron, such as enterocytes and macrophages. It is the critical "gate" for systemic iron entry into the blood.</p>
        <ul>
            <li><strong>Regulation:</strong> It is the target of the hormone Hepcidin, which triggers its degradation to lower blood iron levels.</li>
            <li><strong>Symmetry:</strong> A transmembrane transporter with two lobes that switch between inward and outward-facing states.</li>
        </ul>` 
    },
*/
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
            const proteinIdx = idx+2; // idx=1 -> protein 3, idx=2 -> protein 4, idx=3 -> protein 5
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