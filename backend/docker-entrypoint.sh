#!/bin/sh
set -e

# Run database migrations if database configuration is present
if [ -n "$DATABASE_URL" ] || [ -n "$POSTGRES_HOST" ]; then
    echo "Checking database connection..."
    python -c "
import os, sys, time
from sqlalchemy import create_engine, text

url = os.getenv('DATABASE_URL')
if not url:
    host = os.getenv('POSTGRES_HOST', 'localhost')
    port = os.getenv('POSTGRES_PORT', '5432')
    user = os.getenv('POSTGRES_USER', 'postgres')
    pwd = os.getenv('POSTGRES_PASSWORD', '')
    db = os.getenv('POSTGRES_DB', 'portfolio_db')
    url = f'postgresql+psycopg://{user}:{pwd}@{host}:{port}/{db}'
else:
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql+psycopg://', 1)
    elif url.startswith('postgresql://'):
        url = url.replace('postgresql://', 'postgresql+psycopg://', 1)

engine = create_engine(url, pool_pre_ping=True)
connected = False
for attempt in range(1, 31):
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        print('Database connection established.')
        connected = True
        break
    except Exception as exc:
        time.sleep(1)

if not connected:
    print('Error: Could not connect to database within 30 seconds.')
    sys.exit(1)
"
    echo "Running database migrations (alembic upgrade head)..."
    alembic upgrade head
    echo "Database migrations completed successfully."
fi

exec "$@"
