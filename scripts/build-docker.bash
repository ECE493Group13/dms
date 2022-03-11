#!/usr/bin/env bash

docker build submodules/ngram-word2vec \
    -f word2vec.Dockerfile \
    -t word2vec
mkdir src/word2vec_wrapper/data
docker save -o src/word2vec_wrapper/data/word2vec-image.tar word2vec