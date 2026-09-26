import plugin from "tailwindcss/plugin";
import type { PluginAPI, PluginWithConfig } from "tailwindcss/plugin";
import { metrics, spreadings, span, gutter, margin, pixelsToColumns, type Grid } from "./grid-math.ts";

/** Tailwind's screen shapes: a min-width, a range, a raw query, or a list of them. */
type ScreenRange = string | { min?: string; max?: string; raw?: string };
type Screen = ScreenRange | ScreenRange[];
type GridFn = (count: string) => number | string;
type CssInJs = Parameters<PluginAPI["addBase"]>[0];
type Options = {
	fluidUnit?: (value: number) => string;
	guidelines?: boolean;
	color?: string;
	guidelinesSelector?: string;
	/** `--sbw` on fine pointers; set `0px` where scrollbars overlay (macOS). */
	scrollbarWidth?: string;
};

/** Mirrors Tailwind's `PluginWithOptions<Options>`, which it doesn't export. */
type FluidLayoutPlugin = {
	(options?: Options): PluginWithConfig;
	__isOptionsFunction: true;
};

/** Fluid percentage (e.g. 26.6667) → CSS length. */
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

const gridContainer = {
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

const guideline = (grid: Grid, color: string) => {
	const { gutter, column } = metrics(grid);
	const starts = Array.from({ length: grid.columns }, (_, i) => (grid.margin ?? 0) + i * (column + gutter));
	// Each column's start and end; without gutters an end is the next start, so dedupe.
	const xs = new Set(
		starts.flatMap((x) => [x, x + column]).map((x) => ((x * 100) / grid.mockupWidth).toPrecision(6)),
	);
	const rects = [...xs].map((x) => `<rect x="${x}%" width="0.5px" height="100%"/>`).join("");

	return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="${encodeURIComponent(color)}" width="100%">${rects}</svg>') no-repeat scroll`;
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
		visibility: "var(--guidelines-visibility, inherit)",
	};

	for (const grid of Object.values(grids)) {
		if (grid.screen) {
			after[parseScreen(screens[grid.screen])] = {
				background: guideline(grid, color),
			};
		}
	}

	return { [selector]: { "&::after": after } };
};

// -----------------------------------------------------o Plugin

const parseScreen = (screen: Screen) =>
	`@media ${[screen]
		.flat()
		.map((s) =>
			typeof s === "string"
				? `(min-width: ${s})`
				: (s.raw ??
					[s.min && `(min-width: ${s.min})`, s.max && `(max-width: ${s.max})`]
						.filter(Boolean)
						.join(" and ")),
		)
		.join(", ")}`;

// Tailwind negates a utility by wrapping the resolved value: `calc(<value> * -1)`.
// Our values are grid instructions (`3`, `3 wide`), not CSS, so unwrap the
// negation and fold the sign into the instruction for the math fns to parse.
const negated = /^calc\((.+) \* -1\)$/;

// The math fns reject anything that isn't a valid instruction; that yields no utility.
const resolveValue = (fn: GridFn, value: string) => {
	const negation = value.match(negated);
	try {
		return `${fn(negation ? `-${negation[1]}` : value)}`;
	} catch {
		return null;
	}
};

const matchUtilitiesFor = (
	key: string,
	fn: GridFn,
	matchUtilities: PluginAPI["matchUtilities"],
	values: Record<string, string>,
) =>
	matchUtilities(
		Object.fromEntries(
			Object.entries(utilities).map(([utility, properties]) => [
				`${key}-${utility}`,
				(value: string) => {
					const css = resolveValue(fn, value);
					return css === null ? [] : Object.fromEntries([properties].flat().map((p) => [p, css]));
				},
			]),
		),
		{ values, supportsNegativeValues: true },
	);

const grid: FluidLayoutPlugin = plugin.withOptions<Options>(
	(options) => {
		return (props) => {
			const { matchUtilities, addBase, addComponents, theme } = props;

			const grids = theme("grid") as Record<string, Grid>;
			const screens = theme("screens") as Record<string, Screen>;
			if (grids.mobile === undefined)
				throw new Error(`grid.mobile is the default and cannot be undefined`);

			const fluidUnit = options?.fluidUnit || defaultFluidUnit;

			addBase({
				html: {
					"--sbw": "0px",
					"@media (pointer: fine)": { "--sbw": options?.scrollbarWidth ?? "17px" },
				},
			});

			for (const key in grids) {
				const grid = grids[key];

				if (grid.screen && screens[grid.screen] === undefined)
					throw new Error(`Unknown screen "${grid.screen}" for ${key}`);
				if (grid.columns === undefined)
					throw new Error(`columns is required for ${key}`);
				if (grid.mockupWidth === undefined)
					throw new Error(`mockupWidth is required for ${key}`);
				const mediaQuery = grid.screen ? parseScreen(screens[grid.screen]) : null;

				const vw = 100 / grid.mockupWidth;
				const { gridWidth, gutter, column } = metrics(grid);

				// Fluid value minus its share of the scrollbar. Past maxWidth the grid
				// stops scaling: capping with min() rather than a media query keeps it
				// continuous, as the fluid side already subtracts the scrollbar.
				const fluid = (px: number, maxWidth = grid.maxWidth) => {
					const value = `calc(${fluidUnit(px * vw)} - var(--sbw) * ${((px * vw) / 100).toPrecision(6)})`;
					return maxWidth
						? `min(${value}, ${+((px * maxWidth) / grid.mockupWidth).toFixed(5)}px)`
						: value;
				};

				const vars = {
					"--grid-width": fluid(gridWidth),
					"--margin": fluid(grid.margin ?? 0),
					"--gutter": fluid(gutter),
					"--column": fluid(column),
					fontSize: fluid(16, grid.fontScalingMaxWidth || grid.maxWidth),
				};

				addBase({ html: mediaQuery ? { [mediaQuery]: vars } : vars });
			}

			// grid container

			addComponents(gridContainer);

			// utilities

			const maxColumns = Math.max(...Object.values(grids).map((g) => g.columns));

			// Values stay grid instructions, not CSS: the utility callback runs them
			// through the math fns, so arbitrary values (`span-w-[0.665]`) take the
			// exact same path as named ones.
			const counts = Array.from({ length: maxColumns }, (_, i) => `${i + 1}`);
			const values = Object.fromEntries(counts.map((n) => [n, n]));
			const spanValues = {
				...values,
				...Object.fromEntries(
					counts.flatMap((n) => Object.keys(spreadings).map((s) => [`${n}-${s}`, `${n} ${s}`])),
				),
			};

			matchUtilitiesFor("span", span, matchUtilities, spanValues);
			matchUtilitiesFor("gutter", gutter, matchUtilities, values);
			matchUtilitiesFor("margin", margin, matchUtilities, values);

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
						options?.color,
						options?.guidelinesSelector,
					),
				);
			}
		};
	},
	() => {
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
