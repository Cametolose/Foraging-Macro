import MacroState from "./constants/MacroState.js";
import MouseUtils from './utils/MouseUtils.js';
import KeyUtils from './utils/KeyUtils.js'; 
import Click from './utils/ClickUtils.js';
import Misc from './utils/MiscUtils.js';

const rightClick = () => Click.rightClick();
const leftClick = () => Click.leftClick();

const foragingKeyBind = new KeyBind("Start Foraging Macro", Keyboard.KEY_P, "Foraging Macro")
const autopetKeybind = new KeyBind("Toggle Autopet", Keyboard.KEY_O, "Foraging Macro")

foundAxe = false;
foundSapling = false;
foundBonemeal = false;
foundRod = false;

let variants = ["wooden", "golden", "stone", "iron", "diamond", "netherite"];
let missingTools = [];
let config = { enabled: false };


function loadConfig() {
  try {
    const content = FileLib.read("Foraging", "config.json");
    config = JSON.parse(content);
  } catch (e) {
    saveConfig();
  }
}

function saveConfig() {
  FileLib.write("Foraging", "config.json", JSON.stringify(config, null, 2));
}

// Load config when script starts
register("gameLoad", () => {
    loadConfig();
    ChatLib.chat(`Foraging Macro loaded. Autopet: ${config.enabled ? "§aENABLED" : "§cDISABLED"}`);
});

register("tick", () => {
    if (foragingKeyBind.isPressed()) {
        if (!MacroState.isForaging ) {
            MacroState.isForaging  = true;
            ChatLib.chat("§aForaging macro starting...");
            startForaging(); // Start the foraging logic immediately
        } else {
            stopForaging();
        }
    }

    if (autopetKeybind.isPressed()) {
        config.enabled = !config.enabled; // Toggle the value
        ChatLib.chat(config.enabled ? "§aEnabled Autopet" : "§cDisabled Autopet");
        saveConfig();
    }
});



function stopForaging() {
    // Immediately unregister all active listeners
    MacroState.activeListeners.forEach(listener => listener.unregister());
    MacroState.activeListeners = [];
    
    MouseUtils.resetMouse();
    MacroState.isMacroRunning = true;
    MacroState.isForaging  = false;
    foundAxe = false; // Reset found status
    foundBonemeal = false; 
    foundRod = false;
    foundSapling = false;
    missingTools = [];
    KeyUtils.releaseKeys(); // Stop all keys   
    ChatLib.chat("§cForaging macro stopped!");
}

// Function to handle the foraging logic
function startForaging() {
    if (!MacroState.isForaging ) {
        return; // Exit if not in foraging mode
    }

    MouseUtils.ungrab();

    for (let i = 0; i < 9; i++) {
        let item = Player.getInventory().getStackInSlot(i);

        //let test = Player.getInventory().getStackInSlot(5);
        if (item !== null) {
            itemAmount = item.getStackSize();
        } else {
            itemAmount = 0;
        }
        
        ChatLib.chat(itemAmount);


        if (item) {
            itemName = item.getItem().getRegistryName();
            

            if (variants.some(v => itemName === `minecraft:${v}_axe`)) {
                ChatLib.chat(itemAmount);
                foundAxe = true;
                slotAxe = i;
            } 

            if (itemName === "minecraft:sapling") {
                foundSapling = true;
                slotSapling = i;
            }

            if (item.getName().includes("Bone Meal")) { // CHANGE THIS TO "Enchanted Bone Meal" !!!!! DON'T FORGET ------------------------------------ Vanilla testing -------------------------------------
                foundBonemeal = true;
                slotBoneMeal = i;
            } 

            if (itemName === "minecraft:fishing_rod" && item.getName() !== "§aGrappling Hook") {
                foundRod = true;
                slotFishingRod = i;
            }
        }
    }

    if (!foundAxe) {
        missingTools.push("Axe");
    } 
    
    if (!foundSapling) {
        missingTools.push("Saplings");
    }

    if (!foundBonemeal) {
        missingTools.push("Enchanted Bone Meal");
    }

    if (!foundRod) {
        missingTools.push("Fishing Rod");
    }

    if (foundAxe && foundSapling && foundBonemeal) {
        if (foundRod) {
            foraging();
        } else {
            ChatLib.chat(`Missing §bFishing Rod§r. Starting without Autopet`);
            //autopet = false;
            foraging();
        }
        
    } else {
        ChatLib.chat(`§l§4Missing: §b${missingTools.join(", ")}`);
        stopForaging();
    }
}


function foraging() {
    MacroState.isMacroRunning = true; // Reset flag


    Misc.setHotbarSlot(slotSapling);

    KeyUtils.pressKey("s", true); // Hold S to move backward

    KeyUtils.pressKey("d", true); // Hold D
    Misc.waitTicks(4, () => {       // Wait 2 seconds
        Click.delayClick(rightClick, 2); // Place Saplings 1

        Misc.waitTicks(6, () => {
            KeyUtils.pressKey("d", false); // Stop holding D
            
            KeyUtils.pressKey("a", true); // Hold A


            Misc.waitTicks(4, () => {
                Click.delayClick(rightClick, 2); // Place Saplings 2


                Misc.waitTicks(6, () => {
                    //KeyUtils.pressKey("a", false); // Stop A

                    Misc.setHotbarSlot(slotBoneMeal); // Set hotbar to Bonemeal

                    Misc.waitTicks(4, () => {
                        Click.delayClick(rightClick, 1); // Use Bonemeal

                        Misc.waitTicks(4, () => {
                            Misc.setHotbarSlot(slotAxe); // Set hotbar to Axe

                            Misc.waitTicks(4, () => {
                                Click.delayClick(leftClick, 1); // Use Axe to chop tree

                                Misc.waitTicks(4, () => {
                                    if (config.enabled) {
                                        Misc.setHotbarSlot(slotFishingRod); // Set hotbar to Rod for AutoPet
                                    };
                                    
                                    Misc.waitTicks(4, () => {
                                        if (config.enabled) {
                                            Click.delayClick(rightClick, 1); // Cast fishing Rod
                                        }
                                        
                                        KeyUtils.pressKey("a", false); // Stop A

                                        Misc.waitTicks(4, () => {
                                            if (MacroState.isMacroRunning) foraging(); // Repeat 
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}