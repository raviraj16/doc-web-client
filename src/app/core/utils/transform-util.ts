export class TransformUtils {
    static checkArrayOrCreateArray(input: string | string[] | undefined): string[] {
        return Array.isArray(input) ? input : input ? input.split(',').map(tag => tag.trim()) : [];
    }
    static checkArrayAndCreateString(input: string | string[] | undefined): string {
        return Array.isArray(input) ? input.join(', ') : input ? input.trim() : '';
    }
}