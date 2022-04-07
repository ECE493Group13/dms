.phony: update
update:
	git subtree pull --prefix api git@github.com:ECE493Group13/api.git main
	git subtree pull --prefix frontend git@github.com:ECE493Group13/frontend.git master
	git subtree pull --prefix word2vec_wrapper git@github.com:ECE493Group13/word2vec_wrapper.git main
	git subtree pull --prefix ngram-word2vec git@github.com:ECE493Group13/ngram-word2vec.git master

.phony: submit
submit: update
	git push submit main
