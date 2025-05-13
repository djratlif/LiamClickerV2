"""
Button class for UI elements.
"""

import pygame
from src.config import COLORS, FONT_SIZES

class Button:
    """
    A clickable button UI element.
    """
    def __init__(self, rect, text, on_click=None, font_size='medium', 
                 bg_color=COLORS['button'], hover_color=COLORS['button_hover'], 
                 text_color=COLORS['text'], disabled=False):
        """
        Initialize a button.
        
        Args:
            rect (pygame.Rect): The rectangle defining the button's position and size.
            text (str): The text to display on the button.
            on_click (function, optional): The function to call when the button is clicked.
            font_size (str, optional): The size of the font ('small', 'medium', 'large').
            bg_color (tuple, optional): The background color of the button.
            hover_color (tuple, optional): The background color when hovering.
            text_color (tuple, optional): The color of the text.
            disabled (bool, optional): Whether the button is disabled.
        """
        self.rect = pygame.Rect(rect)
        self.text = text
        self.on_click = on_click
        self.font_size = FONT_SIZES[font_size]
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.text_color = text_color
        self.disabled = disabled
        self.hovered = False
        self.font = None
        self.text_surface = None
        self.text_rect = None
        self._initialize_font()
    
    def _initialize_font(self):
        """Initialize the font and text surface."""
        self.font = pygame.font.SysFont('Arial', self.font_size)
        self.text_surface = self.font.render(self.text, True, self.text_color)
        self.text_rect = self.text_surface.get_rect(center=self.rect.center)
    
    def update(self, mouse_pos):
        """
        Update the button state based on mouse position.
        
        Args:
            mouse_pos (tuple): The current mouse position (x, y).
        """
        if not self.disabled:
            self.hovered = self.rect.collidepoint(mouse_pos)
    
    def render(self, surface):
        """
        Render the button on the given surface.
        
        Args:
            surface (pygame.Surface): The surface to render the button on.
        """
        # Draw button background
        color = self.hover_color if self.hovered else self.bg_color
        if self.disabled:
            # Use a darker color for disabled buttons
            color = tuple(max(0, c - 50) for c in self.bg_color)
        
        pygame.draw.rect(surface, color, self.rect, border_radius=5)
        pygame.draw.rect(surface, COLORS['text'], self.rect, width=2, border_radius=5)
        
        # Draw button text
        surface.blit(self.text_surface, self.text_rect)
    
    def handle_event(self, event):
        """
        Handle pygame events for the button.
        
        Args:
            event (pygame.event.Event): The event to handle.
            
        Returns:
            bool: True if the button was clicked, False otherwise.
        """
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:  # Left mouse button
            if self.hovered and not self.disabled and self.on_click:
                self.on_click()
                return True
        return False
    
    def set_text(self, text):
        """
        Update the button text.
        
        Args:
            text (str): The new text for the button.
        """
        self.text = text
        self._initialize_font()
    
    def set_disabled(self, disabled):
        """
        Set whether the button is disabled.
        
        Args:
            disabled (bool): Whether the button should be disabled.
        """
        self.disabled = disabled