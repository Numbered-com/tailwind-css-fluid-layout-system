import fls from "../src/index.ts";

// Grids keyed to each non-string screen shape Tailwind accepts.
export default {
	theme: {
		screens: {
			range: { min: "40rem", max: "60rem" },
			print: { raw: "print" },
			either: [{ max: "30rem" }, { min: "80rem" }],
		},
		grid: {
			mobile: { columns: 4, mockupWidth: 375 },
			range: { columns: 6, mockupWidth: 800, screen: "range" },
			print: { columns: 8, mockupWidth: 1000, screen: "print" },
			either: { columns: 10, mockupWidth: 1200, screen: "either" },
		},
	},
	plugins: [fls],
};
