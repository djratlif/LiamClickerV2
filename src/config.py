"""
Configuration settings for the clicker game.
"""

# Screen settings
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60
TITLE = "Liam Clicker V2"

# Colors
COLORS = {
    'background': (240, 240, 240),
    'text': (0, 0, 0),
    'button': (200, 200, 200),
    'button_hover': (180, 180, 180),
    'panel': (220, 220, 220),
    'highlight': (100, 149, 237),  # Cornflower blue
    'positive': (50, 205, 50),     # Lime green
    'negative': (220, 20, 60),     # Crimson
}

# Game settings
CLICK_BASE_VALUE = 1
CURRENCY_NAME = "Mullet Bucks"
CLICK_AREA_SIZE = (200, 200)
CLICK_AREA_POSITION = (SCREEN_WIDTH // 2 - CLICK_AREA_SIZE[0] // 2, 
                       SCREEN_HEIGHT // 2 - CLICK_AREA_SIZE[1] // 2)

# Font settings
FONT_SIZES = {
    'small': 16,
    'medium': 24,
    'large': 32,
    'title': 48,
}

# Upgrade definitions
UPGRADES = [
    {
        'id': 'click_power',
        'name': 'Click Power',
        'description': 'Increases the value of each click',
        'base_cost': 10,
        'cost_multiplier': 1.5,
        'effect_value': 1,
        'max_level': 5,  # Maximum of 5 levels
    },
    {
        'id': 'auto_clicker',
        'name': 'Auto Clicker',
        'description': 'Automatically clicks once per second',
        'base_cost': 50,
        'cost_multiplier': 1.8,
        'effect_value': 1,
        'max_level': 5,  # Maximum of 5 levels
    },
    {
        'id': 'click_multiplier',
        'name': 'Click Multiplier',
        'description': 'Multiplies the value of each click',
        'base_cost': 100,
        'cost_multiplier': 2.0,
        'effect_value': 2,
        'max_level': 5,  # Maximum of 5 levels
    },
]

# Animation settings
ANIMATION_DURATION = 500  # milliseconds
CLICK_ANIMATION_SCALE = 1.2
PURCHASE_ANIMATION_DURATION = 300  # milliseconds

# Sound settings
SOUND_ENABLED = True
SOUND_VOLUME = 0.5