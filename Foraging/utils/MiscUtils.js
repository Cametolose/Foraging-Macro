import MacroState from "../constants/MacroState.js";

class MiscUtils {
    waitTicks(ticks, callback) {
        let counter = 0;
        MacroState.isMacroRunning = true; // Set flag when starting

        const tickListener = register("tick", () => {
            if (!MacroState.isMacroRunning) { // Check if it should stop
                tickListener.unregister();
                MacroState.activeListeners = MacroState.activeListeners.filter(l => l !== tickListener);
                return;
            }
            counter++;
            if (counter >= ticks) {
                tickListener.unregister();
                MacroState.activeListeners = MacroState.activeListeners.filter(l => l !== tickListener);
                if (MacroState.isMacroRunning) callback(); // Only callback if still running
            }
        });
        
        MacroState.activeListeners.push(tickListener);
    };

    setHotbarSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex > 8) return;
        Client.getMinecraft().field_71439_g.field_71071_by.field_70461_c = slotIndex;
    }

}

export default new MiscUtils;