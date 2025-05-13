"""
Helper functions for the clicker game.
"""

import os
import pygame
import random
import time
import math

def load_image(filename, scale=None, convert_alpha=True):
    """
    Load an image from the assets directory.
    
    Args:
        filename (str): The filename of the image.
        scale (tuple, optional): The scale to resize the image to (width, height).
        convert_alpha (bool, optional): Whether to convert the image for alpha blending.
        
    Returns:
        pygame.Surface: The loaded image.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    image_path = os.path.join(base_path, 'assets', 'images', filename)
    
    try:
        if convert_alpha:
            image = pygame.image.load(image_path).convert_alpha()
        else:
            image = pygame.image.load(image_path).convert()
        
        if scale:
            image = pygame.transform.scale(image, scale)
        
        return image
    except pygame.error as e:
        print(f"Error loading image {filename}: {e}")
        # Create a placeholder surface
        surface = pygame.Surface((50, 50))
        surface.fill((255, 0, 255))  # Magenta for missing textures
        return surface

def load_sound(filename, volume=1.0):
    """
    Load a sound from the assets directory.
    
    Args:
        filename (str): The filename of the sound.
        volume (float, optional): The volume of the sound (0.0 to 1.0).
        
    Returns:
        pygame.mixer.Sound: The loaded sound.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sound_path = os.path.join(base_path, 'assets', 'sounds', filename)
    
    try:
        sound = pygame.mixer.Sound(sound_path)
        sound.set_volume(volume)
        return sound
    except pygame.error as e:
        print(f"Error loading sound {filename}: {e}")
        return None

def load_font(filename, size):
    """
    Load a font from the assets directory.
    
    Args:
        filename (str): The filename of the font.
        size (int): The size of the font.
        
    Returns:
        pygame.font.Font: The loaded font.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    font_path = os.path.join(base_path, 'assets', 'fonts', filename)
    
    try:
        return pygame.font.Font(font_path, size)
    except pygame.error as e:
        print(f"Error loading font {filename}: {e}")
        return pygame.font.SysFont('Arial', size)

def create_particle(position, color, velocity=None, size=5, lifetime=1.0):
    """
    Create a particle for visual effects.
    
    Args:
        position (tuple): The position (x, y) of the particle.
        color (tuple): The color of the particle.
        velocity (tuple, optional): The velocity (dx, dy) of the particle.
        size (int, optional): The size of the particle.
        lifetime (float, optional): The lifetime of the particle in seconds.
        
    Returns:
        dict: A particle object.
    """
    if velocity is None:
        angle = random.uniform(0, 360)
        speed = random.uniform(50, 150)
        velocity = (
            speed * math.cos(math.radians(angle)),
            speed * math.sin(math.radians(angle))
        )
    
    return {
        'position': list(position),
        'velocity': list(velocity),
        'color': color,
        'size': size,
        'lifetime': lifetime,
        'creation_time': time.time()
    }

def update_particle(particle, dt):
    """
    Update a particle's position and lifetime.
    
    Args:
        particle (dict): The particle to update.
        dt (float): The time elapsed since the last update in seconds.
        
    Returns:
        bool: True if the particle is still alive, False otherwise.
    """
    # Update position
    particle['position'][0] += particle['velocity'][0] * dt
    particle['position'][1] += particle['velocity'][1] * dt
    
    # Apply gravity
    particle['velocity'][1] += 200 * dt  # Gravity
    
    # Reduce size over time
    elapsed = time.time() - particle['creation_time']
    remaining = 1.0 - (elapsed / particle['lifetime'])
    
    if remaining <= 0:
        return False
    
    # Fade out
    particle['size'] = max(1, int(particle['size'] * remaining))
    
    return True

def render_particle(surface, particle):
    """
    Render a particle on the surface.
    
    Args:
        surface (pygame.Surface): The surface to render on.
        particle (dict): The particle to render.
    """
    # Calculate alpha based on remaining lifetime
    elapsed = time.time() - particle['creation_time']
    remaining = 1.0 - (elapsed / particle['lifetime'])
    alpha = int(255 * remaining)
    
    # Create a surface for the particle
    particle_surface = pygame.Surface((particle['size'] * 2, particle['size'] * 2), pygame.SRCALPHA)
    
    # Draw the particle
    pygame.draw.circle(
        particle_surface,
        (*particle['color'], alpha),
        (particle['size'], particle['size']),
        particle['size']
    )
    
    # Blit the particle surface onto the main surface
    surface.blit(
        particle_surface,
        (particle['position'][0] - particle['size'], particle['position'][1] - particle['size'])
    )