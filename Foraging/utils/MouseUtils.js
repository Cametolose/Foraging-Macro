class MouseUtils {
  constructor() {
    this.Mouse = Java.type("org.lwjgl.input.Mouse");
    this.MouseHelper = Java.type("net.minecraft.util.MouseHelper");

    this.isDetached = false;
    this.originalHelper = null;

    register("gameUnload", () => this.resetMouse());
  }

  ungrab() {
    if (this.isDetached) return;

    const mc = Client.getMinecraft();
    mc.field_71474_y.field_82881_y = false; // pauseOnLostFocus

    if (!this.originalHelper) {
      this.originalHelper = mc.field_71417_B; // mouseHelper
    }

    this.originalHelper.func_74373_b(); // ungrabMouseCursor
    mc.field_71415_G = true; // inGameHasFocus

    mc.field_71417_B = new JavaAdapter(this.MouseHelper, {
      func_74374_c: () => {}, // mouseXYChange
      func_74372_a: () => {}, // grabMouseCursor
      func_74373_b: () => {}, // ungrabMouseCursor
    });

    this.isDetached = true;
  }

  resetMouse() {
    if (!this.isDetached || !this.originalHelper) return;

    const mc = Client.getMinecraft();
    mc.field_71417_B = this.originalHelper;
    mc.field_71417_B.func_74372_a(); // grabMouseCursor

    this.originalHelper = null;
    this.isDetached = false;
  }
}

export default new MouseUtils();
