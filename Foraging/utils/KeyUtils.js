KeyBinding = Java.type("net.minecraft.client.settings.KeyBinding")

const mc = Client.getMinecraft();

class KeyUtils {
  constructor() {
    this.keys = {
      "w": mc.field_71474_y.field_74351_w,
      "a": mc.field_71474_y.field_74370_x,
      "s": mc.field_71474_y.field_74368_y,
      "d": mc.field_71474_y.field_74366_z,
    }
  }

  pressKey(key, isPressed) {
    if (this.keys[key]) {
      KeyBinding.func_74510_a(this.keys[key].func_151463_i(), isPressed);
    }
  }

  releaseKeys() {
    Object.keys(this.keys).forEach(key => this.pressKey(key, false));
  }
}

export default new KeyUtils();