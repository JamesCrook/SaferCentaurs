let marsBase = {
  resources: {
    thermal: 0,
    electrical: 0,
    days: 0,

    regolith: 0,
    iron: 0,
    carbon_monoxide: 0,
    aluminum: 0,
    sulfur: 0,
    glass: 0,
    ceramics: 0,
    glass_fiber: 0,
    sulfur_concrete: 0,
    sodium_chloride: 0,
    lqd_carbon_dioxide: 0,
    hydrogen: 0,
    oxygen: 0,
    graphite: 0,
    wire_coating: 0,
    lithium: 0,
    water_atmospheric: 0,
    water_subsurface: 0,
    sulfuric_acid: 0,
    // each solar unit is 100kWh/sol, and is 100 m^2 of mirror.
    // each mirror is 1 m^2
    // The starship ships 2 mW worth of collectors to Mars, i.e. 20.
    mirrors: 1000,
    solar_concentrators: 20,
    // We can make robots and batteries, but they are not yet relevant to the gameplay.
    // - energy electrical and thermal currently is mystically stored until used.
    // - robots aren't yet needed to operate all the machinery.
    robots: 10,
    batteries: 10, // in kWh
    electronic_modules: 10000,
  },
  multipliers: {},
  produced: {},
  units: {
    thermal: 'kWh',
    electrical: 'kWh',
    days: 'days',
    mirrors: 'mirrors',
    solar_concentrators: 'units',
    robots: 'robots',
    batteries: 'batteries',
    electronic_modules: 'circuits',
  },
  // using a trough collector (no movement) and 10 fold concentration.
  // CO2 hot at 400 C
  // CO2 cold at 30 C
  energyGeneration: {
    mirrorsPerConcentrator: 100, //m^2
    outputPerConcentrator: 888, // in kWh per sol during daylight hours
    heatPerConcentrator: 277.8 * 10.6, // in GJ per sol during daylight hours
    capacityPerBattery: 10, // in kWh
  }
};

// Recipes
const productionRecipes = {
  regolith: {
    thermal: 277.8 * 1, // kWh
    electrical: 300, // kWh
  },
  iron: {
    thermal: 277.8 * 4.5, // kWh
    electrical: 650, // kWh
    regolith: 1,
    carbon_monoxide: 0.5
  },
  carbon_monoxide: {
    thermal: 277.8 * 2, // kWh
    electrical: 300, // kWh
    // free from the air... {carbon_dioxide: 2.5 }
  },
  aluminum: {
    thermal: 277.8 * 13.5, // kWh
    electrical: 15330, // kWh
    sodium_chloride: 1.2
  },
  sulfur: {
    thermal: 277.8 * 6.5, // kWh
    electrical: 1700, // kWh
    regolith: 5
  },
  glass: {
    thermal: 277.8 * 6.2, // kWh
    electrical: 0, // No electrical cost
    regolith: 1.2
  },
  ceramics: {
    thermal: 277.8 * 4.2, // kWh
    electrical: 0, // No electrical cost
    regolith: 1.2
  },
  glass_fiber: {
    thermal: 277.8 * 11, // kWh
    electrical: 420, // kWh
    glass: 1.1
  },
  sulfur_concrete: {
    thermal: 277.8 * 2.8, // kWh
    electrical: 90, // kWh
    regolith: 0.8,
    sulfur: 0.2
  },
  sodium_chloride: {
    thermal: 277.8 * 11.5, // kWh
    electrical: 3300, // kWh
    regolith: 10
  },
  lqd_carbon_dioxide: {
    thermal: 277.8 * 0.2, // kWh
    electrical: 60, // kWh
    // { carbon_dioxide: 1 }
  },
  hydrogen: {
    electrical: 6300,
    water_atmospheric: 1,
  },
  oxygen: {
    thermal: 277.8 * 4.5, // kWh (average of 4-5 GJ/ton)
    electrical: 1800, // kWh
    // { carbon_dioxide: 2.5 }
  },
  graphite: {
    thermal: 277.8 * 7, // kWh
    electrical: 1000, // kWh
    // { carbon_dioxide: 3  }
  },
  wire_coating: {
    thermal: 277.8 * 2.3, // kWh
    electrical: 510, // kWh
    sulfur: 0.3,
    aluminum: 0.7
  },
  lithium: {
    thermal: 277.8 * 17, // kWh
    electrical: 26500, // kWh
    regolith: 5
  },
  water_atmospheric: {
    thermal: 277.8 * 0.5, // kWh
    electrical: 250, // kWh
    // { carbon_dioxide: 10 }
  },
  water_subsurface: {
    thermal: 277.8 * 2, // kWh
    electrical: 3000, // kWh
    ice: 1.5
  },
  sulfuric_acid: {
    thermal: 277.8 * 2.95, // kWh
    electrical: 610, // kWh
    sulfur: 0.3,
    water_atmospheric: 1
  },

  mirrors: {
    thermal: 277.8 * 0.5, // kWh
    electrical: 100, // kWh
    aluminum: 0.002,
    sulfur_concrete: 0.01,
    iron: 0.006
  },
  solar_concentrators: {
    thermal: 277.8 * 0.5, // kWh
    electrical: 10000, // kWh
    sulfur_concrete: 1.0,
    iron: 0.3,
    ceramics: 0.3,
    sodium_chloride: 0.6,
    electronic_modules: 2,
  },
  robots: {
    thermal: 277.8 * 0.1, // kWh
    electrical: 100, // kWh
    wire_coating: 0.001,
    iron: 0.3,
    ceramics: 0.3,
    sodium_chloride: 0.6,
    electronic_modules: 10,
  },
  batteries: {
    thermal: 277.8 * 0.1, // kWh
    electrical: 100, // kWh
    wire_coating: 0.001,
    iron: 0.3,
    ceramics: 0.3,
    sodium_chloride: 0.6,
    lithium: 0.1,
    electronic_modules: 1,
  },
};

// Simulation step
// a day passing makes more thermal and electrical energy.
function simulationStep(quantity) {
  calculateAvailableEnergy(quantity);
  console.log("Energy levels updated:", marsBase.energy);
  return true;
}

// splitting water makes two resources...
function waterSplit(quantity) {
  const res = marsBase.resources;
  if(checkAndDeductResources(productionRecipes['hydrogen'], quantity)) {
    res.hydrogen += 0.111
    res.oxygen += 0.888;
    return true;
  }
  return false;
}

const codeRecipes = {
  thermal: simulationStep,
  electrical: simulationStep,
  days: simulationStep,
  hydrogen: waterSplit,
}

function initAuxData() {
  Object.entries(marsBase.resources).forEach(([key, value]) => {
    marsBase.multipliers[key] = 1;
    marsBase.produced[key] = 0;
    marsBase.units[key] = marsBase.units[key] || 'tonnes';
  });
}

initAuxData();

function formatNumber(num) {
  const units = ['', 'k', 'M', 'B', 'T'];
  const i = num === 0 ? 0 : Math.floor(Math.log10(Math.abs(num)) / 3);
  const scaled = num / Math.pow(1000, i);
  return parseFloat(scaled.toPrecision(4)) + (units[i] || '');
}

// Support subroutines

function calculateAvailableEnergy(quantity) {
  const res = marsBase.resources;
  const prod = marsBase.produced;

  const mirrors = res.mirrors;
  const solar_concentrators = res.solar_concentrators;
  const {
    mirrorsPerConcentrator,
    outputPerConcentrator,
    heatPerConcentrator
  } = marsBase.energyGeneration;

  const activeConcentrators = Math.min(solar_concentrators, Math.floor(mirrors /
    mirrorsPerConcentrator));
  const electricalOutput = activeConcentrators * outputPerConcentrator;
  const thermalOutput = activeConcentrators * heatPerConcentrator;

  res.electrical += electricalOutput * quantity;
  res.thermal += thermalOutput * quantity;
  res.days += quantity;
  prod.electrical += electricalOutput * quantity;
  prod.thermal += thermalOutput * quantity;
}

function checkAndDeductResources(requiredResources, quantity) {
  for(const resource in requiredResources) {
    let avail = marsBase.resources[resource];
    avail = avail || 0;
    let need = quantity * requiredResources[resource]
    if(avail < need) {
      console.log(
        `Insufficient ${resource} for production. Have ${avail} need ${need}`);
      return false;
    }
  }
  for(const resource in requiredResources) {
    marsBase.resources[resource] -= quantity * requiredResources[resource];
  }
  return true;
}

function available(resource) {
  avail = marsBase.resources[resource];
  if(avail)
    return avail;
  return 0;
}

function r(value) {
  if(value < 10000)
    return Math.round(value * 1000) / 1000;
  return formatNumber(value);
}

function listResources(requiredResources, quantity = 1) {
  if(!requiredResources)
    return "";
  let str = "";
  for(const resource in requiredResources) {
    let avail = available(resource);
    let need = requiredResources[resource] * quantity
    let classy = (avail < need) ? " class='shortage'" : ""
    str += `<div${classy}>${resource}:${r(avail)} of ${r(need)}</div>`;
  }
  return '<p> </p>' + str;
}

function produce(resource, quantity) {
  if(codeRecipes[resource]) {
    return codeRecipes[resource](quantity);
  }
  if(!productionRecipes[resource]) {
    throw new Error(`Unknown resource: ${resource}`);
  }

  const inputs = productionRecipes[resource];

  if(!checkAndDeductResources(inputs, quantity)) {
    return false;
  }

  if(marsBase.resources[resource] !== undefined) {
    marsBase.resources[resource] = (marsBase.resources[resource] || 0) +
      quantity;
    marsBase.produced[resource] += quantity;
    console.log(`${quantity} of ${resource} produced.`);
  }
  return true;
}

// Main subroutine

function executeInstruction(instruction) {
  const {
    resource,
    quantity
  } = instruction;

  try {
    produce(resource, quantity)
  } catch (error) {
    console.error(error.message);
  }
}
