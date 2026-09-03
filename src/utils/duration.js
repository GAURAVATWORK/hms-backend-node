
const durationToMilliseconds = (duration) => {

    const match = duration.match(/^(\d+)(s|m|h|d)$/);
    
    if(!match){
        throw new Error(
           `Invalid duration format: ${duration}` 
        );
    }

    const value = Number(match[1]);
    const unit = match[2];

    const millisecondsPerUnit = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return value * millisecondsPerUnit[unit];
};

export {
    durationToMilliseconds
};