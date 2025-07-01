import axios from "axios";
import * as cheerio from "cheerio";
import { ANIME } from "../../utils/types";

const BASE_URL = "https://aniwatch.to";

const aniwatch = {
  name: "aniwatch",

  search: async (query: string) => {
    const url = `${BASE_URL}/search?keyword=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const results = $(".film_list-wrap .flw-item").map((i, el) => {
      const id = $(el).find("a").attr("href")?.split("/")[2] || "";
      const title = $(el).find(".film-name").text().trim();
      const image = $(el).find("img").attr("data-src") || "";
      const type = $(el).find(".tick-item.tick-quality").text().trim();

      return {
        id,
        title,
        image,
        type,
      };
    }).get();

    return results;
  },

  fetchAnimeInfo: async (id: string) => {
    const url = `${BASE_URL}/watch/${id}`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const title = $("h2.film-name").text().trim();
    const description = $(".film-description .text").text().trim();
    const episodes = $("ul.ul-eps .ep-item").map((i, el) => {
      const epId = $(el).find("a").attr("href")?.split("/").pop() || "";
      const number = $(el).find(".ep-num").text().trim();
      return {
        id: epId,
        number,
      };
    }).get().reverse();

    return {
      id,
      title,
      description,
      episodes,
    };
  },

  fetchEpisodeSources: async (episodeId: string) => {
    const url = `${BASE_URL}/ajax/server/list/${episodeId}`;
    const res = await axios.get(url);
    const servers = res.data.result || [];

    const sources = servers.map((s: any) => ({
      name: s.name,
      url: s.link,
    }));

    return {
      sources,
    };
  },
};

export default aniwatch satisfies ANIME;
