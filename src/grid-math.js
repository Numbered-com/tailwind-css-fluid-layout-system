"use strict";

// Pure grid math — no Tailwind/runtime dependencies, so it can be required by
// both the plugin (index.js) and the standalone CLI (cli.js).

/**
 * Span
 * @return matching amount of columns including gutters
 * @param col n | n-wide | n-wider
 * @param grid
 */
const span = (col = 1, grid = null) => {
	let count;
	let spreadingInstruction;

	if (typeof col === "string") {
		[count, spreadingInstruction] = col.split(" ");
		count = parseFloat(count);
	} else {
		count = col;
	}

	if (count === 0) return 0;

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
		return count * column + (count - 1) * gutter + spreading;
	} else {
		const spreading =
			spreadingInstruction === "wide"
				? 1
				: spreadingInstruction === "wider"
					? 2
					: 0;
		return `calc(${count} * var(--column) + ${count - (1 - spreading) * Math.sign(count)} * var(--gutter))`;
	}
};

/**
 * Gutter
 * @return matching amount of gutters
 * @param count n
 * @param grid
 */
const gutter = (count = 1, grid = null) => {
	return grid
		? count * grid.gutter
		: count === 1
			? "var(--gutter)"
			: `calc(${count} * var(--gutter))`;
};

/**
 * Margin
 * @return matching amount of margins
 * @param count n
 * @param grid
 */
const margin = (count = 1, grid = null) => {
	return grid
		? count * grid.margin
		: count === 1
			? "var(--margin)"
			: `calc(${count} * var(--margin))`;
};

/**
 * Pixels → columns: the inverse of span(). Gutter and margin are in px.
 * Finds the closest grid span (or gutter multiple for sub-column values).
 * @param {number} pixels - The pixel value to convert
 * @param {{columns:number, mockupWidth:number, gutter:number, margin:number}} grid
 * @return {{className:string, columns:number, gutters?:number, actualWidth:number, pixelDifference:number, gridConfig:object}}
 */
const pixelsToColumns = (pixels, grid) => {
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
		let best = null;
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
	const widthFor = (n, suffix) =>
		suffix === "-wide"
			? span(`${n} wide`, grid)
			: suffix === "-wider"
				? span(`${n} wider`, grid)
				: span(n, grid);

	let best = null;
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

module.exports = { span, gutter, margin, pixelsToColumns };
