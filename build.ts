import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { utils } from "https://raw.githubusercontent.com/maemon4095/deno_make/f8c755ba9f3ca6fea39f9705d119e846ec0e9490/mod.ts";
import { parse, patterns } from "https://raw.githubusercontent.com/maemon4095/ts_components/7e6ed664ee5339c071ae0a2e603bd793dfa5b229/parse/mod.ts";

const [schemaId, args] = parse(
    [
        {
            positional: [patterns.optional(patterns.str)],
            options: {
                ["--base"]: patterns.choice("alpine", "ubuntu"),
                ["--version"]: patterns.optional(patterns.str),
                ["--cache-from"]: patterns.str,
                ["--cache-to"]: patterns.str
            }
        },
        {
            positional: [patterns.optional(patterns.str)],
            options: {
                ["--base"]: patterns.choice("alpine", "ubuntu"),
                ["--version"]: patterns.optional(patterns.str)
            }
        },
        {
            positional: [patterns.optional(patterns.str)],
            options: {}
        }
    ] as const,
    Deno.args
);

console.log("args:", args);

const BASE_NAME = "satysfi-base";
const BINARY_NAME = "satysfi-binary";
const CONTAINER_NAME = "satysfi-container";

const REGISTRY = "ghcr.io/maemon4095";

const CACHE_ARGS = (() => {
    if (schemaId !== 0) {
        return "";
    }
    const from = args.options["--cache-from"];
    const to = args.options["--cache-to"];

    return `"--cache-from=${from}" "--cache-to=${to}"`;
})();

function baseTag(baseImage: string, baseVersion: string) {
    return `${BASE_NAME}:${baseImage}-${baseVersion}`;
}

function buildBase(baseImage: string, baseVersion: string) {
    const context = "./images/base";
    const TAG = baseTag(baseImage, baseVersion);
    return async () => {
        await $.raw`docker buildx build --load ${CACHE_ARGS} --build-arg="BASE_VERSION=${baseVersion}" -f ${context}/${baseImage}.Dockerfile -t local/${TAG} ${context}`;
    };
}

function binaryTag(baseImage: string, baseVersion: string) {
    return `${BINARY_NAME}:${baseImage}-${baseVersion}`;
}

function buildBinary(baseImage: string, baseVersion: string) {
    const context = "./images/binary";
    const TAG = binaryTag(baseImage, baseVersion);
    return async () => {
        await $.raw`docker buildx build --load ${CACHE_ARGS} --build-arg="BASE_VERSION=${baseVersion}" -f ${context}/${baseImage}.Dockerfile -t local/${TAG} ${context}`;
    };
}

function containerTag(baseImage: string, baseVersion: string) {
    return `${CONTAINER_NAME}:${baseImage}-${baseVersion}`;
}

function buildContainer(baseImage: string, baseVersion: string) {
    const context = "./images/container";
    const TAG = containerTag(baseImage, baseVersion);

    return async () => {
        await $.raw`docker buildx build --load ${CACHE_ARGS} --build-arg="BASE_VERSION=${baseVersion}" -f ${context}/${baseImage}.Dockerfile -t local/${TAG} ${context}`;
    };
}

function containerSlimTag(baseImage: string, baseVersion: string) {
    return `${CONTAINER_NAME}:${baseImage}-${baseVersion}-slim`;
}

function buildContainerSlim(baseImage: string, baseVersion: string) {
    const context = "./images/container";
    const TAG = containerSlimTag(baseImage, baseVersion);
    return async () => {
        await $.raw`docker buildx build --load ${CACHE_ARGS} --build-arg="BASE_VERSION=${baseVersion}" -f ${context}/${baseImage}-slim.Dockerfile -t local/${TAG} ${context}`;
    };
}

function push(tag: string) {
    return async () => {
        await $.raw`docker tag local/${tag} ${REGISTRY}/${tag}`;
        await $.raw`docker push ${REGISTRY}/${tag}`;
    };
}

const deps = {
    push_base: ["base"],
    binary: ["base"],
    push_binary: ["binary"],
    container: ["container_slim"],
    push_container: ["container"],
    container_slim: ["base"],
    push_container_slim: ["container_slim"]
} as const;

async function exec(tasks: string[], baseImage: string, baseVersion: string) {
    const cmds = {
        base: buildBase(baseImage, baseVersion),
        push_base: push(baseTag(baseImage, baseVersion)),
        binary: buildBinary(baseImage, baseVersion),
        push_binary: push(binaryTag(baseImage, baseVersion)),
        container: buildContainer(baseImage, baseVersion),
        push_container: push(containerTag(baseImage, baseVersion)),
        container_slim: buildContainerSlim(baseImage, baseVersion),
        push_container_slim: push(containerSlimTag(baseImage, baseVersion)),
    };

    await utils.execute(cmds, deps, tasks);
}

const tasks = args.positional[0] === null ? [] : [args.positional[0]];

const ALPINE_VERSION = "3.19";
const UBUNTU_VERSION = "22.04";

switch (schemaId) {
    case 0:
    case 1: {
        const version = args.options["--version"] ?? (args.options["--base"] === "alpine" ? ALPINE_VERSION : UBUNTU_VERSION);
        await exec(tasks, args.options["--base"], version);
        break;
    }
    case 2: {
        await Promise.all([
            exec(tasks, "alpine", ALPINE_VERSION),
            exec(tasks, "ubuntu", UBUNTU_VERSION)
        ]);
        break;
    }
}

