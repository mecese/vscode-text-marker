import {PatternType} from './entities/highlight';

const PATTERN_TYPE_MAP: Map<string, PatternType> = new Map([
    ['String', PatternType.STRING],
    ['RegExp', PatternType.REGEX]
]);

export const getExternalName = internalName => PATTERN_TYPE_MAP.get(internalName);

export const getInternalName = externalName => {
    const found = Array.from(PATTERN_TYPE_MAP.entries())
        .find(([_iName, eName]) => eName === externalName);
    return found ? found[0] : null;
};
