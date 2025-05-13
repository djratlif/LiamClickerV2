"""
Currency management for the clicker game.
"""

import math

class Currency:
    """
    Utility class for currency formatting and calculations.
    """
    
    @staticmethod
    def format(amount, abbreviate=True):
        """
        Format a currency amount for display.
        
        Args:
            amount (int): The amount to format.
            abbreviate (bool, optional): Whether to abbreviate large numbers.
            
        Returns:
            str: The formatted currency amount.
        """
        if not abbreviate or amount < 1000:
            return f"{amount:,}"
        
        # Abbreviate large numbers
        suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']
        suffix_index = 0
        
        while amount >= 1000 and suffix_index < len(suffixes) - 1:
            amount /= 1000
            suffix_index += 1
        
        # Format with 1 decimal place if not a whole number
        if amount == int(amount):
            return f"{int(amount)}{suffixes[suffix_index]}"
        else:
            return f"{amount:.1f}{suffixes[suffix_index]}"
    
    @staticmethod
    def calculate_time_to_amount(current_amount, target_amount, income_per_second):
        """
        Calculate the time needed to reach a target amount.
        
        Args:
            current_amount (int): The current amount of currency.
            target_amount (int): The target amount to reach.
            income_per_second (float): The income per second.
            
        Returns:
            float: The time in seconds needed to reach the target amount,
                  or float('inf') if income_per_second is 0.
        """
        if income_per_second <= 0:
            return float('inf')
        
        needed_amount = target_amount - current_amount
        if needed_amount <= 0:
            return 0
        
        return needed_amount / income_per_second
    
    @staticmethod
    def format_time(seconds):
        """
        Format a time duration in seconds for display.
        
        Args:
            seconds (float): The time in seconds.
            
        Returns:
            str: The formatted time duration.
        """
        if seconds == float('inf'):
            return "∞"
        
        if seconds < 60:
            return f"{seconds:.1f}s"
        
        minutes = seconds / 60
        if minutes < 60:
            return f"{minutes:.1f}m"
        
        hours = minutes / 60
        if hours < 24:
            return f"{hours:.1f}h"
        
        days = hours / 24
        return f"{days:.1f}d"