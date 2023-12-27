export type NodeData = {
	css: string;
	rangeStart: number;
	rangeEnd: number;
	interpolationRanges: Array<{
		start: number;
		end: number;
	}>;
	locationStart: {
		line: number;
		column: number;
	};
};
