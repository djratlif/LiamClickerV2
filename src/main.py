"""
Entry point for the clicker game.
"""

import pygame
import sys
import os
from src.game import Game

def main():
    """
    Main entry point for the game.
    
    This function initializes the game and starts the game loop.
    """
    # Initialize pygame
    pygame.init()
    
    # Set up the environment
    setup_environment()
    
    # Create and run the game
    game = Game()
    game.run()

def setup_environment():
    """
    Set up the environment for the game.
    
    This function creates necessary directories and sets up the environment.
    """
    # Get the base directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Create asset directories if they don't exist
    for directory in ['assets/images', 'assets/sounds', 'assets/fonts']:
        dir_path = os.path.join(base_dir, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
    
    # Set up pygame
    pygame.display.init()
    pygame.font.init()
    pygame.mixer.init()
    
    # Set the window position (centered)
    os.environ['SDL_VIDEO_CENTERED'] = '1'

if __name__ == "__main__":
    main()