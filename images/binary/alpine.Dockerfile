ARG BASE_VERSION
FROM local/satysfi-base:alpine-${BASE_VERSION} AS build

# satysfi setup
ARG SATYSFI_VERSION=0.0.10
ARG SATYROGRAPHOS_VERSION=0.0.2.13

RUN apk add --no-cache linux-headers

RUN opam update && opam install camlimages.5.0.4-1 satysfi.${SATYSFI_VERSION} satysfi-dist.${SATYSFI_VERSION} satyrographos.${SATYROGRAPHOS_VERSION}
RUN eval $(opam env) && \
    satyrographos install --copy && \
    mkdir -p /artifacts && \
    cp $(which satysfi) /artifacts/ && \
    cp $(which satyrographos) /artifacts/

# rust setup
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
## install satysfi language server
RUN git clone https://github.com/monaqa/satysfi-language-server.git && cd satysfi-language-server && \
    /root/.cargo/bin/cargo build --bins --release --target-dir target && \
    mv ./target/release/satysfi-language-server /artifacts/

FROM alpine:${BASE_VERSION}
COPY --from=build /artifacts/* /usr/bin

RUN mkdir /workspace

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod a+x /entrypoint.sh

WORKDIR /workspace

ENTRYPOINT ["/entrypoint.sh"]