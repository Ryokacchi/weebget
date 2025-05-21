// @ts-check
export function timeFormat(date = new Date()) {
	const formatter = new Intl.DateTimeFormat("tr-TR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	return formatter.format(date).replace(",", "");
}