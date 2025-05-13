"""
Upgrade system for the clicker game.
"""

import math
from src.config import UPGRADES

class Upgrade:
    """
    Represents an upgrade that can be purchased to improve gameplay.
    """
    def __init__(self, upgrade_id, name, description, base_cost, cost_multiplier, effect_value, max_level=None):
        """
        Initialize an upgrade.
        
        Args:
            upgrade_id (str): The unique identifier for the upgrade.
            name (str): The display name of the upgrade.
            description (str): The description of what the upgrade does.
            base_cost (int): The base cost of the upgrade.
            cost_multiplier (float): The multiplier for the cost as the level increases.
            effect_value (float): The value of the effect applied by the upgrade.
            max_level (int, optional): The maximum level of the upgrade, or None for unlimited.
        """
        self.id = upgrade_id
        self.name = name
        self.description = description
        self.base_cost = base_cost
        self.cost_multiplier = cost_multiplier
        self.effect_value = effect_value
        self.max_level = max_level
    
    def get_cost(self, level=None):
        """
        Calculate the cost of the upgrade at a specific level.
        
        Args:
            level (int, optional): The level to calculate the cost for. 
                                  If None, uses the current level.
                                  
        Returns:
            int: The cost of the upgrade.
        """
        if level is None:
            level = 0
        
        # Formula: base_cost * (cost_multiplier ^ level)
        return int(self.base_cost * (self.cost_multiplier ** level))
    
    def apply_effect(self, player):
        """
        Apply the upgrade effect to the player.
        
        Args:
            player (Player): The player to apply the effect to.
        """
        level = player.get_upgrade_level(self.id)
        
        if self.id == 'click_power':
            # Increase click power
            player.click_power += self.effect_value
        elif self.id == 'auto_clicker':
            # Increase auto click power
            player.auto_click_power += self.effect_value
        elif self.id == 'click_multiplier':
            # Multiply click power
            # Only apply the multiplier once, not cumulatively
            if level == 1:
                player.click_power *= self.effect_value
    
    def is_available(self, player):
        """
        Check if the upgrade is available to the player.
        
        Args:
            player (Player): The player to check availability for.
            
        Returns:
            bool: True if the upgrade is available, False otherwise.
        """
        level = player.get_upgrade_level(self.id)
        
        # Check if the upgrade has reached its maximum level
        if self.max_level is not None and level >= self.max_level:
            return False
        
        # Additional availability checks can be added here
        
        return True
    
    def get_next_level_description(self, player):
        """
        Get a description of the effect of the next level of the upgrade.
        
        Args:
            player (Player): The player to get the description for.
            
        Returns:
            str: A description of the next level effect.
        """
        level = player.get_upgrade_level(self.id)
        
        if self.id == 'click_power':
            return f"Increases click power by {self.effect_value}"
        elif self.id == 'auto_clicker':
            return f"Generates {self.effect_value} Mullet Bucks per second"
        elif self.id == 'click_multiplier':
            if level == 0:
                return f"Multiplies click power by {self.effect_value}"
            else:
                return f"Already at maximum effectiveness"
        
        return "Unknown effect"


def create_upgrades_from_config():
    """
    Create upgrade objects from the configuration.
    
    Returns:
        dict: A dictionary of upgrade_id -> Upgrade objects.
    """
    upgrades = {}
    
    for upgrade_config in UPGRADES:
        upgrade = Upgrade(
            upgrade_id=upgrade_config['id'],
            name=upgrade_config['name'],
            description=upgrade_config['description'],
            base_cost=upgrade_config['base_cost'],
            cost_multiplier=upgrade_config['cost_multiplier'],
            effect_value=upgrade_config['effect_value'],
            max_level=upgrade_config.get('max_level')
        )
        upgrades[upgrade.id] = upgrade
    
    return upgrades