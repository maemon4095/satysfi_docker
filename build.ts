import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { Dependencies } from "https://raw.githubusercontent.com/maemon4095/deno_make/main/core.ts";
import { utils } from "https://raw.githubusercontent.com/maemon4095/deno_make/main/mod.ts";

const ALPINE_VERSION = "3.19";
const UBUNTU_VERSION = "22.04";

const BASE_NAME = "satysfi-base";
const BINARY_NAME = "satysfi-binary";
const CONTAINER_NAME = "satysfi-container";

const ALPINE_BASE_TAG = `alpine-${ALPINE_VERSION}`;
const UBUNTU_BASE_TAG = `ubuntu-${UBUNTU_VERSION}`;

const REGISTRY = "ghcr.io/maemon4095";

async function buildBase() {
    const context = "./images/base";

    await Promise.all([
        $.raw`docker build --build-arg="BASE_VERSION=${ALPINE_VERSION}" -f ${context}/alpine.Dockerfile -t local/${BASE_NAME}:${ALPINE_BASE_TAG} ${context}`,
        $.raw`docker build --build-arg="BASE_VERSION=${UBUNTU_VERSION}" -f ${context}/ubuntu.Dockerfile -t local/${BASE_NAME}:${UBUNTU_BASE_TAG} ${context}`
    ]);
}

async function pushBase() {
    await Promise.all([
        $.raw`docker tag local/${BASE_NAME}:${ALPINE_BASE_TAG} ${REGISTRY}/${BASE_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker tag local/${BASE_NAME}:${UBUNTU_BASE_TAG} ${REGISTRY}/${BASE_NAME}:${UBUNTU_BASE_TAG}`
    ]);

    await Promise.all([
        $.raw`docker push ${REGISTRY}/${BASE_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker push ${REGISTRY}/${BASE_NAME}:${UBUNTU_BASE_TAG}`
    ]);
}

async function buildBinary() {
    const context = "./images/binary";

    await Promise.all([
        $.raw`docker build --build-arg="BASE_VERSION=${ALPINE_VERSION}" -f ${context}/alpine.Dockerfile -t local/${BINARY_NAME}:${ALPINE_BASE_TAG} ${context}`,
        $.raw`docker build --build-arg="BASE_VERSION=${UBUNTU_VERSION}" -f ${context}/ubuntu.Dockerfile -t local/${BINARY_NAME}:${UBUNTU_BASE_TAG} ${context}`
    ]);
}

async function pushBinary() {
    await Promise.all([
        $.raw`docker tag local/${BINARY_NAME}:${ALPINE_BASE_TAG} ${REGISTRY}/${BINARY_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker tag local/${BINARY_NAME}:${UBUNTU_BASE_TAG} ${REGISTRY}/${BINARY_NAME}:${UBUNTU_BASE_TAG}`
    ]);

    await Promise.all([
        $.raw`docker push ${REGISTRY}/${BINARY_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker push ${REGISTRY}/${BINARY_NAME}:${UBUNTU_BASE_TAG}`
    ]);
}

async function buildContainer() {
    const context = "./images/container";

    await Promise.all([
        $.raw`docker build --build-arg="BASE_VERSION=${ALPINE_VERSION}" -f ${context}/alpine.Dockerfile -t local/${CONTAINER_NAME}:${ALPINE_BASE_TAG} ${context}`,
        $.raw`docker build --build-arg="BASE_VERSION=${UBUNTU_VERSION}" -f ${context}/ubuntu.Dockerfile -t local/${CONTAINER_NAME}:${UBUNTU_BASE_TAG} ${context}`
    ]);
}

async function pushContainer() {
    await Promise.all([
        $.raw`docker tag local/${CONTAINER_NAME}:${ALPINE_BASE_TAG} ${REGISTRY}/${CONTAINER_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker tag local/${CONTAINER_NAME}:${UBUNTU_BASE_TAG} ${REGISTRY}/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}`
    ]);

    await Promise.all([
        $.raw`docker push ${REGISTRY}/${CONTAINER_NAME}:${ALPINE_BASE_TAG}`,
        $.raw`docker push ${REGISTRY}/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}`
    ]);
}

async function buildContainerSlim() {
    const context = "./images/container";

    await Promise.all([
        $.raw`docker build --build-arg="BASE_VERSION=${ALPINE_VERSION}" -f ${context}/alpine-slim.Dockerfile -t local/${CONTAINER_NAME}:${ALPINE_BASE_TAG}-slim ${context}`,
        $.raw`docker build --build-arg="BASE_VERSION=${UBUNTU_VERSION}" -f ${context}/ubuntu-slim.Dockerfile -t local/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}-slim ${context}`
    ]);
}

async function pushContainerSlim() {
    await Promise.all([
        $.raw`docker tag local/${CONTAINER_NAME}:${ALPINE_BASE_TAG}-slim ${REGISTRY}/${CONTAINER_NAME}:${ALPINE_BASE_TAG}-slim`,
        $.raw`docker tag local/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}-slim ${REGISTRY}/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}-slim`
    ]);

    await Promise.all([
        $.raw`docker push ${REGISTRY}/${CONTAINER_NAME}:${ALPINE_BASE_TAG}-slim`,
        $.raw`docker push ${REGISTRY}/${CONTAINER_NAME}:${UBUNTU_BASE_TAG}-slim`
    ]);
}

const cmds = {
    base: buildBase,
    push_base: pushBase,
    binary: buildBinary,
    push_binary: pushBinary,
    container: buildContainer,
    push_container: pushContainer,
    container_slim: buildContainerSlim,
    push_container_slim: pushContainerSlim,
};

const deps = {
    push_base: ["base"],
    binary: ["base"],
    push_binary: ["binary"],
    container: ["container_slim"],
    push_container: ["container"],
    container_slim: ["base"],
    push_container_slim: ["container_slim"]
} as const satisfies Dependencies<typeof cmds>;

await utils.execute(cmds, deps, Deno.args);