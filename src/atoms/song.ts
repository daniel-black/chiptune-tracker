import { atom } from "jotai";
import type { Song } from "../types";
import { createDefaultSong } from "../audio/utils";

// Canonical, row-major song atom
export const songAtom = atom<Song>(createDefaultSong());
