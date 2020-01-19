export function dropFirst<E>(target: E, array: E[]) {
    const i = array.indexOf(target);
    const ret = [...array]
    ret.splice(i, 1);
    return ret;
}

export function dropLast<E>(target: E, array: E[]) {
    const i = array.lastIndexOf(target);
    const ret = [...array]
    ret.splice(i, 1);
    return ret;
}