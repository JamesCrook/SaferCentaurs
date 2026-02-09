function activateBlocks() {
    const blocks = document.querySelectorAll('.lcars-block');
    
    blocks.forEach(block => {
        // 1. Clear ALL previous listeners and inline styles by cloning
        const newBlock = block.cloneNode(true);
        // Reset any inline background color left over from previous hovers
        newBlock.style.backgroundColor = ''; 
        block.parentNode.replaceChild(newBlock, block);
        
        newBlock.addEventListener('click', function(event) {
            const action = this.getAttribute('data-group');
            const pdbId = this.getAttribute('data-pdb');
            lightUpGroup(action);
            handleBlockClick(action, pdbId, event);
        });
    });

    // 2. Now that the DOM is "fresh", bind the hover logic
    hoverEnableBlocks();
}

function lightUpGroup(groupName) {
    // Remove active class from all blocks
    document.querySelectorAll('.lcars-block').forEach(block => {
        block.classList.remove('active');
    });
    return;
    
    // Add active class to all blocks with matching data-group
    if (groupName) {
        document.querySelectorAll(`.lcars-block[data-group="${groupName}"]`).forEach(block => {
            block.classList.add('active');
        });
    }
}


const lighten = (hex, amt = 40) => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amt);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const b = Math.min(255, (num & 0x0000FF) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};


function hoverEnableBlocks() {
    const colorMap = new Map();

    // Query the "fresh" blocks created in activateBlocks
    document.querySelectorAll('.lcars-block[data-group]').forEach(el => {
        // Get current computed color
        const style = getComputedStyle(el);
        const colorKey = style.backgroundColor; // Simplified key

        if (!colorMap.has(colorKey)) colorMap.set(colorKey, []);
        colorMap.get(colorKey).push(el);
    });

    colorMap.forEach((elements, colorKey) => {
        // Calculate hover color once per group
        const rgbArray = colorKey.match(/\d+/g).map(Number);
        const hex = `#${rgbArray.map(x => x.toString(16).padStart(2, '0')).join('')}`;
        const hoverColor = lighten(hex, 40);

        elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.forEach(target => target.style.backgroundColor = hoverColor);
            });
            el.addEventListener('mouseleave', () => {
                elements.forEach(target => target.style.backgroundColor = '');
            });
        });
    });
}



function handleBlockClick(action, pdbId, event) {
    // Navigation buttons
    if (action === 'PrevBatch') {
        prevBatch();
        return;
    }
    if (action === 'NextBatch') {
        nextBatch();
        return;
    }
    
    // If the button has a PDB ID, it's a protein button
    if (pdbId) {
        switchMolecule(pdbId, action);
        return;
    }
    
    // Otherwise, use the Lcars.doCommand system
    if (typeof Lcars !== 'undefined' && typeof Lcars.doCommand === 'function') {
        Lcars.doCommand(event);
    } else {
        // Fallback to direct handling
        handleBlockClickDirect(action);
    }
}

function handleBlockClickDirect(action) {
    const actionLower = action ? action.toLowerCase() : '';
    
    // Representation changes
    if (action === 'Cartoon') changeRepresentation('cartoon');
    else if (action === 'Spacefill') changeRepresentation('spacefill');
    else if (action === 'Surface') changeRepresentation('surface');
    else if (action === 'Licorice') changeRepresentation('licorice');
    else if (action === 'Ball + Stick') changeRepresentation('ball+stick');
    
    // View controls
    else if (action === 'Toggle Spin') toggleSpin();
    else if (action === 'Recenter') centerView();
    else if (action === 'Reset') resetAll();
    
    // Theme
    else if (action === 'Dark UI') setTheme('dark');
    else if (action === 'Light UI') setTheme('light');
    
    // Info sections
    else if (action === 'Overview') showInfoSection('overview');
    else if (action === 'Credits') showInfoSection('credits');
}

// Re-activate blocks after dynamic updates
function reactivateBlocks() {
    activateBlocks();
}