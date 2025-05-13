#!/usr/bin/env python3
"""
Launcher script for LiamClickerV2.
"""

import sys
import os

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the main module
from src.main import main

if __name__ == "__main__":
    # Run the game
    main()