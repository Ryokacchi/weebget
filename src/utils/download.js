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
	if (!url || typeof url !== "string") {
		throw new Error("Geçersiz URL");
	}

	let response;
	try {
		response = await axios({
			method: "get",
			url,
			responseType: "stream",
			timeout: 30000,
		});
	} catch (error) {
		if (error.code === "ENOTFOUND") {
			throw new Error("İnternet bağlantısı bulunamadı");
		} else if (error.code === "ECONNABORTED") {
			throw new Error("Bağlantı zaman aşımına uğradı");
		}
		throw new Error(`İndirme başlatılamadı: ${error.message}`);
	}

	if (response.status !== 200) {
		throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`);
	}

	/** @type {string} */
	const contentType = response.headers["content-type"] || "video/mp4";
	const extension = mime.extension(contentType) || "mp4";
	const totalLength = parseInt(response.headers["content-length"] || "0", 10);

	let downloaded = 0;
	let lastTime = Date.now();

	console.log(chalk.cyan("\n📥 İndirme başlıyor..."));

	if (totalLength) {
		const percent = ((downloaded / totalLength) * 100).toFixed(1);
		process.stdout.write(chalk.gray(`\rİndiriliyor: ${percent}% (${bytes(downloaded)} / ${bytes(totalLength)})`));
	} else {
		process.stdout.write(chalk.gray(`\rYükleniyor: ${bytes(downloaded)}`));
	}

	response.data.on("data", (/** @type {any[]} */ chunk) => {
		downloaded += chunk.length;

		const now = Date.now();
		if (now - lastTime >= 1000) {
			lastTime = now;

			if (totalLength) {
				const percentValue = (downloaded / totalLength) * 100;
				const percent = percentValue.toFixed(1);
				const progressBar = "█".repeat(Math.floor(percentValue / 2)) + "░".repeat(50 - Math.floor(percentValue / 2));
				process.stdout.write(chalk.gray(`\r[${progressBar}] ${percent}% (${bytes(downloaded)} / ${bytes(totalLength)})`));
			} else {
				process.stdout.write(chalk.gray(`\rYükleniyor: ${bytes(downloaded)}`));
			}
		}
	});

	const fullPath = `${outputPath}.${extension}`;

	try {
		const writer = fs.createWriteStream(fullPath);
		await pipeline(response.data, writer);

		process.stdout.write("\n");
		console.log(chalk.green(`✅ Dosya başarıyla kaydedildi: ${fullPath}`));
	} catch (error) {
		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
		}
		throw new Error(`Dosya yazma hatası: ${error.message}`);
	}
}