/**
 * Liam Clicker V2 - Browser Version
 * Converted from Python/Pygame to JavaScript
 */

// Game configuration
const CONFIG = {
    // Screen settings
    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 600,
    TITLE: "Liam Clicker V2",
    
    // Colors
    COLORS: {
        background: 'rgb(240, 240, 240)',
        text: 'rgb(0, 0, 0)',
        button: 'rgb(200, 200, 200)',
        buttonHover: 'rgb(180, 180, 180)',
        panel: 'rgb(220, 220, 220)',
        highlight: 'rgb(100, 149, 237)',  // Cornflower blue
        positive: 'rgb(50, 205, 50)',     // Lime green
        negative: 'rgb(220, 20, 60)',     // Crimson
    },
    
    // Game settings
    CLICK_BASE_VALUE: 1,
    CURRENCY_NAME: "Points",
    
    // Upgrade definitions
    UPGRADES: [
        {
            id: 'click_power',
            name: 'Click Power',
            description: 'Increases the value of each click',
            baseCost: 10,
            costMultiplier: 1.5,
            effectValue: 1,
            maxLevel: null,  // No maximum level
        },
        {
            id: 'auto_clicker',
            name: 'Auto Clicker',
            description: 'Automatically clicks once per second',
            baseCost: 50,
            costMultiplier: 1.8,
            effectValue: 1,
            maxLevel: null,  // No maximum level
        },
        {
            id: 'click_multiplier',
            name: 'Click Multiplier',
            description: 'Multiplies the value of each click',
            baseCost: 100,
            costMultiplier: 2.0,
            effectValue: 2,
            maxLevel: 5,  // Maximum of 5 levels
        },
    ]
};

// Player class
class Player {
    constructor() {
        this.currency = 0;
        this.clickPower = 1;
        this.ownedUpgrades = {};  // Dictionary of upgrade_id -> level
        this.autoClickPower = 0;  // Power of automatic clicks per second
    }
    
    click() {
        const gained = this.clickPower;
        this.currency += gained;
        return gained;
    }
    
    autoClick(dt) {
        if (this.autoClickPower <= 0) {
            return 0;
        }
        
        // Calculate currency gained from auto clicks
        let gained = Math.floor(this.autoClickPower * dt);
        
        // Ensure at least 1 currency is gained if autoClickPower > 0
        if (this.autoClickPower > 0 && gained === 0) {
            gained = 1;
        }
        
        this.currency += gained;
        return gained;
    }
    
    purchaseUpgrade(upgrade) {
        if (!this.canAfford(upgrade)) {
            return false;
        }
        
        // Deduct the cost
        this.currency -= upgrade.getCost(this.getUpgradeLevel(upgrade.id));
        
        // Update owned upgrades
        const upgradeId = upgrade.id;
        if (upgradeId in this.ownedUpgrades) {
            this.ownedUpgrades[upgradeId] += 1;
        } else {
            this.ownedUpgrades[upgradeId] = 1;
        }
        
        // Apply the upgrade effect
        upgrade.applyEffect(this);
        
        return true;
    }
    
    canAfford(upgrade) {
        return this.currency >= upgrade.getCost(this.getUpgradeLevel(upgrade.id));
    }
    
    getUpgradeLevel(upgradeId) {
        return this.ownedUpgrades[upgradeId] || 0;
    }
    
    toJSON() {
        return {
            currency: this.currency,
            clickPower: this.clickPower,
            autoClickPower: this.autoClickPower,
            ownedUpgrades: this.ownedUpgrades
        };
    }
    
    static fromJSON(data) {
        const player = new Player();
        player.currency = data.currency || 0;
        player.clickPower = data.clickPower || 1;
        player.autoClickPower = data.autoClickPower || 0;
        player.ownedUpgrades = data.ownedUpgrades || {};
        return player;
    }
}

// Upgrade class
class Upgrade {
    constructor(upgradeId, name, description, baseCost, costMultiplier, effectValue, maxLevel = null) {
        this.id = upgradeId;
        this.name = name;
        this.description = description;
        this.baseCost = baseCost;
        this.costMultiplier = costMultiplier;
        this.effectValue = effectValue;
        this.maxLevel = maxLevel;
    }
    
    getCost(level = 0) {
        // Formula: baseCost * (costMultiplier ^ level)
        return Math.floor(this.baseCost * (this.costMultiplier ** level));
    }
    
    applyEffect(player) {
        const level = player.getUpgradeLevel(this.id);
        
        if (this.id === 'click_power') {
            // Increase click power
            player.clickPower += this.effectValue;
        } else if (this.id === 'auto_clicker') {
            // Increase auto click power
            player.autoClickPower += this.effectValue;
        } else if (this.id === 'click_multiplier') {
            // Multiply click power
            // Only apply the multiplier once, not cumulatively
            if (level === 1) {
                player.clickPower *= this.effectValue;
            }
        }
    }
    
    isAvailable(player) {
        const level = player.getUpgradeLevel(this.id);
        
        // Check if the upgrade has reached its maximum level
        if (this.maxLevel !== null && level >= this.maxLevel) {
            return false;
        }
        
        return true;
    }
    
    getNextLevelDescription(player) {
        const level = player.getUpgradeLevel(this.id);
        
        if (this.id === 'click_power') {
            return `Increases click power by ${this.effectValue}`;
        } else if (this.id === 'auto_clicker') {
            return `Generates ${this.effectValue} points per second`;
        } else if (this.id === 'click_multiplier') {
            if (level === 0) {
                return `Multiplies click power by ${this.effectValue}`;
            } else {
                return `Already at maximum effectiveness`;
            }
        }
        
        return "Unknown effect";
    }
}

// Game class
class Game {
    constructor() {
        this.player = new Player();
        this.upgrades = {};
        this.particles = [];
        this.lastTime = Date.now();
        this.running = true;
        
        // Initialize the game
        this.initialize();
    }
    
    initialize() {
        // Create upgrades from config
        for (const upgradeConfig of CONFIG.UPGRADES) {
            const upgrade = new Upgrade(
                upgradeConfig.id,
                upgradeConfig.name,
                upgradeConfig.description,
                upgradeConfig.baseCost,
                upgradeConfig.costMultiplier,
                upgradeConfig.effectValue,
                upgradeConfig.maxLevel
            );
            this.upgrades[upgrade.id] = upgrade;
        }
        
        // Set up DOM elements
        this.clickArea = document.getElementById('click-area');
        this.currencyDisplay = document.getElementById('currency-display');
        this.clickPowerDisplay = document.getElementById('click-power-display');
        this.autoClickDisplay = document.getElementById('auto-click-display');
        this.upgradesContainer = document.getElementById('upgrades-container');
        this.particlesContainer = document.getElementById('particles-container');
        
        // Set up event listeners
        this.clickArea.addEventListener('click', (e) => this.handleClick(e));
        
        // Create upgrade buttons
        this.createUpgradeButtons();
        
        // Load saved game if available
        this.loadGame();
        
        // Start the game loop
        this.gameLoop();
    }
    
    createUpgradeButtons() {
        this.upgradesContainer.innerHTML = '';
        
        for (const upgradeId in this.upgrades) {
            const upgrade = this.upgrades[upgradeId];
            const level = this.player.getUpgradeLevel(upgradeId);
            const cost = upgrade.getCost(level);
            
            const upgradeButton = document.createElement('div');
            upgradeButton.className = 'upgrade-button';
            upgradeButton.dataset.upgradeId = upgradeId;
            
            const upgradeName = document.createElement('div');
            upgradeName.className = 'upgrade-name';
            upgradeName.textContent = `${upgrade.name}${level > 0 ? ` (Lvl ${level})` : ''}`;
            
            const upgradeCost = document.createElement('div');
            upgradeCost.className = 'upgrade-cost';
            upgradeCost.textContent = `Cost: ${cost}`;
            
            upgradeButton.appendChild(upgradeName);
            upgradeButton.appendChild(upgradeCost);
            
            upgradeButton.addEventListener('click', () => this.purchaseUpgrade(upgradeId));
            
            this.upgradesContainer.appendChild(upgradeButton);
        }
    }
    
    updateUpgradeButtons() {
        const upgradeButtons = document.querySelectorAll('.upgrade-button');
        
        upgradeButtons.forEach(button => {
            const upgradeId = button.dataset.upgradeId;
            const upgrade = this.upgrades[upgradeId];
            const level = this.player.getUpgradeLevel(upgradeId);
            const cost = upgrade.getCost(level);
            
            const nameElement = button.querySelector('.upgrade-name');
            const costElement = button.querySelector('.upgrade-cost');
            
            nameElement.textContent = `${upgrade.name}${level > 0 ? ` (Lvl ${level})` : ''}`;
            costElement.textContent = `Cost: ${cost}`;
            
            if (!upgrade.isAvailable(this.player) || !this.player.canAfford(upgrade)) {
                button.classList.add('unavailable');
            } else {
                button.classList.remove('unavailable');
            }
        });
    }
    
    handleClick(e) {
        // Process the click
        const gained = this.player.click();
        
        // Create particles for visual feedback
        for (let i = 0; i < 5; i++) {
            this.createParticle(e.clientX, e.clientY);
        }
        
        // Create a text particle showing the gained amount
        this.createTextParticle(e.clientX, e.clientY, `+${gained}`);
        
        // Update displays
        this.updateDisplays();
    }
    
    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 3 and 8
        const size = Math.floor(Math.random() * 6) + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Position at click location
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Set color
        particle.style.backgroundColor = CONFIG.COLORS.highlight;
        
        // Add to container
        this.particlesContainer.appendChild(particle);
        
        // Add to particles array
        this.particles.push({
            element: particle,
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            lifetime: Math.random() + 0.5, // 0.5 to 1.5 seconds
            creationTime: Date.now()
        });
    }
    
    createTextParticle(x, y, text) {
        const particle = document.createElement('div');
        particle.className = 'text-particle';
        particle.textContent = text;
        
        // Position at click location
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Set color
        particle.style.color = CONFIG.COLORS.positive;
        
        // Add to container
        this.particlesContainer.appendChild(particle);
        
        // Add to particles array
        this.particles.push({
            element: particle,
            x: x,
            y: y,
            vx: 0,
            vy: -50, // Move upward
            lifetime: 1.0,
            creationTime: Date.now(),
            isText: true
        });
    }
    
    updateParticles(dt) {
        const currentTime = Date.now();
        const particlesToRemove = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Check if particle lifetime is over
            const age = (currentTime - particle.creationTime) / 1000;
            if (age >= particle.lifetime) {
                particlesToRemove.push(i);
                continue;
            }
            
            // Update position
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            
            // Apply gravity to non-text particles
            if (!particle.isText) {
                particle.vy += 200 * dt; // Gravity
            }
            
            // Update element position
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            
            // Fade out based on lifetime
            const opacity = 1 - (age / particle.lifetime);
            particle.element.style.opacity = opacity;
        }
        
        // Remove expired particles (in reverse order to avoid index issues)
        for (let i = particlesToRemove.length - 1; i >= 0; i--) {
            const index = particlesToRemove[i];
            const particle = this.particles[index];
            
            // Remove from DOM
            particle.element.remove();
            
            // Remove from array
            this.particles.splice(index, 1);
        }
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        
        if (!upgrade) {
            return false;
        }
        
        // Check if the player can afford the upgrade
        if (!this.player.canAfford(upgrade)) {
            return false;
        }
        
        // Check if the upgrade is available
        if (!upgrade.isAvailable(this.player)) {
            return false;
        }
        
        // Purchase the upgrade
        const success = this.player.purchaseUpgrade(upgrade);
        
        if (success) {
            // Update displays
            this.updateDisplays();
            this.updateUpgradeButtons();
            
            // Save the game
            this.saveGame();
        }
        
        return success;
    }
    
    updateDisplays() {
        // Update currency display
        this.currencyDisplay.textContent = `${this.formatCurrency(this.player.currency)} ${CONFIG.TITLE} Points`;
        
        // Update click power display
        this.clickPowerDisplay.textContent = `Click Power: ${this.player.clickPower}`;
        
        // Update auto click display
        this.autoClickDisplay.textContent = `Auto Click: ${this.player.autoClickPower}/s`;
    }
    
    formatCurrency(amount) {
        if (amount >= 1e12) {
            return (amount / 1e12).toFixed(1) + 'T';
        } else if (amount >= 1e9) {
            return (amount / 1e9).toFixed(1) + 'B';
        } else if (amount >= 1e6) {
            return (amount / 1e6).toFixed(1) + 'M';
        } else if (amount >= 1e3) {
            return (amount / 1e3).toFixed(1) + 'K';
        } else {
            return amount.toString();
        }
    }
    
    saveGame() {
        const saveData = {
            player: this.player.toJSON(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('liamClickerSave', JSON.stringify(saveData));
    }
    
    loadGame() {
        // Commented out to make the game restart every time the page is loaded
        // const saveData = localStorage.getItem('liamClickerSave');
        //
        // if (saveData) {
        //     try {
        //         const data = JSON.parse(saveData);
        //         this.player = Player.fromJSON(data.player);
        //
        //         // Update displays
        //         this.updateDisplays();
        //         this.updateUpgradeButtons();
        //     } catch (e) {
        //         console.error('Error loading save data:', e);
        //     }
        // }
        
        // Always start with a fresh game
        this.player = new Player();
        this.updateDisplays();
        this.updateUpgradeButtons();
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = Date.now();
        const dt = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Process auto clicks
        if (this.player.autoClickPower > 0) {
            this.player.autoClick(dt);
            this.updateDisplays();
        }
        
        // Update particles
        this.updateParticles(dt);
        
        // Save game every 30 seconds
        if (currentTime % 30000 < 100) {
            this.saveGame();
        }
        
        // Request next frame
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});