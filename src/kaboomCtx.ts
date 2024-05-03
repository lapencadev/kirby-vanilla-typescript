import kaboom from "kaboom";
import { scale } from "./constants";

export const kaboomMethods = kaboom({
    width: 256 * scale,
    height: 144 * scale,
    scale,
    letterbox: true,
    global: false,
})
