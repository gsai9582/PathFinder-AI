#!/usr/bin/env python3
"""Database initialization and seeding script for PathFinder AI."""

import os
import sys

# Ensure backend app is discoverable
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database import engine, Base, SessionLocal
from app.repositories.seed_data import seed_database
from app.utils.logger import logger

def main():
    logger.info("Initializing PathFinder database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
