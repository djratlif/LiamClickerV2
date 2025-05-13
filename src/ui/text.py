"""
Text rendering utilities for UI elements.
"""

import pygame
from src.config import COLORS, FONT_SIZES

class Text:
    """
    A text UI element.
    """
    def __init__(self, text, position, color=COLORS['text'], font_size='medium', 
                 font_name='Arial', centered=False, background=None, padding=0):
        """
        Initialize a text element.
        
        Args:
            text (str): The text to display.
            position (tuple): The position (x, y) of the text.
            color (tuple, optional): The color of the text.
            font_size (str or int, optional): The size of the font ('small', 'medium', 'large' or direct size).
            font_name (str, optional): The name of the font.
            centered (bool, optional): Whether to center the text at the position.
            background (tuple, optional): The background color of the text.
            padding (int, optional): Padding around the text if background is used.
        """
        self.text = text
        self.position = position
        self.color = color
        self.font_size = FONT_SIZES.get(font_size, font_size) if isinstance(font_size, str) else font_size
        self.font_name = font_name
        self.centered = centered
        self.background = background
        self.padding = padding
        self.font = None
        self.surface = None
        self.rect = None
        self._initialize_font()
    
    def _initialize_font(self):
        """Initialize the font and text surface."""
        self.font = pygame.font.SysFont(self.font_name, self.font_size)
        self.update_text(self.text)
    
    def update_text(self, text):
        """
        Update the text content.
        
        Args:
            text (str): The new text content.
        """
        self.text = str(text)
        self.surface = self.font.render(self.text, True, self.color)
        self.rect = self.surface.get_rect()
        
        if self.centered:
            self.rect.center = self.position
        else:
            self.rect.topleft = self.position
    
    def render(self, surface):
        """
        Render the text on the given surface.
        
        Args:
            surface (pygame.Surface): The surface to render the text on.
        """
        if self.background:
            bg_rect = self.rect.copy()
            bg_rect.inflate_ip(self.padding * 2, self.padding * 2)
            pygame.draw.rect(surface, self.background, bg_rect)
        
        surface.blit(self.surface, self.rect)

class DynamicText(Text):
    """
    A text element that can be updated dynamically.
    """
    def __init__(self, text_func, position, color=COLORS['text'], font_size='medium', 
                 font_name='Arial', centered=False, background=None, padding=0, 
                 update_interval=1000):
        """
        Initialize a dynamic text element.
        
        Args:
            text_func (function): A function that returns the text to display.
            position (tuple): The position (x, y) of the text.
            color (tuple, optional): The color of the text.
            font_size (str or int, optional): The size of the font ('small', 'medium', 'large' or direct size).
            font_name (str, optional): The name of the font.
            centered (bool, optional): Whether to center the text at the position.
            background (tuple, optional): The background color of the text.
            padding (int, optional): Padding around the text if background is used.
            update_interval (int, optional): The interval in milliseconds between text updates.
        """
        self.text_func = text_func
        self.last_update = 0
        self.update_interval = update_interval
        super().__init__(text_func(), position, color, font_size, font_name, centered, background, padding)
    
    def update(self, dt_or_mouse_pos):
        """
        Update the text content based on the update interval.
        
        Args:
            dt_or_mouse_pos: Either the time elapsed since the last update in milliseconds,
                            or the mouse position (which we ignore for DynamicText).
        """
        # If dt_or_mouse_pos is a tuple, it's mouse position, which we ignore
        # If it's a number, it's the time delta
        if isinstance(dt_or_mouse_pos, (int, float)):
            dt = dt_or_mouse_pos
            self.last_update += dt
            if self.last_update >= self.update_interval:
                self.update_text(self.text_func())
                self.last_update = 0

def draw_text(surface, text, position, color=COLORS['text'], font_size='medium', 
              font_name='Arial', centered=False, background=None, padding=0):
    """
    Draw text on a surface.
    
    Args:
        surface (pygame.Surface): The surface to draw on.
        text (str): The text to draw.
        position (tuple): The position (x, y) to draw at.
        color (tuple, optional): The color of the text.
        font_size (str or int, optional): The size of the font ('small', 'medium', 'large' or direct size).
        font_name (str, optional): The name of the font.
        centered (bool, optional): Whether to center the text at the position.
        background (tuple, optional): The background color of the text.
        padding (int, optional): Padding around the text if background is used.
    
    Returns:
        pygame.Rect: The rectangle containing the drawn text.
    """
    text_obj = Text(text, position, color, font_size, font_name, centered, background, padding)
    text_obj.render(surface)
    return text_obj.rect