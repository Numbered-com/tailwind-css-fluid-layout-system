import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { gutter, pixelsToColumns } from "../src/grid-math.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Compile classes through Tailwind itself, so the utilities are exercised the
// same way an app does: named values, arbitrary values and negation all go
// through Tailwind's candidate parsing before reaching the plugin.
const css = async (
	classes: string[],
	pluginOptions = "",
	source = `@plugin "${root}/src/index.ts" ${pluginOptions};`,
) => {
	const compiler = await compile(
		`@import "tailwindcss";\n${source}`,
		{
			base: root,
			async loadStylesheet(id) {
				const path = resolve(root, "node_modules", id, "index.css");
				return {
					path,
					base: dirname(path),
					content: await readFile(path, "utf8"),
				};
			},
			async loadModule(id, base) {
				return { path: id, base, module: (await import(resolve(base, id))).default };
			},
		},
	);

	return compiler.build(classes);
};

// The declarations of a single utility, e.g. `.span-w-3 { width: … }` → `width: …`.
// Tailwind escapes selector specials (`.span-w-\[0\.665\]`), so drop the
// backslashes and match against the class as authored.
const declarations = async (className: string) => {
	const out = (await css([className])).replaceAll("\\", "");
	const escaped = className.replace(/[.*+?^${}()|[\]]/g, "\\$&");
	const rule = out.match(new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`));

	return rule?.[1].trim().replace(/\s+/g, " ");
};

// Every utility the plugin supports, and the CSS properties it must set. Spelled
// out here rather than imported from the plugin, so the test disagrees with the
// source when the mapping breaks.
const properties = {
	w: ["width"],
	"min-w": ["min-width"],
	"max-w": ["max-width"],
	h: ["height"],
	"min-h": ["min-height"],
	"max-h": ["max-height"],
	p: ["padding"],
	px: ["padding-left", "padding-right"],
	py: ["padding-top", "padding-bottom"],
	pt: ["padding-top"],
	pr: ["padding-right"],
	pb: ["padding-bottom"],
	pl: ["padding-left"],
	m: ["margin"],
	mx: ["margin-left", "margin-right"],
	my: ["margin-top", "margin-bottom"],
	mt: ["margin-top"],
	mr: ["margin-right"],
	mb: ["margin-bottom"],
	ml: ["margin-left"],
	"scroll-m": ["scroll-margin"],
	"scroll-mx": ["scroll-margin-left", "scroll-margin-right"],
	"scroll-my": ["scroll-margin-top", "scroll-margin-bottom"],
	"scroll-mt": ["scroll-margin-top"],
	"scroll-mr": ["scroll-margin-right"],
	"scroll-mb": ["scroll-margin-bottom"],
	"scroll-ml": ["scroll-margin-left"],
	"scroll-p": ["scroll-padding"],
	"scroll-px": ["scroll-padding-left", "scroll-padding-right"],
	"scroll-py": ["scroll-padding-top", "scroll-padding-bottom"],
	"scroll-pt": ["scroll-padding-top"],
	"scroll-pr": ["scroll-padding-right"],
	"scroll-pb": ["scroll-padding-bottom"],
	"scroll-pl": ["scroll-padding-left"],
	inset: ["top", "right", "bottom", "left"],
	"inset-x": ["right", "left"],
	"inset-y": ["top", "bottom"],
	top: ["top"],
	right: ["right"],
	bottom: ["bottom"],
	left: ["left"],
	gap: ["gap"],
	"gap-x": ["column-gap"],
	"gap-y": ["row-gap"],
	indent: ["text-indent"],
	border: ["border-width"],
	"border-t": ["border-top-width"],
	"border-r": ["border-right-width"],
	"border-b": ["border-bottom-width"],
	"border-l": ["border-left-width"],
	"border-x": ["border-left-width", "border-right-width"],
	"border-y": ["border-top-width", "border-bottom-width"],
};

const rule = (props: string[], value: string) =>
	props.map((property) => `${property}: ${value};`).join(" ");

// Each grid key, and the value a `-2` utility must produce for it.
const keys = {
	span: "calc(2 * var(--column) + 1 * var(--gutter))",
	gutter: "calc(2 * var(--gutter))",
	margin: "calc(2 * var(--margin))",
};

describe("every utility maps to its CSS properties", () => {
	for (const [key, value] of Object.entries(keys)) {
		for (const [utility, props] of Object.entries(properties)) {
			test(`${key}-${utility}`, async () => {
				expect(await declarations(`${key}-${utility}-2`)).toBe(
					rule(props, value),
				);
			});
		}
	}
});

describe("span values", () => {
	test("a single column spans no gutter", async () => {
		expect(await declarations("span-w-1")).toBe(
			"width: calc(1 * var(--column) + 0 * var(--gutter));",
		);
	});

	test("n columns span the n - 1 gutters between them", async () => {
		expect(await declarations("span-w-3")).toBe(
			"width: calc(3 * var(--column) + 2 * var(--gutter));",
		);
	});

	test("wide adds one gutter", async () => {
		expect(await declarations("span-w-3-wide")).toBe(
			"width: calc(3 * var(--column) + 3 * var(--gutter));",
		);
	});

	test("wider adds two gutters", async () => {
		expect(await declarations("span-w-3-wider")).toBe(
			"width: calc(3 * var(--column) + 4 * var(--gutter));",
		);
	});

	test("the last column of the widest grid is available", async () => {
		// The desktop grid has 12 columns; mobile and tablet only 10.
		expect(await declarations("span-w-12")).toBe(
			"width: calc(12 * var(--column) + 11 * var(--gutter));",
		);
	});

	test("an arbitrary value is a column multiplier, not a raw length", async () => {
		// Regression: v1.0.0 emitted `width: 0.665`, read by browsers as a length.
		expect(await declarations("span-w-[0.665]")).toBe(
			"width: calc(0.665 * var(--column) + 0 * var(--gutter));",
		);
	});

	test("a fractional span includes the gutter before its partial column", async () => {
		expect(await declarations("span-w-[6.5]")).toBe(
			"width: calc(6.5 * var(--column) + 6 * var(--gutter));",
		);
	});

	test("an arbitrary value carries a spreading instruction", async () => {
		expect(await declarations("span-w-[2_wide]")).toBe(
			"width: calc(2 * var(--column) + 2 * var(--gutter));",
		);
	});

	test("a bare fractional span works like its arbitrary form", async () => {
		expect(await declarations("span-w-6.5")).toBe(
			"width: calc(6.5 * var(--column) + 6 * var(--gutter));",
		);
		expect(await declarations("span-w-6.5-wide")).toBe(
			"width: calc(6.5 * var(--column) + 7 * var(--gutter));",
		);
	});

	test("a bare fractional gutter and its negation", async () => {
		expect(await declarations("gutter-gap-0.5")).toBe("gap: calc(0.5 * var(--gutter));");
		expect(await declarations("-gutter-mt-0.5")).toBe(
			"margin-top: calc(-0.5 * var(--gutter));",
		);
	});

	test("an arbitrary value beyond the grid is not clamped", async () => {
		expect(await declarations("span-w-[16]")).toBe(
			"width: calc(16 * var(--column) + 15 * var(--gutter));",
		);
	});
});

describe("gutter and margin values", () => {
	test("a single gutter is the variable itself", async () => {
		expect(await declarations("gutter-gap-1")).toBe("gap: var(--gutter);");
	});

	test("a single margin is the variable itself", async () => {
		expect(await declarations("margin-pl-1")).toBe(
			"padding-left: var(--margin);",
		);
	});

	test("gutters multiply", async () => {
		expect(await declarations("gutter-gap-3")).toBe(
			"gap: calc(3 * var(--gutter));",
		);
	});

	test("an arbitrary gutter is a gutter multiplier", async () => {
		expect(await declarations("gutter-gap-[0.5]")).toBe(
			"gap: calc(0.5 * var(--gutter));",
		);
	});

	test("an arbitrary margin is a margin multiplier", async () => {
		expect(await declarations("margin-ml-[1.5]")).toBe(
			"margin-left: calc(1.5 * var(--margin));",
		);
	});
});

describe("negated values mirror their positive counterpart", () => {
	test("a negative span negates columns and gutters", async () => {
		expect(await declarations("-span-ml-3")).toBe(
			"margin-left: calc(-3 * var(--column) - 2 * var(--gutter));",
		);
	});

	test("a negative span keeps its spreading instruction", async () => {
		expect(await declarations("-span-ml-3-wide")).toBe(
			"margin-left: calc(-3 * var(--column) - 3 * var(--gutter));",
		);
	});

	test("a negative fractional span negates its crossed gutters", async () => {
		expect(await declarations("-span-ml-[6.5]")).toBe(
			"margin-left: calc(-6.5 * var(--column) - 6 * var(--gutter));",
		);
	});

	test("a negative gutter negates the multiplier", async () => {
		expect(await declarations("-gutter-mt-2")).toBe(
			"margin-top: calc(-2 * var(--gutter));",
		);
	});

	test("a negative margin negates the multiplier", async () => {
		expect(await declarations("-margin-mt-1")).toBe(
			"margin-top: calc(-1 * var(--margin));",
		);
	});
});

describe("unsupported values produce no CSS", () => {
	test("a span past the widest grid has no named utility", async () => {
		expect(await declarations("span-w-13")).toBeUndefined();
	});

	test("a bare span past the widest grid has no utility either", async () => {
		expect(await declarations("span-w-12.5")).toBeUndefined();
	});

	test("a bare value with a misplaced or unknown spreading is rejected", async () => {
		expect(await declarations("gutter-gap-2-wide")).toBeUndefined();
		expect(await declarations("span-w-2.5-widest")).toBeUndefined();
	});

	test("an unknown spreading instruction is rejected", async () => {
		expect(await declarations("span-w-3-widest")).toBeUndefined();
	});

	test("an arbitrary value that isn't a count is rejected", async () => {
		for (const className of ["span-w-[foo]", "gutter-w-[abc]", "margin-w-[1px]"])
			expect(await declarations(className)).toBeUndefined();
	});

	test("an unknown or misplaced spreading instruction is rejected", async () => {
		expect(await declarations("span-w-[3_widest]")).toBeUndefined();
		expect(await declarations("gutter-w-[2_wide]")).toBeUndefined();
	});
});

describe("base variables", () => {
	test("the maxWidth cap meets the fluid value, so the grid doesn't jump", async () => {
		// Default desktop grid: 1440px mockup, 60px margins, capped at 1920px.
		const out = await css([]);
		const [, coefficient, cap] = out.match(
			/--grid-width: min\(calc\(([\d.]+)vw - var\(--sbw\) \* [\d.]+\), ([\d.]+)px\)/,
		)!;

		expect(Math.abs((+coefficient / 100) * 1920 - +cap)).toBeLessThan(0.01);
	});

	test("the scrollbar width is declared once", async () => {
		expect((await css([])).split("--sbw: 0px").length - 1).toBe(1);
	});

	test("a hex guideline colour is encoded into the data URL", async () => {
		const out = await css([], '{ guidelines: true; color: "#ff0000"; }');

		expect(out).toContain('fill="%23ff0000"');
	});

	test("every Tailwind screen shape becomes the grid's media query", async () => {
		const out = await css([], "", '@config "./test/screens.config.ts";');

		expect(out).toContain("@media (min-width: 40rem) and (max-width: 60rem)");
		expect(out).toContain("@media print");
		expect(out).toContain("@media (max-width: 30rem), (min-width: 80rem)");
		expect(out).not.toContain("@media ()");
	});
});

describe("variants", () => {
	test("a breakpoint composes with an arbitrary span", async () => {
		const out = await css(["lg:span-w-[0.665]"]);

		expect(out).toContain(
			"calc(0.665 * var(--column) + 0 * var(--gutter))",
		);
		expect(out).not.toContain("width: 0.665;");
	});
});

describe("grid math", () => {
	test("gutter() resolves a ratio gutter to px", () => {
		// 1000px grid, 10 columns, gutter ratio 0.1 → 10px per gutter.
		expect(gutter(2, { columns: 10, mockupWidth: 1000, gutter: 0.1 })).toBe(20);
	});
});

describe("pixelsToColumns", () => {
	// 24 cols on 1440 with 24px gutter/margin: column 35, gutter 24.
	const grid = { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 };
	const className = (px: number) => pixelsToColumns(px, grid).className;

	test("sub-gutter values map to gutter gaps", () => {
		expect(className(12)).toBe("gutter-gap-0.5");
		expect(className(24)).toBe("gutter-gap-1");
	});

	test("values between a gutter and a column pick whichever is closer", () => {
		expect(className(30)).toBe("span-w-1");
	});

	test("values wider than a gutter align to columns, not gutter multiples", () => {
		expect(className(48)).toBe("span-w-1-wide");
		expect(className(96)).toBe("span-w-2");
	});
});
