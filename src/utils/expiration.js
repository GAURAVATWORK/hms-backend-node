import {durationToMilliseconds} from "./duration.js";

const calculateExpiration = (
    createdAt,
    duration
) => {

    const durationInMilliseconds = durationToMilliseconds(duration);

    return new Date(
        createdAt.getTime() +
        durationInMilliseconds
    );
};

export {
    calculateExpiration
};