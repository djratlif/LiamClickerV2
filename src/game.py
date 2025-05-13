"""
Main game class for the clicker game.
"""

import pygame
import sys
import time
import random
from src.config import COLORS, SCREEN_WIDTH, SCREEN_HEIGHT, FPS, TITLE, CLICK_AREA_POSITION, CLICK_AREA_SIZE
from src.models.player import Player
from src.models.upgrade import create_upgrades_from_config
from src.models.currency import Currency
from src.ui.button import Button
from src.ui.panel import Panel
from src.ui.text import Text, DynamicText, draw_text
from src.utils.save_manager import SaveManager
from src.utils.helpers import create_particle, update_particle, render_particle

class Game:
    """
    Main game class that manages the game state and coordinates between different modules.
    """
    def __init__(self):
        """Initialize the game."""
        # Initialize Pygame
        pygame.init()
        pygame.font.init()
        pygame.mixer.init()
        
        # Create the window
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption(TITLE)
        
        # Set up the clock
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Game state
        self.player = Player()
        self.upgrades = create_upgrades_from_config()
        self.save_manager = SaveManager()
        
        # UI elements
        self.ui_elements = []
        self.particles = []
        
        # Initialize the game
        self.initialize()
    
    def initialize(self):
        """Initialize the game state and UI elements."""
        # Create the main click area
        self.click_area = pygame.Rect(CLICK_AREA_POSITION, CLICK_AREA_SIZE)
        
        # Create the currency display
        self.currency_text = DynamicText(
            lambda: f"{Currency.format(self.player.currency)} Mullet Bucks",
            (SCREEN_WIDTH // 2, 50),
            COLORS['text'],
            'large',
            centered=True
        )
        self.ui_elements.append(self.currency_text)
        
        # Create the click power display
        self.click_power_text = DynamicText(
            lambda: f"Click Power: {self.player.click_power}",
            (SCREEN_WIDTH // 2, 90),
            COLORS['text'],
            'medium',
            centered=True
        )
        self.ui_elements.append(self.click_power_text)
        
        # Create the auto click power display
        self.auto_click_text = DynamicText(
            lambda: f"Auto Click: {self.player.auto_click_power}/s",
            (SCREEN_WIDTH // 2, 120),
            COLORS['text'],
            'medium',
            centered=True
        )
        self.ui_elements.append(self.auto_click_text)
        
        # Create the shop panel
        self.shop_panel = Panel(
            pygame.Rect(SCREEN_WIDTH - 250, 50, 200, SCREEN_HEIGHT - 100),
            COLORS['panel']
        )
        
        # Create upgrade buttons
        y_offset = 20
        for upgrade_id, upgrade in self.upgrades.items():
            # Create a button for each upgrade
            upgrade_button = Button(
                pygame.Rect(10, y_offset, 180, 80),
                f"{upgrade.name}\nCost: {upgrade.get_cost()}",
                lambda id=upgrade_id: self.purchase_upgrade(id)
            )
            self.shop_panel.add_element(upgrade_button)
            y_offset += 100
        
        self.ui_elements.append(self.shop_panel)
    
    def update(self, dt):
        """
        Update the game state.
        
        Args:
            dt (float): The time elapsed since the last update in seconds.
        """
        # Process auto clicks
        if self.player.auto_click_power > 0:
            self.player.auto_click(dt)
        
        # Update UI elements
        mouse_pos = pygame.mouse.get_pos()
        for element in self.ui_elements:
            if hasattr(element, 'update'):
                if isinstance(element, DynamicText):
                    element.update(dt)
                else:
                    element.update(mouse_pos)
        
        # Update particles
        self.particles = [p for p in self.particles if update_particle(p, dt)]
    
    def render(self):
        """Render the game state."""
        # Clear the screen
        self.screen.fill(COLORS['background'])
        
        # Draw the click area
        pygame.draw.rect(self.screen, COLORS['button'], self.click_area, border_radius=10)
        pygame.draw.rect(self.screen, COLORS['text'], self.click_area, width=2, border_radius=10)
        
        # Draw the click text
        draw_text(
            self.screen,
            "CLICK ME",
            (self.click_area.centerx, self.click_area.centery),
            COLORS['text'],
            'medium',
            centered=True
        )
        
        # Draw UI elements
        for element in self.ui_elements:
            if hasattr(element, 'render'):
                element.render(self.screen)
        
        # Draw particles
        for particle in self.particles:
            render_particle(self.screen, particle)
        
        # Update the display
        pygame.display.flip()
    
    def handle_events(self):
        """Handle pygame events."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            # Handle mouse clicks
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Left mouse button
                    # Check if the click area was clicked
                    if self.click_area.collidepoint(event.pos):
                        self.handle_click(event.pos)
            
            # Pass events to UI elements
            for element in self.ui_elements:
                if hasattr(element, 'handle_event'):
                    element.handle_event(event)
    
    def handle_click(self, position):
        """
        Handle a click on the click area.
        
        Args:
            position (tuple): The position (x, y) of the click.
        """
        # Process the click
        gained = self.player.click()
        
        # Create particles for visual feedback
        for _ in range(5):
            particle = create_particle(
                position,
                COLORS['highlight'],
                size=random.randint(3, 8),
                lifetime=random.uniform(0.5, 1.5)
            )
            self.particles.append(particle)
        
        # Create a text particle showing the gained amount
        text_particle = {
            'position': list(position),
            'velocity': [0, -50],
            'text': f"+{gained}",
            'color': COLORS['positive'],
            'size': 16,
            'lifetime': 1.0,
            'creation_time': time.time()
        }
        self.particles.append(text_particle)
    
    def purchase_upgrade(self, upgrade_id):
        """
        Purchase an upgrade.
        
        Args:
            upgrade_id (str): The ID of the upgrade to purchase.
            
        Returns:
            bool: True if the purchase was successful, False otherwise.
        """
        upgrade = self.upgrades.get(upgrade_id)
        if not upgrade:
            return False
        
        # Check if the player can afford the upgrade
        if not self.player.can_afford(upgrade):
            return False
        
        # Check if the upgrade is available
        if not upgrade.is_available(self.player):
            return False
        
        # Purchase the upgrade
        success = self.player.purchase_upgrade(upgrade)
        
        if success:
            # Update the button text
            for element in self.shop_panel.elements:
                if isinstance(element, Button) and element.on_click.__name__ == f"<lambda>":
                    # This is a bit of a hack to identify the button for this upgrade
                    if element.on_click.__closure__[0].cell_contents == upgrade_id:
                        level = self.player.get_upgrade_level(upgrade_id)
                        element.set_text(f"{upgrade.name} (Lvl {level})\nCost: {upgrade.get_cost(level)}")
        
        return success
    
    def run(self):
        """Run the game loop."""
        last_time = time.time()
        
        while self.running:
            # Calculate delta time
            current_time = time.time()
            dt = current_time - last_time
            last_time = current_time
            
            # Handle events
            self.handle_events()
            
            # Update game state
            self.update(dt)
            
            # Render
            self.render()
            
            # Cap the frame rate
            self.clock.tick(FPS)
        
        # Clean up
        pygame.quit()
        sys.exit()