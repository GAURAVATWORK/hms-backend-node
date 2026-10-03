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

const writeLocalFile = async (storageKey, fileBuffer) => {
    const filePath = getLocalFilePath(storageKey);

    await fs.mkdir(path.dirname(filePath), {
        recursive: true,
    });

    await fs.writeFile(filePath, fileBuffer);

    return filePath;
};

const copyLocalFile = async (sourceFilePath, storageKey) => {
    const destinationFilePath = getLocalFilePath(storageKey);

    await fs.mkdir(path.dirname(destinationFilePath), {
        recursive: true,
    });

    await fs.copyFile(
        sourceFilePath,
        destinationFilePath
    );

    return destinationFilePath;
};

const deleteLocalFile = async (storageKey) => {
    const filePath = getLocalFilePath(storageKey);

    await fs.rm(filePath, {
        force: true,
    });
};

export {
    getLocalFilePath,
    readLocalFile,
    writeLocalFile,
    copyLocalFile,
    deleteLocalFile,
};