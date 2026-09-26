// Pure grid math — no Tailwind/runtime dependencies, so it can be imported by
// both the plugin (index.ts) and the standalone CLI (cli.ts).

export type Grid = {
	columns: number;
	mockupWidth: number;
	/** px (>= 1) or a ratio of the grid width per column (< 1) */
	gutter: number;
	margin: number;
	/** theme `screens` key the grid applies from */
	screen?: string;
	maxWidth?: number;
	fontScalingMaxWidth?: number;
};

/**
 * Span
 * @return matching amount of columns including gutters
 * @param col n | n-wide | n-wider
 * @param grid
 */
function span(col: number | string, grid: Grid): number;
function span(col?: number | string, grid?: null): string | 0;
function span(col: number | string = 1, grid: Grid | null = null): number | string {
	let count: number;
	let spreadingInstruction: string | undefined;

	if (typeof col === "string") {
		const [n, s] = col.split(" ");
		count = parseFloat(n);
		spreadingInstruction = s;
	} else {
		count = col;
	}

	if (count === 0) return 0;

	// A fractional span fills part of the next column, so it crosses the gutter
	// before it: 6.5 = 6 columns + 6 gutters + half a column.
	const crossed = Math.sign(count) * (Math.ceil(Math.abs(count)) - 1);

	if (grid) {
		const gridWidth = grid.mockupWidth - 2 * grid.margin;
		// gutter may be given as a px value (>= 1) or a ratio (< 1); resolve to px.
		const gutter =
			grid.gutter < 1 ? (gridWidth * grid.gutter) / grid.columns : grid.gutter;
		const column = (gridWidth - (grid.columns - 1) * gutter) / grid.columns;
		const spreading =
			spreadingInstruction === "wide"
				? gutter
				: spreadingInstruction === "wider"
					? gutter * 2
					: 0;
		return count * column + crossed * gutter + spreading;
	} else {
		const spreading =
			spreadingInstruction === "wide"
				? 1
				: spreadingInstruction === "wider"
					? 2
					: 0;
		const gutters = crossed + spreading * Math.sign(count);
		const sign = gutters < 0 ? "-" : "+";

		return `calc(${count} * var(--column) ${sign} ${Math.abs(gutters)} * var(--gutter))`;
	}
}

/**
 * Gutter
 * @return matching amount of gutters
 * @param count n
 * @param grid
 */
function gutter(count: number, grid: Grid): number;
function gutter(count?: number | string, grid?: null): string;
function gutter(count: number | string = 1, grid: Grid | null = null): number | string {
	return grid
		? +count * grid.gutter
		: +count === 1
			? "var(--gutter)"
			: `calc(${count} * var(--gutter))`;
}

/**
 * Margin
 * @return matching amount of margins
 * @param count n
 * @param grid
 */
function margin(count: number, grid: Grid): number;
function margin(count?: number | string, grid?: null): string;
function margin(count: number | string = 1, grid: Grid | null = null): number | string {
	return grid
		? +count * grid.margin
		: +count === 1
			? "var(--margin)"
			: `calc(${count} * var(--margin))`;
}

export type PixelsToColumnsResult = {
	className: string;
	columns: number;
	gutters?: number;
	actualWidth: number;
	pixelDifference: number;
	gridConfig: {
		columns: number;
		mockupWidth: number;
		gutter: number;
		margin: number;
		columnWidth: number;
		contentWidth: number;
	};
};

/**
 * Pixels → columns: the inverse of span(). Gutter and margin are in px.
 * Finds the closest grid span (or gutter multiple for sub-column values).
 */
const pixelsToColumns = (
	pixels: number,
	grid: Pick<Grid, "columns" | "mockupWidth" | "gutter" | "margin">,
): PixelsToColumnsResult => {
	const { columns, mockupWidth, margin: marginPx } = grid;
	const contentWidth = mockupWidth - 2 * marginPx;
	const columnWidth = span(1, grid);
	const gutterPx = span("1 wide", grid) - columnWidth;

	const gridConfig = {
		columns,
		mockupWidth,
		gutter: Math.round(gutterPx),
		margin: marginPx,
		columnWidth: Math.round(columnWidth),
		contentWidth: Math.round(contentWidth),
	};

	// Sub-column values: match against gutter multiples.
	if (pixels < columnWidth) {
		const multiples = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6];
		let best!: { mult: number; px: number };
		let bestDiff = Infinity;
		for (const mult of multiples) {
			const px = gutterPx * mult;
			const diff = Math.abs(px - pixels);
			if (diff < bestDiff) {
				bestDiff = diff;
				best = { mult, px };
			}
		}
		return {
			className: `gutter-gap-${best.mult}`,
			columns: 0,
			gutters: best.mult,
			actualWidth: Math.round(best.px),
			pixelDifference: Math.round(best.px - pixels),
			gridConfig,
		};
	}

	// Whole-column spans, with optional wide/wider spreading.
	const widthFor = (n: number, suffix: string) =>
		suffix === "-wide"
			? span(`${n} wide`, grid)
			: suffix === "-wider"
				? span(`${n} wider`, grid)
				: span(n, grid);

	let best!: { columns: number; suffix: string; width: number };
	let bestDiff = Infinity;
	for (let n = 1; n <= columns && bestDiff !== 0; n++) {
		for (const suffix of ["", "-wide", "-wider"]) {
			const width = widthFor(n, suffix);
			const diff = Math.abs(width - pixels);
			if (diff < bestDiff) {
				bestDiff = diff;
				best = { columns: n, suffix, width };
			}
			if (diff === 0) break;
		}
	}

	return {
		className: `span-w-${best.columns}${best.suffix}`,
		columns: best.columns,
		actualWidth: Math.round(best.width),
		pixelDifference: Math.round(best.width - pixels),
		gridConfig,
	};
};

export { span, gutter, margin, pixelsToColumns };
