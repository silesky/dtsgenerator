import Debug from 'debug';
import opts from '../commandOptions';
import SimpleTypes = JsonSchemaOrg.Draft04.Schema.Definitions.SimpleTypes;

const debug = Debug('dtsgen');

export function toTSType(type: string, debugSource?: any): string | undefined {
    switch (type) {
        case 'integer':
            return 'number';
        case 'any':
        case 'null':
        case 'undefined':
        case 'string':
        case 'number':
        case 'boolean':
            return type;
        case 'object':
        case 'array':
            return undefined;
        default:
            if (debugSource) {
                debug(`toTSType: unknown type: ${JSON.stringify(debugSource, null, 2)}`);
            }
            throw new Error('unknown type: ' + type);
    }
}

export function reduceTypes(types: SimpleTypes[]): SimpleTypes[] {
    if (types.length < 2) {
        return types;
    }
    const set = new Set<SimpleTypes>(types);
    if (opts.target === 'v1') {
        set.delete('null');
    }
    if (set.delete('integer')) {
        set.add('number');
    }
    return Array.from(set.values());
}

export function toTypeName(str: string): string {
    if (!str) {
        return str;
    }
    str = str.trim();
    return str.split('$').map((s) => s.replace(/(?:^|[^A-Za-z0-9])([A-Za-z0-9])/g, (_, m) => {
        return m.toUpperCase();
    })).join('$');
}

export function mergeSchema(a: any, b: any): any {
    Object.keys(b).forEach((key: string) => {
        const value = b[key];
        if (a[key] != null && typeof value !== typeof a[key]) {
            debug(`mergeSchema warning: type is mismatched, key=${key}`);
        }
        if (Array.isArray(value)) {
            a[key] = (a[key] || []).concat(value);
        } else if (typeof value === 'object') {
            a[key] = Object.assign(a[key] || {}, value);
        } else {
            a[key] = value;
        }
    });
    return a;
}
