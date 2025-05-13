"""
Player model for the clicker game.
"""

class Player:
    """
    Represents the player in the clicker game.
    Manages currency, click power, and owned upgrades.
    """
    def __init__(self):
        """Initialize a new player."""
        self.currency = 0
        self.click_power = 1
        self.owned_upgrades = {}  # Dictionary of upgrade_id -> level
        self.auto_click_power = 0  # Power of automatic clicks per second
    
    def click(self):
        """
        Process a player click.
        
        Returns:
            int: The amount of currency gained from the click.
        """
        gained = self.click_power
        self.currency += gained
        return gained
    
    def auto_click(self, dt):
        """
        Process automatic clicks based on time elapsed.
        
        Args:
            dt (float): Time elapsed in seconds since the last update.
            
        Returns:
            int: The amount of currency gained from auto clicks.
        """
        if self.auto_click_power <= 0:
            return 0
        
        # Calculate currency gained from auto clicks
        gained = int(self.auto_click_power * dt)
        
        # Ensure at least 1 currency is gained if auto_click_power > 0
        if self.auto_click_power > 0 and gained == 0:
            gained = 1
        
        self.currency += gained
        return gained
    
    def purchase_upgrade(self, upgrade):
        """
        Purchase an upgrade.
        
        Args:
            upgrade (Upgrade): The upgrade to purchase.
            
        Returns:
            bool: True if the purchase was successful, False otherwise.
        """
        if not self.can_afford(upgrade):
            return False
        
        # Deduct the cost
        self.currency -= upgrade.get_cost()
        
        # Update owned upgrades
        upgrade_id = upgrade.id
        if upgrade_id in self.owned_upgrades:
            self.owned_upgrades[upgrade_id] += 1
        else:
            self.owned_upgrades[upgrade_id] = 1
        
        # Apply the upgrade effect
        upgrade.apply_effect(self)
        
        return True
    
    def can_afford(self, upgrade):
        """
        Check if the player can afford an upgrade.
        
        Args:
            upgrade (Upgrade): The upgrade to check.
            
        Returns:
            bool: True if the player can afford the upgrade, False otherwise.
        """
        return self.currency >= upgrade.get_cost()
    
    def get_upgrade_level(self, upgrade_id):
        """
        Get the level of an owned upgrade.
        
        Args:
            upgrade_id (str): The ID of the upgrade.
            
        Returns:
            int: The level of the upgrade, or 0 if not owned.
        """
        return self.owned_upgrades.get(upgrade_id, 0)
    
    def to_dict(self):
        """
        Convert the player data to a dictionary for saving.
        
        Returns:
            dict: The player data as a dictionary.
        """
        return {
            'currency': self.currency,
            'click_power': self.click_power,
            'auto_click_power': self.auto_click_power,
            'owned_upgrades': self.owned_upgrades
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        Create a player from saved data.
        
        Args:
            data (dict): The saved player data.
            
        Returns:
            Player: A new player with the saved data.
        """
        player = cls()
        player.currency = data.get('currency', 0)
        player.click_power = data.get('click_power', 1)
        player.auto_click_power = data.get('auto_click_power', 0)
        player.owned_upgrades = data.get('owned_upgrades', {})
        return player