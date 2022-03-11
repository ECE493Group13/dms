#!/usr/bin/env bash

set -o xtrace

THIS_DIR=$(readlink -f .)
cd $THIS_DIR/submodules/ngram-word2vec/scripts
docker run -v $THIS_DIR/submodules/ngram-word2vec/scripts:/app/word2vec/scripts word2vec bash -c "cd scripts && ./run_pipeline.sh"
cd -
