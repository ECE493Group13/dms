# Data Mining System

The Data Mining System is an easy to use web-application which applies word2vec, a natural language processing algorithm, to a large repository of medical research papers to identify and discover hidden data patterns.

For deployment instructions, see [Deployment.md](Deployment.md).

## Subtrees

Our project was developed as a number of git repositories which have been merged together using `git subtree`.
They are:

  - `api`: The API server, task runners, and database configuration utilities.
  - `frontend`: The frontend web app.
  - `ngram-word2vec`: A fork of [ziyin-dl/ngram-word2vec](https://github.com/ziyin-dl/ngram-word2vec) which has been slightly modified for use by us.
  - `word2vec_wrapper`: A Python package built to abstract away compiling and running the `ngram-word2vec` code into a single `train` function.

Because we forked `ngram-word2vec` and included it as a subtree, there will be some early commits in this repo that are from [ziyin-dl/ngram-word2vec](https://github.com/ziyin-dl/ngram-word2vec) and hence have been authored by the authors of that repository, and not us.
