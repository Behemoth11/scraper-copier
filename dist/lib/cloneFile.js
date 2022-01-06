"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getPathAndFileName_1 = __importDefault(require("./getPathAndFileName"));
const utils_1 = require("../utils");
const downloadImg_1 = __importDefault(require("./downloadImg"));
const formatLink_1 = __importDefault(require("./formatLink"));
const writeFile_1 = __importDefault(require("./writeFile"));
const connect_1 = __importDefault(require("../connect"));
const path_1 = __importDefault(require("path"));
const Logger_1 = __importDefault(require("../classes/Logger"));
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
exports.default = (url, axios_request) => __awaiter(void 0, void 0, void 0, function* () {
    connect_1.default.see(url);
    const parsedUrl = new URL(url);
    const [web_path, fileName] = (0, getPathAndFileName_1.default)(url);
    const fileExtension = (0, utils_1.getFileExtension)(fileName);
    try {
        if (!fs.existsSync(web_path))
            fs.mkdirSync(web_path, { recursive: true });
    }
    catch (err) {
        Logger_1.default.error(fileExtension, url, `could not create file ${web_path}`);
        return;
    }
    axios_request.current++;
    const response = yield axios
        .get(url)
        .catch((err) => Logger_1.default.error(fileExtension, url, `Not Found`));
    if (!response)
        return;
    let link_to_save = [];
    if (["png", "jpg", "jpeg", "gif", "svg"].includes(fileExtension)) {
        yield (0, downloadImg_1.default)(url, path_1.default.join(web_path, fileName), () => {
            Logger_1.default.info(fileExtension, url, web_path, fileName);
        });
        return;
    }
    else if (["html", "htm"].includes(fileExtension)) {
        const $ = cheerio.load(response.data);
        const links = $("a");
        const script = $("script");
        const meta_links = $("link");
        const image_links = $("img");
        $(meta_links).each((i, meta_link) => {
            const _meta_link = $(meta_link).attr("href");
            (0, formatLink_1.default)(_meta_link, parsedUrl, link_to_save);
        });
        $(script).each((i, script) => {
            const _script = $(script).attr("src");
            (0, formatLink_1.default)(_script, parsedUrl, link_to_save);
        });
        $(links).each(function (i, link) {
            const _link = $(link).attr("href");
            (0, formatLink_1.default)(_link, parsedUrl, link_to_save);
        });
        $(image_links).each(function (i, image_link) {
            const _image_link = $(image_link).attr("src");
            (0, formatLink_1.default)(_image_link, parsedUrl, link_to_save);
        });
    }
    else if (fileExtension === "css") {
        const myRegexp = /url\(("|')*(.*?)("|')*\)/g;
        let match = myRegexp.exec(response.data);
        while (match != null) {
            (0, formatLink_1.default)(match[2], parsedUrl, link_to_save);
            match = myRegexp.exec(response.data);
        }
    }
    yield connect_1.default.add(link_to_save.slice(0, 100));
    if (link_to_save.length > 0) {
        // console.log("new links added : ", link_to_save.slice(0, 40));
    }
    yield (0, writeFile_1.default)(response.data, web_path, fileName);
    Logger_1.default.info(fileExtension, url, web_path, fileName);
});
//# sourceMappingURL=cloneFile.js.map