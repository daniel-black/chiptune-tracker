import { rows } from "@/audio/constants";
import { CHANNEL_CONFIG, CHANNEL_COUNT } from "@/audio/channel-config";

const MAX_COL = CHANNEL_COUNT - 1;

/**
 * Returns the highest field index for a given column.
 */
export function getMaxField(col: number): number {
  return CHANNEL_CONFIG[col].fieldCount - 1;
}

/** Read the grid position from the currently focused input's data attributes. */
function getCurrentPosition(): {
  row: number;
  col: number;
  field: number;
} | null {
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLInputElement)) return null;

  const row = el.dataset.row;
  const col = el.dataset.col;
  const field = el.dataset.field;
  if (row == null || col == null || field == null) return null;

  return { row: Number(row), col: Number(col), field: Number(field) };
}

/** Focus the input at the given grid position. */
export function focusInput(row: number, col: number, field: number): void {
  const input = document.querySelector<HTMLInputElement>(
    `input[data-row="${row}"][data-col="${col}"][data-field="${field}"]`,
  );
  input?.focus();
}

export function moveUp(): void {
  const pos = getCurrentPosition();
  if (!pos || pos.row <= 0) return;
  focusInput(pos.row - 1, pos.col, pos.field);
}

export function moveDown(): void {
  const pos = getCurrentPosition();
  if (!pos || pos.row >= rows - 1) return;
  focusInput(pos.row + 1, pos.col, pos.field);
}

export function moveLeft(): void {
  const pos = getCurrentPosition();
  if (!pos) return;

  if (pos.field > 0) {
    focusInput(pos.row, pos.col, pos.field - 1);
  } else if (pos.col > 0) {
    const prevCol = pos.col - 1;
    focusInput(pos.row, prevCol, getMaxField(prevCol));
  }
}

export function moveRight(): void {
  const pos = getCurrentPosition();
  if (!pos) return;

  const maxField = getMaxField(pos.col);
  if (pos.field < maxField) {
    focusInput(pos.row, pos.col, pos.field + 1);
  } else if (pos.col < MAX_COL) {
    focusInput(pos.row, pos.col + 1, 0);
  }
}

/**
 * Auto-advance: move focus down after a value entry is complete.
 * Separated from moveDown() so edit-step size can be made configurable later.
 * Uses requestAnimationFrame so the state update settles before moving focus,
 * preventing the blur handler from clobbering the just-entered value.
 */
export function advanceDown(): void {
  requestAnimationFrame(() => {
    moveDown();
  });
}

/**
 * Jump to field 0 of the given column on the current row.
 * Falls back to row 0 if no input is currently focused.
 */
export function focusColumn(col: number): void {
  const pos = getCurrentPosition();
  const row = pos?.row ?? 0;
  focusInput(row, col, 0);
}
