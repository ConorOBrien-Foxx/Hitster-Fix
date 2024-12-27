const LOCAL_STORAGE_PREFIX = "hitster_fix_";

export const getLocal = suffix =>
    window.localStorage.getItem(LOCAL_STORAGE_PREFIX + suffix);

export const setLocal = (suffix, value) =>
    window.localStorage.setItem(LOCAL_STORAGE_PREFIX + suffix, value);

export const deleteLocal = suffix => {
    delete window.localStorage.removeItem(LOCAL_STORAGE_PREFIX + suffix);
};
