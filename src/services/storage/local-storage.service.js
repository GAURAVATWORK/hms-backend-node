import fs from "fs/promises";
import path from "path";

import env from "../../config/env.js";


const getLocalFilePath = (storageKey) => {
    const storageRoot = path.resolve(env.localStoragePath);

    const normalizedKey = storageKey.replaceAll("\\", "/");

    const filePath = path.resolve(
        storageRoot,
        normalizedKey
    );

    if (
        filePath !== storageRoot &&
        !filePath.startsWith(`${storageRoot}${path.sep}`)
    ) {
        throw new Error("Invalid storage path");
    }

    return filePath;
};


const readLocalFile = async (storageKey) => {
    const filePath = getLocalFilePath(storageKey);

    return fs.readFile(filePath);
};


export {
    getLocalFilePath,
    readLocalFile
};