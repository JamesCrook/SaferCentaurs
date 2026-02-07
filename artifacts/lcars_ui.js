// Handle LCARS block interactions with button lighting
function activateBlocks() {
    const blocks = document.querySelectorAll('.lcars-block');
    
    blocks.forEach(block => {
        // Remove any existing click listeners by cloning
        const newBlock = block.cloneNode(true);
        block.parentNode.replaceChild(newBlock, block);
        
        newBlock.addEventListener('click', function(event) {
            const action = this.getAttribute('data-group');
            const pdbId = this.getAttribute('data-pdb');
            
            // Light up all blocks with the same data-group
            lightUpGroup(action);
            
            // Handle the action
            handleBlockClick(action, pdbId, event);
        });
    });
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
  const blocks = new Map();
  document.querySelectorAll('.lcars-block[data-group]').forEach(el => {
    const group = el.dataset.group;

    // We could highlight all blocks of the same group (i.e. command) together,
    // However it is a cooler look if we highlight all blcoks of the same colour
    const rgbArray = getComputedStyle(el).backgroundColor.match(/\d+/g).map(
      Number);
    const colorKey = rgbArray.join(',');

    if(!blocks.has(colorKey)) blocks.set(colorKey, []);
    blocks.get(colorKey).push({
      el,
      orig: rgbArray

    });
/*    
    el.onclick = Lcars.doCommand;
    if(group) {
      if(!el.classList.contains('stub'))
        el.innerText = group;
    }
*/    
  });

  blocks.forEach(group => {
    const hex =
      `#${group[0].orig.map(x => x.toString(16).padStart(2, '0')).join('')}`;
    const hover = lighten(hex);
    group.forEach(({
      el,
      orig
    }) => {
      el.addEventListener('mouseenter', () =>
        group.forEach(({
          el
        }) => el.style.backgroundColor = hover));
      el.addEventListener('mouseleave', () =>
        group.forEach(({
          el,
          orig
        }) => el.style.backgroundColor = ''));
    });
  });
};




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