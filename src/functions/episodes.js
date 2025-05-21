/* eslint-disable no-inline-comments */
// @ts-check
import chalk from "chalk";

export function getLink(/** @type {string[]} */ links) {
	return links.find(link => link && link.trim() !== "") || "";
}

export function formatName(/** @type {number} */ number, /** @type {string} */ type) {
	const typeLabel = type?.length ? chalk.red(`(${type})`) : "";
	return `${number}. Bölüm ${typeLabel}`;
}