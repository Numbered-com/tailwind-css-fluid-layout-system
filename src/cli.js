#!/usr/bin/env node
"use strict";

const { pixelsToColumns } = require("./grid-math.js");

const HELP = `px-to-cols — convert a pixel value to a fluid grid span class

Usage:
  px-to-cols <pixels> [--columns N] [--mockup N] [--gutter N] [--margin N] [--json]

Options (all sizes in px):
  --columns N   Number of grid columns   (default: 24)
  --mockup  N   Mockup width in px       (default: 1440)
  --gutter  N   Gutter size in px        (default: 24)
  --margin  N   Outer margin in px       (default: 24)
  --json        Output the full JSON result
  --batch       Read a JSON array of {pixels,columns,mockupWidth,gutter,margin}
                from stdin; write a JSON array of results (one bunx call, many values)
  -h, --help    Show this help

Examples:
  px-to-cols 330 --columns 24 --mockup 1440 --gutter 24 --margin 24
  px-to-cols 150 --columns 6  --mockup 375  --gutter 12 --margin 12 --json
  echo '[{"pixels":330,"columns":24,"mockupWidth":1440,"gutter":24,"margin":24}]' | px-to-cols --batch`;

function parseArgs(argv) {
	const opts = { columns: 24, mockup: 1440, gutter: 24, margin: 24, json: false };
	let pixels;
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--json") opts.json = true;
		else if (a === "-h" || a === "--help") opts.help = true;
		else if (a === "--columns") opts.columns = Number(argv[++i]);
		else if (a === "--mockup") opts.mockup = Number(argv[++i]);
		else if (a === "--gutter") opts.gutter = Number(argv[++i]);
		else if (a === "--margin") opts.margin = Number(argv[++i]);
		else if (pixels === undefined) pixels = Number(a);
	}
	return { pixels, opts };
}

function readStdin() {
	return new Promise((resolve) => {
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
	const results = items.map((it) =>
		pixelsToColumns(Number(it.pixels), {
			columns: Number(it.columns ?? 24),
			mockupWidth: Number(it.mockupWidth ?? 1440),
			gutter: Number(it.gutter ?? 24),
			margin: Number(it.margin ?? 24),
		}),
	);
	console.log(JSON.stringify(results));
}

function userArgs() {
	const argv = process.argv.slice(1); // drop the runtime executable
	// Drop the script/bin path when present (node & bun include it; bunx may not).
	if (argv[0] && (argv[0] === __filename || /(?:^|[\\/])(cli\.js|px-to-cols)$/.test(argv[0]))) {
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

	const result = pixelsToColumns(pixels, {
		columns: opts.columns,
		mockupWidth: opts.mockup,
		gutter: opts.gutter,
		margin: opts.margin,
	});

	if (opts.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		const d = result.pixelDifference;
		const diff = d > 0 ? `+${d}px` : d < 0 ? `${d}px` : "exact";
		console.log(`${result.className} (${result.actualWidth}px, ${diff})`);
	}
}

main();
