FROM tensorflow/tensorflow:1.15.0-gpu

RUN apt-get update && apt-get install -y wget

RUN cd /usr/local/lib/python2.7/dist-packages/tensorflow_core && \
    ln -s libtensorflow_framework.so.1 libtensorflow_framework.so

COPY word2vec /app/word2vec
WORKDIR /app/word2vec
RUN export TF_INC=$(python -c 'import tensorflow as tf; print(tf.sysconfig.get_include())'); \
    export TF_LIB=$(python -c 'import tensorflow as tf; print(tf.sysconfig.get_lib())'); \
    echo $TF_LIB ; \
    g++ -std=c++11 -shared word2vec_ops.cc word2vec_kernels.cc -o word2vec_ops.so -fPIC -I $TF_INC -O2 -D_GLIBCXX_USE_CXX11_ABI=0 -L$TF_LIB -ltensorflow_framework 
