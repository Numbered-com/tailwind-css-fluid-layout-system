#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { pixelsToColumns, rem, spacingClass } from "./grid-math.ts";

const SCRIPT_PATH = fileURLToPath(import.meta.url);

const DEFAULTS = { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24, spacing: 4 };

const HELP = `px-to-cols — convert a pixel value to a fluid grid span class

Usage:
  px-to-cols <pixels> [--columns N] [--mockup N] [--gutter N] [--margin N] [--spacing N] [--no-grid] [--json]

Options (all sizes in px):
  --columns N   Number of grid columns   (default: ${DEFAULTS.columns})
  --mockup  N   Mockup width in px       (default: ${DEFAULTS.mockupWidth})
  --gutter  N   Gutter size in px        (default: ${DEFAULTS.gutter})
  --margin  N   Outer margin in px       (default: ${DEFAULTS.margin})
  --spacing N   px per --spacing step    (default: ${DEFAULTS.spacing}; 1 for calc(1rem / 16))
                Off-grid values (beyond a quarter gutter) become spacing classes.
  --no-grid     Skip the grid: spacing class and rem only (vertical spacing, type sizes)
  --json        Output the full JSON result
  --batch       Read a JSON array of {pixels,columns,mockupWidth,gutter,margin,spacing,grid}
                from stdin; write a JSON array of results (one bunx call, many values)
  -h, --help    Show this help

Examples:
  px-to-cols 330 --columns 24 --mockup 1440 --gutter 24 --margin 24
  px-to-cols 150 --columns 6  --mockup 375  --gutter 12 --margin 12 --json
  px-to-cols 18 --spacing 1 --no-grid
  echo '[{"pixels":330,"columns":24,"mockupWidth":1440,"gutter":24,"margin":24,"spacing":4}]' | px-to-cols --batch`;

function parseArgs(argv: string[]) {
	const opts = { ...DEFAULTS, json: false, help: false, grid: true };
	let pixels: number | undefined;
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--json") opts.json = true;
		else if (a === "-h" || a === "--help") opts.help = true;
		else if (a === "--columns") opts.columns = Number(argv[++i]);
		else if (a === "--mockup") opts.mockupWidth = Number(argv[++i]);
		else if (a === "--gutter") opts.gutter = Number(argv[++i]);
		else if (a === "--margin") opts.margin = Number(argv[++i]);
		else if (a === "--spacing") opts.spacing = Number(argv[++i]);
		else if (a === "--no-grid") opts.grid = false;
		else if (pixels === undefined) pixels = Number(a);
	}
	return { pixels, opts };
}

function readStdin() {
	return new Promise<string>((resolve) => {
		let data = "";
		process.stdin.setEncoding("utf8");
		process.stdin.on("data", (chunk) => {
			data += chunk;
		});
		process.stdin.on("end", () => resolve(data));
	});
}

async function runBatch() {
	const input = (await readStdin()).trim();
	let items;
	try {
		items = JSON.parse(input || "[]");
	} catch {
		console.error("Error: --batch expects a JSON array on stdin");
		process.exit(1);
	}
	if (!Array.isArray(items)) {
		console.error("Error: --batch expects a JSON array on stdin");
		process.exit(1);
	}
	const invalid = items.findIndex((it) => !(Number(it?.pixels) > 0));
	if (invalid !== -1) {
		console.error(`Error: item ${invalid} needs a positive "pixels" value`);
		process.exit(1);
	}
	const results = items.map((it: Record<string, unknown>) => {
		const spacing = Number(it.spacing ?? DEFAULTS.spacing);
		const pixels = Number(it.pixels);
		if (it.grid === false) return { className: spacingClass(pixels, spacing), rem: rem(pixels) };
		return pixelsToColumns(
			pixels,
			{
				columns: Number(it.columns ?? DEFAULTS.columns),
				mockupWidth: Number(it.mockupWidth ?? DEFAULTS.mockupWidth),
				gutter: Number(it.gutter ?? DEFAULTS.gutter),
				margin: Number(it.margin ?? DEFAULTS.margin),
			},
			spacing,
		);
	});
	console.log(JSON.stringify(results));
}

function userArgs() {
	const argv = process.argv.slice(1); // drop the runtime executable
	// Drop leading script-path / bin-name tokens. Runtimes differ: node & bun
	// pass the script path; `bunx --package` fetch-and-run can prepend both the
	// script path AND the bin name. Loop so we strip whatever combination shows up.
	while (argv[0] && (argv[0] === SCRIPT_PATH || /(?:^|[\\/])(cli\.js|px-to-cols)$/.test(argv[0]))) {
		argv.shift();
	}
	return argv;
}

function main() {
	const args = userArgs();
	if (args.includes("--batch")) {
		runBatch();
		return;
	}

	const { pixels, opts } = parseArgs(args);

	if (opts.help || pixels === undefined || Number.isNaN(pixels)) {
		console.log(HELP);
		process.exit(opts.help ? 0 : 1);
	}
	if (pixels <= 0) {
		console.error("Error: pixels must be positive");
		process.exit(1);
	}

	if (!opts.grid) {
		console.log(`${spacingClass(pixels, opts.spacing)} (${rem(pixels)})`);
		return;
	}

	const result = pixelsToColumns(pixels, opts, opts.spacing);

	if (opts.json) {
		console.log(JSON.stringify(result, null, 2));
	} else if (!result.snapped) {
		console.log(`${result.className} (off-grid)`);
	} else {
		const d = result.pixelDifference;
		const diff = d > 0 ? `+${d}px` : d < 0 ? `${d}px` : "exact";
		console.log(`${result.className} (${result.actualWidth}px, ${diff})`);
	}
}

main();
