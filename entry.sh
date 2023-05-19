#!/bin/sh
eval $(opam env)
. "$HOME/.cargo/env"
exec "$@"