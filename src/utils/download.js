/* eslint-disable no-inline-comments */
// @ts-check
import axios from "axios";
import bytes from "bytes";
import chalk from "chalk";
import fs from "fs";
import mime from "mime-types";
import { pipeline } from "stream/promises";

/**
 *
 * @param {string} url
 * @param {string} outputPath
 */
export async function download(url, outputPath) {
	const response = await axios({
		method: "get",
		url,
		responseType: "stream",
	});
	if (response.status !== 200) {
		throw new Error("Download failed");
	}

	/** @type {string} */
	const contentType = response.headers["content-type"];
	const extension = mime.extension(contentType) || "mp4";
	const totalLength = parseInt(response.headers["content-length"] || "0", 10);

	let downloaded = 0;
	let lastTime = Date.now();

	if (totalLength) {
		const percent = ((downloaded / totalLength) * 100).toFixed(0);
		process.stdout.write(chalk.gray(`\rİndiriliyor: ${percent}% (${bytes(downloaded)} / ${bytes(totalLength)})`));
	} else {
		process.stdout.write(chalk.gray(`\rYükleniyor: ${bytes(downloaded)}`));
	}

	response.data.on("data", (/** @type {any[]} */ chunk) => {
		downloaded += chunk.length;

		const now = Date.now();
		if (now - lastTime >= 3000) {
			lastTime = now;

			if (totalLength) {
				const percent = ((downloaded / totalLength) * 100).toFixed(0);
				process.stdout.write(chalk.gray(`\rİndiriliyor: %${percent} — (${bytes(downloaded)} / ${bytes(totalLength)})`));
			} else {
				process.stdout.write(chalk.gray(`\rYükleniyor: ${bytes(downloaded)}`));
			}
		}
	});

	const writer = fs.createWriteStream(`${outputPath}.${extension}`);
	await pipeline(response.data, writer);
}