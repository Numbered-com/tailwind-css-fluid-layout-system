// Pure grid math — no Tailwind/runtime dependencies, so it can be imported by
// both the plugin (index.ts) and the standalone CLI (cli.ts).

export type Grid = {
	columns: number;
	mockupWidth: number;
	/** px (>= 1) or a ratio of the grid width per column (< 1) */
	gutter?: number;
	margin?: number;
	/** theme `screens` key the grid applies from */
	screen?: string;
	maxWidth?: number;
	fontScalingMaxWidth?: number;
};

/** Pixel metrics of a grid at its mockup width. */
export type GridMetrics = { gridWidth: number; gutter: number; column: number };

const metrics = ({ columns, mockupWidth, gutter = 0, margin = 0 }: Grid): GridMetrics => {
	const gridWidth = mockupWidth - 2 * margin;
	// gutter may be given as a px value (>= 1) or a ratio (< 1); resolve to px.
	const gutterPx = gutter < 1 ? (gridWidth * gutter) / columns : gutter;
	return { gridWidth, gutter: gutterPx, column: (gridWidth - (columns - 1) * gutterPx) / columns };
};

/** Extra gutters each spreading instruction adds to a span. */
const spreadings = { wide: 1, wider: 2 } as const;
type Spreading = keyof typeof spreadings;

const instruction = new RegExp(`^(-?\\d*\\.?\\d+)(?: (${Object.keys(spreadings).join("|")}))?$`);

/** Parses a grid instruction (`3`, `-1.5`, `2 wide`); throws on anything else. */
const parse = (value: number | string) => {
	const match = `${value}`.match(instruction);
	if (!match) throw new Error(`Invalid grid instruction "${value}"`);
	return { count: +match[1], spreading: match[2] as Spreading | undefined };
};

/**
 * Span
 * @return matching amount of columns including gutters
 * @param col n | "n wide" | "n wider"
 * @param grid
 */
function span(col: number | string, grid: Grid): number;
function span(col?: number | string, grid?: null): string | 0;
function span(col: number | string = 1, grid: Grid | null = null): number | string {
	const { count, spreading } = parse(col);
	if (count === 0) return 0;

	// A fractional span fills part of the next column, so it crosses the gutter
	// before it: 6.5 = 6 columns + 6 gutters + half a column.
	const gutters =
		Math.sign(count) * (Math.ceil(Math.abs(count)) - 1 + (spreading ? spreadings[spreading] : 0));

	if (grid) {
		const { gutter, column } = metrics(grid);
		return count * column + gutters * gutter;
	}

	const sign = gutters < 0 ? "-" : "+";
	return `calc(${count} * var(--column) ${sign} ${Math.abs(gutters)} * var(--gutter))`;
}

/** A multiple of one grid variable: px with a grid, CSS without. */
const multiple = (name: "gutter" | "margin", px: (grid: Grid) => number) => {
	function fn(count: number | string, grid: Grid): number;
	function fn(count?: number | string, grid?: null): string;
	function fn(count: number | string = 1, grid: Grid | null = null): number | string {
		const { count: n, spreading } = parse(count);
		if (spreading) throw new Error(`A ${name} doesn't take "${spreading}"`);
		if (grid) return n * px(grid);
		return n === 1 ? `var(--${name})` : `calc(${n} * var(--${name}))`;
	}
	return fn;
};

const gutter = multiple("gutter", (grid) => metrics(grid).gutter);
const margin = multiple("margin", (grid) => grid.margin ?? 0);

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
 * Finds the closest span, or gutter gap (≤ 1 gutter) for small spacing.
 */
const pixelsToColumns = (
	pixels: number,
	grid: Grid,
): PixelsToColumnsResult => {
	const { columns, mockupWidth, margin: marginPx = 0 } = grid;
	const { gridWidth: contentWidth, gutter: gutterPx, column: columnWidth } = metrics(grid);

	const gridConfig = {
		columns,
		mockupWidth,
		gutter: Math.round(gutterPx),
		margin: marginPx,
		columnWidth: Math.round(columnWidth),
		contentWidth: Math.round(contentWidth),
	};

	// One pool: sub-gutter spacing (≤ 1 gutter) plus every span; the closest
	// wins, first on ties. Wider values are meant to align with columns.
	const best = [
		...[0.5, 1].map((gutters) => ({ className: `gutter-gap-${gutters}`, columns: 0, gutters, width: gutters * gutterPx })),
		...Array.from({ length: columns }, (_, i) => i + 1).flatMap((n) =>
			["", ...Object.keys(spreadings)].map((s) => ({
				className: `span-w-${n}${s && `-${s}`}`,
				columns: n,
				gutters: undefined,
				width: span(`${n} ${s}`.trim(), grid),
			})),
		),
	].reduce((best, c) => (Math.abs(c.width - pixels) < Math.abs(best.width - pixels) ? c : best));

	return {
		className: best.className,
		columns: best.columns,
		...(best.gutters !== undefined && { gutters: best.gutters }),
		actualWidth: Math.round(best.width),
		pixelDifference: Math.round(best.width - pixels),
		gridConfig,
	};
};

export { metrics, spreadings, span, gutter, margin, pixelsToColumns };
