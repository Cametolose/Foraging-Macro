import MacroState from "../constants/MacroState.js";

const mc = Client.getMinecraft();

const rightClickMouse = mc.getClass().getDeclaredMethod("func_147121_ag");
const leftClickMouse = mc.getClass().getDeclaredMethod("func_147116_af");

rightClickMouse.setAccessible(true);
leftClickMouse.setAccessible(true);


class ClickUtils {
    rightClick() {
        rightClickMouse.invoke(mc);
    };

    leftClick() {
        leftClickMouse.invoke(mc);
    };

    delayClick(clickFunc, count) {
        let clicksDone = 0;
        let tickCounter = 0;
        MacroState.isMacroRunning = true; // Set flag when starting

        const clickInterval = register("tick", () => {
            if (!MacroState.isMacroRunning) { // Check if it should stop
                clickInterval.unregister();
                MacroState.activeListeners = MacroState.activeListeners.filter(l => l !== clickInterval);
                return;
            }
            tickCounter++;
            if (tickCounter >= 2) {
                clickFunc();
                clicksDone++;
                tickCounter = 0;
            }
            if (clicksDone >= count) {
                clickInterval.unregister();
                MacroState.activeListeners = MacroState.activeListeners.filter(l => l !== clickInterval);
            }
        });

        MacroState.activeListeners.push(clickInterval);
    };
}

export default new ClickUtils();