import type { Jaw, Surface, ToothState } from "./types";

export const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
export const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
export const ALL_TEETH = [...UPPER, ...LOWER];

export const jawFor = (n: number): Jaw => Math.floor(n / 10) < 3 ? "upper" : "lower";
export const quadrantFor = (n: number) => Math.floor(n / 10);
export const positionFor = (n: number) => n % 10;
export const surfacesFor = (n: number): Surface[] => positionFor(n) <= 3
  ? ["M", "D", "B", n < 30 ? "P" : "L", "I", "C"]
  : ["M", "D", "O", "B", n < 30 ? "P" : "L", "C"];

export const emptyTooth = (number: number): ToothState => ({
  number, missing: false, findings: [], surfaces: [], symptoms: [], treatments: []
});

export const emptyTeeth = () => Object.fromEntries(ALL_TEETH.map(n => [n, emptyTooth(n)])) as Record<number, ToothState>;

export const areAdjacent = (a: number, b: number) => quadrantFor(a) === quadrantFor(b) && Math.abs(positionFor(a) - positionFor(b)) === 1;
export const sameSide = (numbers: number[]) => numbers.every(n => [1,4].includes(quadrantFor(n))) || numbers.every(n => [2,3].includes(quadrantFor(n)));
