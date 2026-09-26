import plugin from "tailwindcss/plugin";
import type { PluginAPI, PluginWithConfig } from "tailwindcss/plugin";
import { span, gutter, margin, pixelsToColumns, type Grid } from "./grid-math.ts";

type Screen = string | { min?: string; max?: string };
type GridFn = (count: number | string) => number | string;
type CssInJs = Parameters<PluginAPI["addBase"]>[0];
type Options = {
	fluidUnit?: (value: number) => string;
	guidelines?: boolean;
	color?: string;
	guidelinesSelector?: string;
};

/** Mirrors Tailwind's `PluginWithOptions<Options>`, which it doesn't export. */
type FluidLayoutPlugin = {
	(options?: Options): PluginWithConfig;
	__isOptionsFunction: true;
};

/**
 * Default fluid unit computation
 * @param {number} value - The fluid percentage value (e.g., 26.6667 for ~26.67vw)
 * @returns {string} - CSS value with unit
 */
const defaultFluidUnit = (value: number) => `${value.toPrecision(6)}vw`;

const utilities: Record<string, string | string[]> = {
	w: "width",
	"min-w": "min-width",
	"max-w": "max-width",
	h: "height",
	"min-h": "min-height",
	"max-h": "max-height",
	p: "padding",
	px: ["padding-left", "padding-right"],
	py: ["padding-top", "padding-bottom"],
	pt: "padding-top",
	pr: "padding-right",
	pb: "padding-bottom",
	pl: "padding-left",
	m: "margin",
	mx: ["margin-left", "margin-right"],
	my: ["margin-top", "margin-bottom"],
	mt: "margin-top",
	mr: "margin-right",
	mb: "margin-bottom",
	ml: "margin-left",
	"scroll-m": "scroll-margin",
	"scroll-mx": ["scroll-margin-left", "scroll-margin-right"],
	"scroll-my": ["scroll-margin-top", "scroll-margin-bottom"],
	"scroll-mt": "scroll-margin-top",
	"scroll-mr": "scroll-margin-right",
	"scroll-mb": "scroll-margin-bottom",
	"scroll-ml": "scroll-margin-left",
	"scroll-p": "scroll-padding",
	"scroll-px": ["scroll-padding-left", "scroll-padding-right"],
	"scroll-py": ["scroll-padding-top", "scroll-padding-bottom"],
	"scroll-pt": "scroll-padding-top",
	"scroll-pr": "scroll-padding-right",
	"scroll-pb": "scroll-padding-bottom",
	"scroll-pl": "scroll-padding-left",
	inset: ["top", "right", "bottom", "left"],
	"inset-x": ["right", "left"],
	"inset-y": ["top", "bottom"],
	top: "top",
	right: "right",
	bottom: "bottom",
	left: "left",
	gap: "gap",
	"gap-x": "column-gap",
	"gap-y": "row-gap",
	indent: "text-indent",
	border: "border-width",
	"border-t": "border-top-width",
	"border-r": "border-right-width",
	"border-b": "border-bottom-width",
	"border-l": "border-left-width",
	"border-x": ["border-left-width", "border-right-width"],
	"border-y": ["border-top-width", "border-bottom-width"],
};

// -----------------------------------------------------o spans & gutters

const gridContainer = () => {
	return {
		".grid-container": {
			display: "block",
			marginLeft: "auto",
			marginRight: "auto",
			width: "var(--grid-width)",
		},
		".grid-container-full": {
			marginLeft: "calc(var(--margin) * -1)",
			width: "calc(var(--grid-width) + 2 * var(--margin))",
		},
	};
};

const guideline = (grid: Grid, color = "red") => {
	let style = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="${color}" width="100%">`;

	for (let i = 0; i < grid.columns; i++) {
		const spanX = ((margin(1, grid) + span(i, grid)) * 100) / grid.mockupWidth;

		style += `<rect x="${spanX}%" width="0.5px" height="100%"/>`;

		if (i && grid.gutter) {
			const gutterX =
				((margin(1, grid) + span(`${i} wide`, grid)) * 100) / grid.mockupWidth;

			style += `<rect x="${gutterX}%" width="0.5px" height="100%"/>`;
		}
	}

	const last =
		((margin(1, grid) + span(grid.columns, grid)) * 100) / grid.mockupWidth;

	style += `<rect x="${last}%" width="0.5px" height="100%"/>`;
	style += `</svg>') no-repeat scroll`;

	return style;
};

const guidelines = (
	grids: Record<string, Grid>,
	screens: Record<string, Screen>,
	color = "red",
	selector = "body",
) => {
	const after: CssInJs = {
		content: "''",
		position: "fixed",
		"z-index": "99999",
		width: "calc(var(--grid-width) + 2 * var(--margin))",
		height: "100%",
		top: "0",
		left: "50%",
		transform: "translateX(-50%)",
		"pointer-events": "none",
		background: guideline(grids.mobile, color),
		visibility: 'var(--guidelines-visibility, "inherit")',
	};

	for (const grid of Object.values(grids)) {
		if (grid.screen) {
			after[parseScreen(screens[grid.screen])!] = {
				background: guideline(grid, color),
			};
		}
	}

	return { [selector]: { "&::after": after } };
};

// -----------------------------------------------------o Plugin

const parseScreen = (screen: Screen) => {
	if (typeof screen === "string") {
		return `@media (min-width: ${screen})`;
	} else if (typeof screen === "object") {
		return `@media (${screen.min !== undefined ? `min-width: ${screen.min}` : ""}${screen.min !== undefined && screen.max !== undefined ? ") and (" : ""}${
			screen.max !== undefined ? `max-width: ${screen.max}` : ""
		})`;
	}
};

// Tailwind negates a utility by wrapping the resolved value: `calc(<value> * -1)`.
// Our values are grid instructions (`3`, `3 wide`), not CSS, so unwrap the
// negation and fold the sign into the count before the math fns parse it.
const negated = /^calc\((.+) \* -1\)$/;

const resolveValue = (fn: GridFn, value: unknown) => {
	const match = `${value}`.match(negated);
	if (!match) return fn(value as number | string);

	const [count, spreading] = match[1].split(" ");
	return fn(spreading ? `-${count} ${spreading}` : -parseFloat(count));
};

const matchUtilitiesFor = (
	key: string,
	fn: GridFn,
	matchUtilities: PluginAPI["matchUtilities"],
	values: Record<string, string>,
) => {
	for (const utility in utilities) {
		const element = utilities[utility];

		matchUtilities(
			{
				[`${key}-${utility}`]: (value) => {
					const resolved = `${resolveValue(fn, value)}`;

					return Array.isArray(element)
						? Object.fromEntries(element.map((property) => [property, resolved]))
						: { [element]: resolved };
				},
			},
			{ values, supportsNegativeValues: true },
		);
	}
};

const grid: FluidLayoutPlugin = plugin.withOptions<Options>(
	(options) => {
		return (props) => {
			const { matchUtilities, addBase, addComponents, theme } = props;

			const grids = theme("grid") as Record<string, Grid>;
			const screens = theme("screens") as Record<string, Screen>;
			if (grids.mobile === undefined)
				throw new Error(`grid.mobile is the default and cannot be undefined`);

			const fluidUnit = options?.fluidUnit || defaultFluidUnit;

			/**
			 * Compute a fluid CSS value with scrollbar width compensation
			 * @param {number} fluidValue - The fluid percentage value
			 * @returns {string} - CSS calc expression
			 */
			const computeFluidValue = (fluidValue: number) => {
				return `calc(${fluidUnit(fluidValue)} - var(--sbw) * ${(fluidValue / 100).toPrecision(6)})`;
			};

			for (const key in grids) {
				const grid = grids[key];

				grid.gutter = grid.gutter || 0;
				grid.margin = grid.margin || 0;

				if (grid.columns === undefined)
					throw new Error(`columns is required for ${key}`);
				if (grid.mockupWidth === undefined)
					throw new Error(`mockupWidth is required for ${key}`);
				const mediaQuery = grid.screen ? parseScreen(screens[grid.screen]) : null;

				// base

				const vw = 100 / grid.mockupWidth;

				const margin = grid.margin;
				const fluidMargin = margin * vw;

				const gridWidth = grid.mockupWidth - 2 * margin;
				const fluidGridWidth = gridWidth * vw;

				const gutter =
					grid.gutter < 1
						? (gridWidth * grid.gutter) / grid.columns
						: grid.gutter;

				if (grid.gutter >= 1) grid.gutter = (grid.columns * gutter) / gridWidth;
				const fluidGutter = gutter * vw;

				const column = (gridWidth - (grid.columns - 1) * gutter) / grid.columns;
				const fluidColumn = column * vw;

				const fontSize = `calc(${(vw * 16).toPrecision(5)}vw - var(--sbw) * ${(16 / grid.mockupWidth).toPrecision(5)})`;
				const fontMaxWidth = grid.fontScalingMaxWidth || grid.maxWidth;
				const maxFontSize = fontMaxWidth
					? `min(${fontSize}, ${((16 * fontMaxWidth) / grid.mockupWidth).toPrecision(3)}px)`
					: null;

				const vars = {
					"--grid-width": computeFluidValue(fluidGridWidth),
					"--margin": computeFluidValue(fluidMargin),
					"--gutter": computeFluidValue(fluidGutter),
					"--column": computeFluidValue(fluidColumn),
					fontSize: maxFontSize || fontSize,
				};

				addBase({
					html: {
						"--sbw": "0px",
						// container-type: inline-size breaks sticky on chrome and old safari...
						// '@supports (container-type: inline-size)': { 'container-type': 'inline-size', '--sbw': 'calc(100vw - 100cqw)' },
						// force sbw to 15px for safari < 18
						// '@supports (hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none) and (not (view-transition-name: none))': {
						//   '--sbw': '15px'
						// },
						// mobile reset
						// '@media (pointer: coarse)': { 'container-type': 'revert', '--sbw': '0px' }
						"@media (pointer: fine)": { "--sbw": "17px" },
						// debug
						// '&::before': { content: 'counter(val) "px"', counterReset: 'val tan(atan2(var(--sbw), 1px))', position: 'fixed', color: 'red', 'z-index': 10000 }
					},
					// body: {
					//   overflow: 'overlay'
					// }
				});

				if (mediaQuery) {
					addBase({ html: { [mediaQuery]: vars } });
				} else {
					addBase({ html: vars });
				}

				if (grid.maxWidth) {
					const maxMargin = (margin * grid.maxWidth) / grid.mockupWidth;
					const maxGridWidth = grid.maxWidth - 2 * maxMargin;
					const maxGutter = (maxGridWidth * grid.gutter) / grid.columns;
					const maxColumn =
						(maxGridWidth - (grid.columns - 1) * maxGutter) / grid.columns;

					addBase({
						html: {
							[`@media (min-width: ${grid.maxWidth}px)`]: {
								"--grid-width": `${maxGridWidth.toFixed(5)}px`,
								"--margin": `${maxMargin.toFixed(5)}px`,
								"--gutter": `${maxGutter.toFixed(5)}px`,
								"--column": `${maxColumn.toFixed(5)}px`,
							},
						},
					});
				}
			}

			// grid container

			addComponents(gridContainer());

			// utilities

			const maxColumns = Math.max(...Object.values(grids).map((g) => g.columns));

			// Values stay grid instructions, not CSS: the utility callback runs them
			// through the math fns, so arbitrary values (`span-w-[0.665]`) take the
			// exact same path as named ones.
			const getValues = (withExpansion = false) => {
				const values: Record<string, string> = {};
				Array.from({ length: maxColumns }, (_, i) => {
					const j = i + 1;

					values[j] = `${j}`;

					if (withExpansion) {
						values[`${j}-wide`] = `${j} wide`;
						values[`${j}-wider`] = `${j} wider`;
					}
				});
				return values;
			};

			matchUtilitiesFor("span", span, matchUtilities, getValues(true));
			matchUtilitiesFor("gutter", gutter, matchUtilities, getValues());
			matchUtilitiesFor("margin", margin, matchUtilities, getValues());

			// guidelines

			if (
				options?.guidelines ||
				(options?.guidelines === undefined &&
					process.env.NODE_ENV === "development")
			) {
				addBase(
					guidelines(
						grids,
						screens,
						options?.color || "red",
						options?.guidelinesSelector || "body",
					),
				);
			}
		};
	},
	(options) => {
		return {
			theme: {
				grid: {
					mobile: { columns: 10, gutter: 10, margin: 20, mockupWidth: 375 },
					tablet: {
						columns: 10,
						gutter: 10,
						margin: 30,
						mockupWidth: 768,
						screen: "md",
					},
					desktop: {
						columns: 12,
						gutter: 10,
						margin: 60,
						mockupWidth: 1440,
						maxWidth: 1920,
						screen: "lg",
					},
				},
			},
		};
	},
);

export default grid;
export { defaultFluidUnit, span, gutter, margin, pixelsToColumns };
