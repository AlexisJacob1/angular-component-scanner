export async function heavyCompute(value: number): Promise<number> {
	// simulate expensive work
	await new Promise((r) => setTimeout(r, 300));
	return value * 2;
}

export async function reverseString(input: string): Promise<string> {
	return input.split("").reverse().join("");
}
