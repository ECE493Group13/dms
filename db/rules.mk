CONTAINER_NAME=postgres
PASSWORD=F49opCuTNMb4hdxmhVGg_ZypnjU
PORT=5433
DATA_MOUNT=$(shell pwd)/db/data/
DB_URL=postgres://postgres:$(PASSWORD)@localhost:$(PORT)/postgres

db-start:
	sudo docker run \
		--publish $(PORT):5432 \
		--volume $(DATA_MOUNT):/var/lib/postgresql/data \
		--name $(CONTAINER_NAME) \
		--env POSTGRES_PASSWORD=$(PASSWORD) \
		--detach \
		postgres

db-stop:
	sudo docker stop $(CONTAINER_NAME)
	sudo docker rm $(CONTAINER_NAME)

db-init:
	./db/init-data.bash $(DB_URL)

psql:
	psql $(DB_URL)
