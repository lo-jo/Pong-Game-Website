SRCS_PATH = ./srcs/
YML_FILE = docker-compose.yml
COMPOSE_FILE = $(addprefix $(SRCS_PATH), $(YML_FILE))

all:
	@echo "Launching ft_transcendence ..."
	@docker compose -f $(COMPOSE_FILE) up --build -d

# Start services in the foreground
up:
	@echo "Start service of ft_transcendence in the foreground ..."
	@docker compose -f $(COMPOSE_FILE) up --build

# Start services in the background
up-detached:
	@echo "Start service of ft_transcendence in the background ..."
	@docker compose -f $(COMPOSE_FILE) up -d

build-no-cache:
	@echo "Build ft_transcendence with no cache ..."
	@docker compose -f $(COMPOSE_FILE) build --no-cache

# Stop services
stop:
	@echo "Stopping ft_transcendence ..."
	@docker compose -f $(COMPOSE_FILE) stop

# Stop and remove containers, networks, volumes, and images created by 'up'
down:
	@echo "Stopping and removing containers, networks, volumes in ft_transcendence ..."
	@docker compose -f $(COMPOSE_FILE) down

debug: clean
	@echo "Launching ft_transcendence with debug logs ..."
	@docker compose -f $(COMPOSE_FILE) up --build

remove_images:
	@if [ -n "$$(docker image ls -q)" ]; then \
		echo "Removing docker images ..."; \
		docker compose -f $(COMPOSE_FILE) down --rmi all; \
		echo "Images removed $(GREEN)\t\t\t\t[ ✔ ]$(RESET)"; \
	else \
		echo "\n$(BOLD)$(RED)No Docker volumes found.\n$(RESET)"; \
	fi

remove_containers:
	@if [ -n "$$(docker ps -aq)" ]; then \
		echo "$(YELLOW)\n. . . stopping and removing docker containers . . . \n$(RESET)"; \
		docker compose -f $(COMPOSE_FILE) down; \
		echo "\n$(BOLD)$(GREEN)Containers stopped and removed [ ✔ ]\n$(RESET)"; \
	else \
		echo "\n$(BOLD)$(RED)No Docker containers found.$(RESET)\n"; \
	fi

clean: remove_containers remove_images
	@echo "ft_transcendence cleaned $(GREEN)\t\t[ ✔ ]$(RESET)"

# Prune system - removes stopped containers, unused networks, dangling images, and build cache
prune:
	@echo "$(YELLOW)\n Pruning all docker environment... \n$(RESET)"
	docker system prune -a -f 
	docker volume prune -f
	@echo "ft_transcendence pruned $(GREEN)\t\t[ ✔ ]$(RESET)"

re: prune all

# Execute a command in a running container
# Usage: make exec service=[service_name] cmd="[command]"
exec:
	docker exec -it $(service) $(cmd)

.PHONY: all up up-detached build-no-cache stop down debug prune re

# COLORS
RESET = \033[0m
WHITE = \033[37m
GREY = \033[90m
RED = \033[91m
DRED = \033[31m
GREEN = \033[92m
DGREEN = \033[32m
YELLOW = \033[93m
DYELLOW = \033[33m
BLUE = \033[94m
DBLUE = \033[34m
MAGENTA = \033[95m
DMAGENTA = \033[35m
CYAN = \033[96m
DCYAN = \033[36m

# FORMAT
BOLD = \033[1m
ITALIC = \033[3m
UNDERLINE = \033[4m
STRIKETHROUGH = \033[9m