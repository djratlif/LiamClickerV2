"""
Panel class for UI containers.
"""

import pygame
from src.config import COLORS

class Panel:
    """
    A container for UI elements.
    """
    def __init__(self, rect, bg_color=COLORS['panel'], border_color=COLORS['text'], 
                 border_width=2, border_radius=5, visible=True):
        """
        Initialize a panel.
        
        Args:
            rect (pygame.Rect): The rectangle defining the panel's position and size.
            bg_color (tuple, optional): The background color of the panel.
            border_color (tuple, optional): The color of the panel border.
            border_width (int, optional): The width of the panel border.
            border_radius (int, optional): The radius of the panel corners.
            visible (bool, optional): Whether the panel is visible.
        """
        self.rect = pygame.Rect(rect)
        self.bg_color = bg_color
        self.border_color = border_color
        self.border_width = border_width
        self.border_radius = border_radius
        self.visible = visible
        self.elements = []
    
    def add_element(self, element):
        """
        Add a UI element to the panel.
        
        Args:
            element: The UI element to add.
        """
        self.elements.append(element)
    
    def update(self, mouse_pos):
        """
        Update the panel and its elements.
        
        Args:
            mouse_pos (tuple): The current mouse position (x, y).
        """
        if not self.visible:
            return
        
        # Adjust mouse position for elements within the panel
        relative_pos = (mouse_pos[0] - self.rect.x, mouse_pos[1] - self.rect.y)
        
        # Update all elements
        for element in self.elements:
            if hasattr(element, 'update'):
                # If the element is within the panel, update it with the relative mouse position
                if self.rect.collidepoint(mouse_pos):
                    element.update(relative_pos)
                else:
                    # Mouse is outside the panel, so no element is hovered
                    element.update((-1, -1))
    
    def render(self, surface):
        """
        Render the panel and its elements on the given surface.
        
        Args:
            surface (pygame.Surface): The surface to render the panel on.
        """
        if not self.visible:
            return
        
        # Draw panel background
        pygame.draw.rect(surface, self.bg_color, self.rect, border_radius=self.border_radius)
        
        # Draw panel border
        if self.border_width > 0:
            pygame.draw.rect(surface, self.border_color, self.rect, 
                            width=self.border_width, border_radius=self.border_radius)
        
        # Create a subsurface for the panel content
        # We need to ensure the subsurface is within the bounds of the main surface
        panel_surface = surface.subsurface(self.rect)
        
        # Render all elements on the panel surface
        for element in self.elements:
            if hasattr(element, 'render'):
                element.render(panel_surface)
    
    def handle_event(self, event):
        """
        Handle pygame events for the panel and its elements.
        
        Args:
            event (pygame.event.Event): The event to handle.
            
        Returns:
            bool: True if an element handled the event, False otherwise.
        """
        if not self.visible:
            return False
        
        # Only process mouse events if they are within the panel
        if event.type in (pygame.MOUSEBUTTONDOWN, pygame.MOUSEBUTTONUP, pygame.MOUSEMOTION):
            if not self.rect.collidepoint(event.pos):
                return False
        
        # Handle events for all elements
        for element in self.elements:
            if hasattr(element, 'handle_event'):
                if element.handle_event(event):
                    return True
        
        return False
    
    def set_visible(self, visible):
        """
        Set whether the panel is visible.
        
        Args:
            visible (bool): Whether the panel should be visible.
        """
        self.visible = visible