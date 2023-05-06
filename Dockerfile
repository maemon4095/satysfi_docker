FROM ubuntu:22.04
RUN apt update -y && \
    apt upgrade -y && \
    apt install -y curl build-essential opam

ENV OPAMROOTISOK=true
ENV OPAMYES=true
RUN opam init --no-setup --disable-sandboxing
RUN eval $(opam env)
RUN echo "eval \$(opam env)" >> $HOME/.bashrc
RUN opam repository add --all-switches satysfi-external https://github.com/gfngfn/satysfi-external-repo.git
RUN opam repository add --all-switches satyrographos-repo https://github.com/na4zagin3/satyrographos-repo.git

RUN opam install satysfi satysfi-dist satyrographos

RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="$HOME/.cargo/bin:$PATH"
RUN $HOME/.cargo/bin/cargo install --git https://github.com/monaqa/satysfi-language-server