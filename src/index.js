// @ts-check
import { formatName, getLink } from "./functions/episodes.js";
import { timeFormat } from "./functions/time.js";
import { line } from "./functions/variables.js";
import { download } from "./utils/download.js";
import { spinner } from "./utils/spinner.js";
import axios from "axios";
import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";

/**
 * Fuzzy search function for anime names
 * @param {string} searchTerm 
 * @param {import("./jsdoc.js").Anime[]} animes 
 * @returns {import("./jsdoc.js").Anime[]}
 */
function searchAnimes(searchTerm, animes) {
	const lowerSearchTerm = searchTerm.toLowerCase().trim();
	
	const exactMatches = animes.filter(({ NAME, OTHER_NAMES }) => {
		const lowerName = NAME.toLowerCase();
		const lowerOthers = OTHER_NAMES.map(n => n.toLowerCase());
		return lowerName === lowerSearchTerm || lowerOthers.includes(lowerSearchTerm);
	});

	if (exactMatches.length > 0) {
		return exactMatches;
	}

	const partialMatches = animes.filter(({ NAME, OTHER_NAMES }) => {
		const lowerName = NAME.toLowerCase();
		const lowerOthers = OTHER_NAMES.map(n => n.toLowerCase());
		return lowerName.includes(lowerSearchTerm) || 
			   lowerOthers.some(name => name.includes(lowerSearchTerm));
	});

	if (partialMatches.length > 0) {
		return partialMatches;
	}

	const fuzzyMatches = animes.filter(({ NAME, OTHER_NAMES }) => {
		const allNames = [NAME, ...OTHER_NAMES].map(n => n.toLowerCase());
		return allNames.some(name => {
			const words = lowerSearchTerm.split(" ");
			return words.every(word => name.includes(word));
		});
	});

	return fuzzyMatches;
}

(async () => {
	try {
		spinner.start();

		/** @type {import("./jsdoc.js").Anime[]} */
		let animes;
		try {
			const response = await axios.get("https://animely.net/api/animes");
			animes = response.data;
		} catch (error) {
			spinner.fail(chalk.red("API'den anime listesi alınamadı. İnternet bağlantınızı kontrol edin."));
			console.error(chalk.gray(`Hata detayı: ${error.message}`));
			return;
		}
		
		spinner.stop();

		console.log([
			`${chalk.gray(timeFormat())} 🎉 ${chalk.bold("weebget")} is ready for request usage.`,
			`${chalk.gray(timeFormat())} 👉 Visit on Github: ${chalk.blue.underline("https://github.com/ryokacchi/weebget")}`,
		].join("\n"));
		console.log(chalk.gray(line.repeat(100)));

		const { name } = await inquirer.prompt([{
			type: "input",
			name: "name",
			message: "Hangi animeyi aramak istiyorsunuz? Yazınız:",
			validate: (input) => {
				if (!input || input.trim() === "") {
					return "Lütfen bir anime adı giriniz.";
				}
				return true;
			},
		}]);

		spinner.start();

		const foundAnimes = searchAnimes(name, animes);

		if (foundAnimes.length === 0) {
			spinner.fail(chalk.gray("Üzgünüz, aradığınız anime bulunamadı. Belki de henüz kataloğa eklenmedi."));
			return;
		}

		let selectedAnime;

		if (foundAnimes.length === 1) {
			selectedAnime = foundAnimes[0];
		} else {
			spinner.stop();
			
			console.log(chalk.yellow(`\n🔍 ${foundAnimes.length} adet anime bulundu:`));
			
			const { anime } = await inquirer.prompt([{
				type: "list",
				name: "anime",
				message: "Hangi animeyi seçmek istiyorsunuz?",
				choices: foundAnimes.map(anime => ({
					name: `${anime.NAME} ${chalk.gray(`(Sezon ${anime.SEASON_NUMBER}, ${anime.TOTAL_EPISODES} bölüm)`)}`,
					value: anime,
				})),
			}]);
			
			selectedAnime = anime;
			spinner.start();
		}

		/**
    * @typedef {{ episodes: import("./jsdoc.js").Episode[] }} Response
    * @type {import("axios").AxiosResponse<Response>}
    */
		let httpData;
		try {
			httpData = await axios.post("https://animely.net/api/searchAnime", { payload: selectedAnime.SLUG });
		} catch (error) {
			spinner.fail(chalk.red("Anime bölümleri alınamadı. Lütfen daha sonra tekrar deneyin."));
			console.error(chalk.gray(`Hata detayı: ${error.message}`));
			return;
		}

		const { episodes } = httpData.data;

		if (!episodes || episodes.length === 0) {
			spinner.fail(chalk.gray("Bu anime için henüz bölüm bulunamadı."));
			return;
		}

		spinner.stop();

		console.log(chalk.green(`\n✨ ${selectedAnime.NAME} seçildi!`));
		console.log(chalk.gray(`📺 Toplam ${episodes.length} bölüm mevcut`));

		/** @type {{ episode: { id: string; episode_number: number; link: string; } }} */
		const { episode } = await inquirer.prompt([{
			type: "list",
			name: "episode",
			message: "Lütfen indirmek istediğiniz bölümü seçin:",
			choices: episodes.map(({ id, episode_number, type, fansub, backblaze_link, watch_link_1, watch_link_2, watch_link_3 }) => {
				const links = [backblaze_link, watch_link_1, watch_link_2, watch_link_3];
				const hasValidLink = !links.every((link) => !link || link.trim() === "");
				
				if (typeof episode_number === "object") {
					console.warn(`⚠️  Episode ${id} has object episode_number:`, episode_number);
				}

				let fansubText = "";
				if (fansub) {
					if (typeof fansub === "string") {
						fansubText = fansub;
					} else if (typeof fansub === "object") {
						/** @type {any} */
						const fansubObj = fansub;
						fansubText = fansubObj.name || fansubObj.title || JSON.stringify(fansub);
					} else {
						fansubText = String(fansub);
					}
				}

				return {
					name: formatName(episode_number, type),
					description: fansubText,
					value: {
						id: id,
						episode_number: episode_number,
						link: getLink(links),
					},
					disabled: !hasValidLink,
				};
			}),
		}]);
		

		if (!episode.link) {
			console.log(chalk.red("Seçilen bölüm için indirme linki bulunamadı."));
			return;
		}

		const dirPath = path.join("videos", selectedAnime._id);
		const downloadPath = path.join(dirPath, `${episode.id}`);

		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}

		try {
			await download(episode.link, downloadPath);
			spinner.succeed(chalk.bold(`${selectedAnime.NAME} — ${episode.episode_number}. Bölüm başarıyla indirildi.`));
		} catch (error) {
			spinner.fail(chalk.red("İndirme sırasında bir hata oluştu."));
			console.error(chalk.gray(`Hata detayı: ${error.message}`));
		}
	} catch (error) {
		spinner.fail("Beklenmeyen bir hata oluştu, lütfen daha sonra tekrar deneyiniz.");
		console.error(chalk.gray(`Hata detayı: ${error.message}`));
	}
})();