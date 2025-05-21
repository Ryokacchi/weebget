// @ts-check
import { formatName, getLink } from "@/functions/episodes.js";
import { timeFormat } from "@/functions/time.js";
import { line } from "@/functions/variables.js";
import { download } from "@/utils/download.js";
import { spinner } from "@/utils/spinner.js";
import axios from "axios";
import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";

(async () => {
	try {
		spinner.start();

		/** @type {import("./jsdoc.js").Anime[]} */
		const animes = await (await fetch("https://animely.net/api/animes")).json();
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
			required: true,
		}]);

		spinner.start();

		const inputName = name.toLowerCase();
		const anime = animes.find(({ NAME, OTHER_NAMES }) => {
			const lowerName = NAME.toLowerCase();
			const lowerOthers = OTHER_NAMES.map(n => n.toLowerCase());
			return lowerName === inputName || lowerOthers.includes(inputName);
		});

		if (!anime) {
			spinner.fail(chalk.gray("Üzgünüz, aradığınız anime bulunamadı. Belki de henüz kataloğa eklenmedi."));
			return;
		}

		/**
    * @typedef {{ episodes: import("./jsdoc.js").Episode[] }} Response
    * @type {import("axios").AxiosResponse<Response>}
    */
		const httpData = await axios.post("https://animely.net/api/searchAnime", { payload: anime.SLUG });
		const { episodes } = httpData.data;

		spinner.stop();

		/** @type {{ episode: { id: string; episode_number: number; link: string; } }} */
		const { episode } = await inquirer.prompt([{
			type: "list",
			name: "episode",
			message: "Lütfen indirmek istediğiniz bölümü seçin:",
			choices: episodes.map(({ id, episode_number, type, fansub, backblaze_link, watch_link_1, watch_link_2, watch_link_3 }) => {
				const links = [backblaze_link, watch_link_1, watch_link_2, watch_link_3];

				return {
					name: formatName(episode_number, type),
					description: fansub ?? "",
					value: {
						id,
						episode_number,
						link: getLink(links),
					},
					disabled: links.every((link) => !link || link.trim() === ""),
				};
			}),
		}]);

		const dirPath = path.join("videos", anime._id);
		const downloadPath = path.join(dirPath, `${episode.id}`);

		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}

		await download(episode.link, downloadPath);
		spinner.succeed(chalk.bold(`${anime.NAME} — ${episode.episode_number}. Bölüm başarıyla indirildi.`));
	} catch {
		spinner.fail("Bir şeyler ters gitti, lütfen daha sonra tekrar deneyiniz.");
	}
})();