import config from "../config";

export const appKey = config.AUTHOR_IDENTIFIER + "." + config.PACKAGE_BUNDLE_NAME;

export function generateMetadataKey(variableName: string) {
    return appKey + "/" + variableName;
}
