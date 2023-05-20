FROM ubuntu:22.04
RUN apt update -y && \
    apt upgrade -y && \
    apt install -y curl build-essential opam fontconfig

# ocaml setup
ENV OPAMROOTISOK=true
ENV OPAMYES=true
RUN opam init --no-setup --disable-sandboxing
RUN eval $(opam env)
RUN echo "eval \$(opam env)" >> /root/.profile
RUN opam repository add --all-switches satysfi-external https://github.com/gfngfn/satysfi-external-repo.git
RUN opam repository add --all-switches satyrographos-repo https://github.com/na4zagin3/satyrographos-repo.git

## install satysfi
RUN opam install satysfi satysfi-dist satyrographos

# rust setup
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
## install satysfi language server
RUN /root/.cargo/bin/cargo install --git https://github.com/monaqa/satysfi-language-server

# install fonts
## install HackGen
ARG HACKGEN_VER=v2.8.0
ARG HACKGEN_FILE=HackGen_NF_${HACKGEN_VER}
RUN curl -sLJO https://github.com/yuru7/HackGen/releases/download/${HACKGEN_VER}/${HACKGEN_FILE}.zip && \
    unzip ${HACKGEN_FILE}.zip && rm ${HACKGEN_FILE}.zip && \
    mkdir "$HOME/.fonts/" && mv ${HACKGEN_FILE}/* "$HOME/.fonts/" && rm -rf ${HACKGEN_FILE} && \
    fc-cache -f -v

COPY entry.sh /
ENTRYPOINT [ "/entry.sh" ]