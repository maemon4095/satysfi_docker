ARG BASE_VERSION
FROM ubuntu:${BASE_VERSION} AS build-rs

# rust setup
RUN apt update -y && apt install -y git unzip curl build-essential
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
## build satysfi language server
RUN git clone https://github.com/monaqa/satysfi-language-server.git && cd satysfi-language-server && \
    /root/.cargo/bin/cargo build --bins --release --target-dir target && \
    mkdir /artifacts && \
    mv ./target/release/satysfi-language-server /artifacts/

FROM local/satysfi-base:ubuntu-${BASE_VERSION}

# install satysfi language server
COPY --from=build-rs /artifacts/* /usr/bin/

RUN eval $(opam env)
RUN echo "eval \$(opam env)" >> /root/.profile

## install satysfi
RUN opam install camlimages.5.0.4-1 satysfi satysfi-dist satyrographos