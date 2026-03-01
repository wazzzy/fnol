.PHONY: install dev backend frontend setup

# Full setup
setup: install
	@echo "Setup complete. Run 'make dev' to start both servers."

install:
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "Installing backend dependencies..."
	cd backend && uv pip install -r requirements.txt

# Start both servers concurrently
dev:
	@echo "Starting frontend (port 3000) and backend (port 8000)..."
	@(trap 'kill 0' SIGINT; \
		cd backend && uv run uvicorn main:app --reload --port 8000 & \
		cd frontend && pnpm dev & \
		wait)

backend:
	cd backend && uv run uvicorn main:app --reload --port 8000

frontend:
	cd frontend && pnpm dev
