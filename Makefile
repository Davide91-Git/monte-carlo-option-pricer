.PHONY: up down build migrate migration seed test logs shell

up:           ## Start dev environment
	docker compose up --build

down:         ## Stop and remove containers
	docker compose down

build:        ## Rebuild images without cache
	docker compose build --no-cache

migrate:      ## Apply pending Alembic migrations
	docker compose exec backend alembic upgrade head

migration:    ## Generate a new migration (usage: make migration name="description")
	docker compose exec backend alembic revision --autogenerate -m "$(name)"

seed:         ## Load DJIA stocks from Yahoo Finance
	docker compose exec backend python -m scripts.seed

test:         ## Run pytest
	docker compose exec backend pytest -v --tb=short

logs:         ## Tail backend logs
	docker compose logs -f backend

shell:        ## Open shell in backend container
	docker compose exec backend bash