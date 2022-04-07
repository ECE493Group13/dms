#!/usr/bin/env bash

set -o xtrace

TRAIN_PATH=$(pwd)/submodules/ngram-word2vec/scripts/data/ngram_data/
EVAL_PATH=$(pwd)/submodules/ngram-word2vec/word2vec/word2vec/trunk/
SAVE_PATH=$(pwd)/data/

docker run \
    --volume $TRAIN_PATH:/data/train \
    --volume $EVAL_PATH:/data/eval \
    --volume $SAVE_PATH:/data/save \
    word2vec \
    python word2vec_optimized.py \
        --train_data /data/train/1800-ngram.txt \
        --eval_data /data/eval/questions-words.txt \
        --save_path /data/save

