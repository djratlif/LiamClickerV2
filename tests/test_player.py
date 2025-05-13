"""
Tests for the Player model.
"""

import unittest
from src.models.player import Player
from src.models.upgrade import Upgrade

class TestPlayer(unittest.TestCase):
    """Test cases for the Player class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.player = Player()
        
        # Create test upgrades
        self.click_power_upgrade = Upgrade(
            upgrade_id='click_power',
            name='Click Power',
            description='Increases the value of each click',
            base_cost=10,
            cost_multiplier=1.5,
            effect_value=1
        )
        
        self.auto_clicker_upgrade = Upgrade(
            upgrade_id='auto_clicker',
            name='Auto Clicker',
            description='Automatically clicks once per second',
            base_cost=50,
            cost_multiplier=1.8,
            effect_value=1
        )
    
    def test_initial_state(self):
        """Test the initial state of a new player."""
        self.assertEqual(self.player.currency, 0)
        self.assertEqual(self.player.click_power, 1)
        self.assertEqual(self.player.auto_click_power, 0)
        self.assertEqual(self.player.owned_upgrades, {})
    
    def test_click(self):
        """Test the click method."""
        # Initial click with default click power
        gained = self.player.click()
        self.assertEqual(gained, 1)
        self.assertEqual(self.player.currency, 1)
        
        # Increase click power and test again
        self.player.click_power = 5
        gained = self.player.click()
        self.assertEqual(gained, 5)
        self.assertEqual(self.player.currency, 6)
    
    def test_auto_click(self):
        """Test the auto_click method."""
        # No auto click power initially
        gained = self.player.auto_click(1.0)
        self.assertEqual(gained, 0)
        self.assertEqual(self.player.currency, 0)
        
        # Set auto click power and test
        self.player.auto_click_power = 2
        gained = self.player.auto_click(1.0)
        self.assertEqual(gained, 2)
        self.assertEqual(self.player.currency, 2)
        
        # Test with partial time
        gained = self.player.auto_click(0.5)
        self.assertEqual(gained, 1)
        self.assertEqual(self.player.currency, 3)
    
    def test_purchase_upgrade(self):
        """Test purchasing upgrades."""
        # Cannot afford upgrade initially
        self.assertFalse(self.player.can_afford(self.click_power_upgrade))
        self.assertFalse(self.player.purchase_upgrade(self.click_power_upgrade))
        
        # Give player enough currency and try again
        self.player.currency = 15
        self.assertTrue(self.player.can_afford(self.click_power_upgrade))
        self.assertTrue(self.player.purchase_upgrade(self.click_power_upgrade))
        
        # Check effects
        self.assertEqual(self.player.currency, 5)  # 15 - 10
        self.assertEqual(self.player.click_power, 2)  # 1 + 1
        self.assertEqual(self.player.owned_upgrades, {'click_power': 1})
        
        # Purchase auto clicker
        self.player.currency = 50
        self.assertTrue(self.player.purchase_upgrade(self.auto_clicker_upgrade))
        self.assertEqual(self.player.currency, 0)  # 50 - 50
        self.assertEqual(self.player.auto_click_power, 1)
        self.assertEqual(self.player.owned_upgrades, {'click_power': 1, 'auto_clicker': 1})
    
    def test_get_upgrade_level(self):
        """Test getting upgrade levels."""
        self.assertEqual(self.player.get_upgrade_level('click_power'), 0)
        
        # Purchase upgrade
        self.player.currency = 10
        self.player.purchase_upgrade(self.click_power_upgrade)
        self.assertEqual(self.player.get_upgrade_level('click_power'), 1)
        
        # Purchase again
        self.player.currency = 15
        self.player.purchase_upgrade(self.click_power_upgrade)
        self.assertEqual(self.player.get_upgrade_level('click_power'), 2)
    
    def test_to_dict_and_from_dict(self):
        """Test converting player to and from dictionary."""
        # Set up player state
        self.player.currency = 100
        self.player.click_power = 3
        self.player.auto_click_power = 2
        self.player.owned_upgrades = {'click_power': 2, 'auto_clicker': 1}
        
        # Convert to dict
        player_dict = self.player.to_dict()
        
        # Create new player from dict
        new_player = Player.from_dict(player_dict)
        
        # Check values
        self.assertEqual(new_player.currency, 100)
        self.assertEqual(new_player.click_power, 3)
        self.assertEqual(new_player.auto_click_power, 2)
        self.assertEqual(new_player.owned_upgrades, {'click_power': 2, 'auto_clicker': 1})

if __name__ == '__main__':
    unittest.main()