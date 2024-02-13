ARG BASE_VERSION
FROM ubuntu:${BASE_VERSION}

RUN apt update -y && \
    apt install -y git unzip curl build-essential

# ocaml setup
ARG OCAML_VERSION=4.14.0
ARG OPAM_VERSION=2.1.3

RUN arch=$([ $(uname -m) = aarch64 ] && echo arm64 || uname -m) && \
    curl -fsL -o /usr/local/bin/opam https://github.com/ocaml/opam/releases/download/${OPAM_VERSION}/opam-${OPAM_VERSION}-${arch}-linux && \
    chmod a+x /usr/local/bin/opam

ENV OPAMROOTISOK=true
ENV OPAMYES=true

RUN opam init --no-setup --disable-sandboxing --compiler=${OCAML_VERSION}

RUN opam repository add --all-switches satysfi-external https://github.com/gfngfn/satysfi-external-repo.git
RUN opam repository add --all-switches satyrographos-repo https://github.com/na4zagin3/satyrographos-repo.git