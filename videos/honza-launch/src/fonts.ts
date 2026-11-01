import {loadFont as loadDoto} from "@remotion/google-fonts/Doto";
import {loadFont as loadInter} from "@remotion/google-fonts/Inter";

export const {fontFamily: dotoFamily} = loadDoto("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin", "latin-ext"],
});

export const {fontFamily: interFamily} = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
