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
        levi: 'rgb(65, 105, 225)',        // Royal Blue
        win: 'rgb(255, 215, 0)',          // Gold
    },
    
    // Game settings
    CLICK_BASE_VALUE: 1,
    CURRENCY_NAME: "Mullet Bucks",
    LEVI_VALUE: 150,
    LEVI_SPAWN_MIN_TIME: 5,    // Minimum seconds between Levi spawns
    LEVI_SPAWN_MAX_TIME: 15,   // Maximum seconds between Levi spawns
    LEVI_SPEED_MIN: 100,       // Minimum Levi speed (pixels per second)
    LEVI_SPEED_MAX: 300,       // Maximum Levi speed (pixels per second)
    WIN_AMOUNT: 2000,          // Amount of currency needed to win the game
    
    // Upgrade definitions
    UPGRADES: [
        {
            id: 'click_power',
            name: 'Click Power',
            description: 'Increases the value of each click',
            baseCost: 2,  // Reduced from 10 for easier testing
            costMultiplier: 7.5,  // Tripled from 2.5 for an extremely steep progression
            effectValue: 1,
            maxLevel: 5,  // Maximum of 5 levels
            category: 'Powers'
        },
        {
            id: 'auto_clicker',
            name: 'Auto Clicker',
            description: 'Automatically clicks once per second',
            baseCost: 5,  // Reduced from 50 for easier testing
            costMultiplier: 5.4,  // Tripled from 1.8 for an extremely steep progression
            effectValue: 1,
            maxLevel: 5,  // Maximum of 5 levels
            category: 'Powers'
        },
        {
            id: 'click_multiplier',
            name: 'Click Multiplier',
            description: 'Multiplies the value of each click',
            baseCost: 100,
            costMultiplier: 2.0,
            effectValue: 2,
            maxLevel: 5,  // Maximum of 5 levels
            category: 'Powers'
        },
        {
            id: 'stage_2_unlock',
            name: 'Release the LEVI!',
            description: 'Unlock Stage 2 with Levi attacks',
            baseCost: 100,
            costMultiplier: 1.0,
            effectValue: 1,
            maxLevel: 1,  // Can only be purchased once
            category: 'Stages'
        },
    ]
};

// Player class
class Player {
    constructor() {
        this.currency = 0;        // Start with 1999 Mullet Bucks (one click to win)
        this.clickPower = 1;
        this.ownedUpgrades = {};  // Dictionary of upgrade_id -> level
        this.autoClickPower = 0;  // Power of automatic clicks per second
        this.stage = 1;           // Current game stage (starts at 1)
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
        
        // For consistent 1 click per second behavior
        // We accumulate time and add points when we reach 1 second
        
        // Calculate currency gained from auto clicks
        // autoClickPower represents clicks per second
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
            ownedUpgrades: this.ownedUpgrades,
            stage: this.stage
        };
    }
    
    static fromJSON(data) {
        const player = new Player();
        player.currency = data.currency || 0;
        player.clickPower = data.clickPower || 1;
        player.autoClickPower = data.autoClickPower || 0;
        player.ownedUpgrades = data.ownedUpgrades || {};
        player.stage = data.stage || 1;
        return player;
    }
}

// Upgrade class
class Upgrade {
    constructor(upgradeId, name, description, baseCost, costMultiplier, effectValue, maxLevel = null, category = null) {
        this.id = upgradeId;
        this.name = name;
        this.description = description;
        this.baseCost = baseCost;
        this.costMultiplier = costMultiplier;
        this.effectValue = effectValue;
        this.maxLevel = maxLevel;
        this.category = category;
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
        } else if (this.id === 'stage_2_unlock') {
            // Unlock Stage 2
            player.stage = 2;
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
            return `Generates ${this.effectValue} Mullet Bucks per second`;
        } else if (this.id === 'click_multiplier') {
            if (level === 0) {
                return `Multiplies click power by ${this.effectValue}`;
            } else {
                return `Already at maximum effectiveness`;
            }
        } else if (this.id === 'stage_2_unlock') {
            return `Unleash Levi worth ${CONFIG.LEVI_VALUE} Mullet Bucks each when clicked`;
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
        this.levis = [];
        this.lastTime = Date.now();
        this.running = true;
        this.autoClickAccumulator = 0; // Time accumulator for auto clicks
        this.leviSpawnTimer = 0; // Timer for Levi spawning
        this.gameStartTime = null; // Will be set on first click
        this.gameTimer = 0; // Track elapsed time in seconds
        this.gameOver = false; // Track if the game is over
        this.timerStarted = false; // Track if timer has started
        this.leaderboard = this.loadLeaderboard(); // Load leaderboard from localStorage
        
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
                upgradeConfig.maxLevel,
                upgradeConfig.category
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
        
        // Create Levi container
        this.leviContainer = document.createElement('div');
        this.leviContainer.id = 'levi-container';
        this.leviContainer.className = 'levi-container';
        document.querySelector('.game-content').appendChild(this.leviContainer);
        
        // Create timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'timer-display';
        this.timerDisplay.className = 'stat';
        this.timerDisplay.textContent = 'Time: 0:00';
        document.querySelector('.side-stats-container').appendChild(this.timerDisplay);
        
        // Create game over screen
        this.createGameOverScreen();
        
        // Create leaderboard
        this.createLeaderboard();
        
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
        
        // Group upgrades by category
        const categories = {};
        
        for (const upgradeId in this.upgrades) {
            const upgrade = this.upgrades[upgradeId];
            const category = upgrade.category || 'Uncategorized';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push(upgradeId);
        }
        
        // Create category sections and add upgrades
        for (const category in categories) {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = `category-header category-${category.toLowerCase()}`;
            categoryHeader.textContent = category;
            this.upgradesContainer.appendChild(categoryHeader);
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = `category-container category-${category.toLowerCase()}-container`;
            this.upgradesContainer.appendChild(categoryContainer);
            
            // Add upgrades to this category
            for (const upgradeId of categories[category]) {
                const upgrade = this.upgrades[upgradeId];
                const level = this.player.getUpgradeLevel(upgradeId);
                const cost = upgrade.getCost(level);
                
                const upgradeButton = document.createElement('div');
                upgradeButton.className = `upgrade-button category-${category.toLowerCase()}`;
                upgradeButton.dataset.upgradeId = upgradeId;
                upgradeButton.dataset.category = category;
                
                const upgradeName = document.createElement('div');
                upgradeName.className = 'upgrade-name';
                upgradeName.textContent = `${upgrade.name}${level > 0 ? ` (Lvl ${level})` : ''}`;
                
                const upgradeCost = document.createElement('div');
                upgradeCost.className = 'upgrade-cost';
                upgradeCost.textContent = `Cost: ${cost}`;
                
                upgradeButton.appendChild(upgradeName);
                upgradeButton.appendChild(upgradeCost);
                
                upgradeButton.addEventListener('click', () => this.purchaseUpgrade(upgradeId));
                
                categoryContainer.appendChild(upgradeButton);
            }
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
            
            // Check if the upgrade has reached max level
            if (upgrade.maxLevel !== null && level >= upgrade.maxLevel) {
                button.classList.add('max-level');
                button.classList.add('unavailable');
                costElement.textContent = 'MAX LEVEL';
            } else {
                button.classList.remove('max-level');
                
                // Check if the upgrade is available and affordable
                if (!upgrade.isAvailable(this.player) || !this.player.canAfford(upgrade)) {
                    button.classList.add('unavailable');
                } else {
                    button.classList.remove('unavailable');
                }
            }
            
            // Ensure category class is applied
            const category = upgrade.category || 'Uncategorized';
            button.classList.add(`category-${category.toLowerCase()}`);
        });
    }
    
    handleClick(e) {
        // Start the timer on first click
        if (!this.timerStarted) {
            this.gameStartTime = Date.now();
            this.timerStarted = true;
        }
        
        // Process the click
        const gained = this.player.click();
        
        // Create particles for visual feedback
        for (let i = 0; i < 5; i++) {
            this.createParticle(e.clientX, e.clientY);
        }
        
        // Create a text particle showing the gained amount
        this.createTextParticle(e.clientX, e.clientY, `+${gained}`);
        
        // Add clicked class for animation
        const clickArea = document.getElementById('click-area');
        clickArea.classList.add('clicked');
        
        // Remove the class after animation completes
        setTimeout(() => {
            clickArea.classList.remove('clicked');
        }, 300);
        
        // Update displays and upgrade buttons
        this.updateDisplays();
        this.updateUpgradeButtons();
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
        this.currencyDisplay.textContent = `${this.formatCurrency(this.player.currency)} ${CONFIG.CURRENCY_NAME}`;
        
        // Update click power display
        this.clickPowerDisplay.textContent = `Click Power: ${this.player.clickPower}`;
        
        // Update auto click display
        this.autoClickDisplay.textContent = `Auto Click: ${this.player.autoClickPower}/s`;
        
        // Update timer display
        if (!this.gameOver) {
            if (this.timerStarted) {
                this.timerDisplay.textContent = `Time: ${this.formatTime(this.gameTimer)}`;
            } else {
                this.timerDisplay.textContent = `Time: 0:00`;
            }
        }
        
        // Update stage display
        const stageText = document.getElementById('stage-display');
        if (!stageText && this.player.stage > 1) {
            const sideStatsContainer = document.querySelector('.side-stats-container');
            const stageDisplay = document.createElement('div');
            stageDisplay.id = 'stage-display';
            stageDisplay.className = 'stat side-stat';
            stageDisplay.textContent = `Stage: ${this.player.stage}`;
            sideStatsContainer.appendChild(stageDisplay);
        } else if (stageText) {
            stageText.textContent = `Stage: ${this.player.stage}`;
        }
    }
    
    formatCurrency(amount) {
        // Always return the exact amount as a string
        return amount.toString();
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
    
    createLevi() {
        // Create Levi element
        const levi = document.createElement('div');
        levi.className = 'levi';
        
        // Create image element
        const leviImg = document.createElement('img');
        leviImg.src = 'assets/images/levi.png';
        leviImg.alt = 'Levi';
        leviImg.className = 'levi-image';
        levi.appendChild(leviImg);
        
        // Randomly determine if Levi comes from left or right
        const fromLeft = Math.random() > 0.5;
        
        // Set initial position
        const startX = fromLeft ? -100 : CONFIG.SCREEN_WIDTH + 100;
        const startY = 100 + Math.random() * 200; // Random height between 100-300px
        
        levi.style.left = `${startX}px`;
        levi.style.top = `${startY}px`;
        
        // Add to container
        this.leviContainer.appendChild(levi);
        
        // Calculate speed (pixels per second)
        const speed = CONFIG.LEVI_SPEED_MIN + Math.random() * (CONFIG.LEVI_SPEED_MAX - CONFIG.LEVI_SPEED_MIN);
        
        // Add to levis array
        this.levis.push({
            element: levi,
            x: startX,
            y: startY,
            speed: speed,
            fromLeft: fromLeft,
            clicked: false
        });
        
        // Add click event listener
        levi.addEventListener('click', (e) => {
            this.handleLeviClick(this.levis[this.levis.length - 1], e);
        });
    }
    
    handleLeviClick(levi, e) {
        if (levi.clicked) return;
        
        // Mark as clicked
        levi.clicked = true;
        
        // Add visual feedback
        levi.element.classList.add('clicked');
        
        // Add currency
        this.player.currency += CONFIG.LEVI_VALUE;
        
        // Create text particle showing the gained amount
        this.createTextParticle(e.clientX, e.clientY, `+${CONFIG.LEVI_VALUE}`);
        
        // Update displays
        this.updateDisplays();
        this.updateUpgradeButtons();
        
        // Remove levi after a short delay
        setTimeout(() => {
            const index = this.levis.indexOf(levi);
            if (index !== -1) {
                levi.element.remove();
                this.levis.splice(index, 1);
            }
        }, 500);
    }
    
    updateLevis(dt) {
        const levisToRemove = [];
        
        for (let i = 0; i < this.levis.length; i++) {
            const levi = this.levis[i];
            
            // Skip if already clicked
            if (levi.clicked) continue;
            
            // Update position
            if (levi.fromLeft) {
                levi.x += levi.speed * dt;
            } else {
                levi.x -= levi.speed * dt;
            }
            
            // Update element position
            levi.element.style.left = `${levi.x}px`;
            
            // Check if levi is off-screen
            if ((levi.fromLeft && levi.x > CONFIG.SCREEN_WIDTH + 100) ||
                (!levi.fromLeft && levi.x < -100)) {
                levisToRemove.push(i);
            }
        }
        
        // Remove off-screen levis (in reverse order to avoid index issues)
        for (let i = levisToRemove.length - 1; i >= 0; i--) {
            const index = levisToRemove[i];
            const levi = this.levis[index];
            
            // Remove from DOM
            levi.element.remove();
            
            // Remove from array
            this.levis.splice(index, 1);
        }
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = Date.now();
        const dt = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Update game timer if game is not over and timer has started
        if (!this.gameOver && this.timerStarted) {
            this.gameTimer = (currentTime - this.gameStartTime) / 1000;
            // Update timer display every frame for continuous updates
            this.timerDisplay.textContent = `Time: ${this.formatTime(this.gameTimer)}`;
        }
        
        // Check for win condition
        if (!this.gameOver && this.player.currency >= CONFIG.WIN_AMOUNT) {
            this.handleWin();
        }
        
        // Process auto clicks with consistent timing
        if (this.player.autoClickPower > 0 && !this.gameOver) {
            // Accumulate time
            this.autoClickAccumulator += dt;
            
            // Check if a full second has passed
            if (this.autoClickAccumulator >= 1.0) {
                // Calculate how many full seconds have passed
                const fullSeconds = Math.floor(this.autoClickAccumulator);
                
                // Process auto clicks for each full second
                for (let i = 0; i < fullSeconds; i++) {
                    // Add exactly autoClickPower Mullet Bucks (1 click per second)
                    this.player.currency += this.player.autoClickPower;
                }
                
                // Subtract the processed time from the accumulator
                this.autoClickAccumulator -= fullSeconds;
                
                // Update the display and upgrade buttons
                this.updateDisplays();
                this.updateUpgradeButtons();
            }
        }
        
        // Handle Stage 2 Levi spawning
        if (this.player.stage >= 2 && !this.gameOver) {
            // Update Levi spawn timer
            this.leviSpawnTimer -= dt;
            
            // Spawn new Levi if timer is up
            if (this.leviSpawnTimer <= 0) {
                this.createLevi();
                
                // Reset timer with random interval
                const minTime = CONFIG.LEVI_SPAWN_MIN_TIME;
                const maxTime = CONFIG.LEVI_SPAWN_MAX_TIME;
                this.leviSpawnTimer = minTime + Math.random() * (maxTime - minTime);
            }
            
            // Update existing Levis
            this.updateLevis(dt);
        }
        
        // Update particles
        this.updateParticles(dt);
        
        // Save game every 30 seconds
        if (currentTime % 30000 < 100 && !this.gameOver) {
            this.saveGame();
        }
        
        // Request next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    // Format time as MM:SS
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Handle win condition
    handleWin() {
        this.gameOver = true;
        
        // Show game over screen
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.style.display = 'flex';
        
        // Update win message with time
        const winTimeElement = document.getElementById('win-time');
        winTimeElement.textContent = this.formatTime(this.gameTimer);
        
        // Focus on the name input field
        setTimeout(() => {
            const nameInput = document.getElementById('player-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
        
        // Update leaderboard display
        this.updateLeaderboardDisplay();
    }
    
    // Create game over screen
    createGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'game-over-screen';
        gameOverScreen.className = 'game-over-screen';
        
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';
        winMessage.innerHTML = `
            <h2>Sweet mullet dude, you win!</h2>
            <p>You reached ${CONFIG.WIN_AMOUNT} ${CONFIG.CURRENCY_NAME} in <span id="win-time">0:00</span></p>
            <div class="name-input-container">
                <label for="player-name">Enter your name for the leaderboard:</label>
                <input type="text" id="player-name" placeholder="Your Name" maxlength="20">
            </div>
            <button id="submit-score-button">Submit Score</button>
            <button id="play-again-button">Play Again</button>
        `;
        
        gameOverScreen.appendChild(winMessage);
        document.querySelector('.game-container').appendChild(gameOverScreen);
        
        // Add event listener to submit score button
        document.getElementById('submit-score-button').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name');
            const playerName = nameInput.value.trim() || "Anonymous";
            
            // Add score to leaderboard with player name
            this.addScoreToLeaderboard(this.gameTimer, playerName);
            
            // Update leaderboard display
            this.updateLeaderboardDisplay();
            
            // Hide the name input and submit button after submission
            document.querySelector('.name-input-container').style.display = 'none';
            document.getElementById('submit-score-button').style.display = 'none';
        });
        
        // Add event listener to play again button
        document.getElementById('play-again-button').addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    // Reset game
    resetGame() {
        // Hide game over screen
        document.getElementById('game-over-screen').style.display = 'none';
        
        // Reset player
        this.player = new Player();
        
        // Reset game state
        this.gameStartTime = null;
        this.gameTimer = 0;
        this.gameOver = false;
        this.timerStarted = false;
        this.leviSpawnTimer = 0;
        
        // Clear levis
        this.levis.forEach(levi => levi.element.remove());
        this.levis = [];
        
        // Completely recreate the game over screen to ensure proper layout
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.remove();
            this.createGameOverScreen();
        }
        
        // Update displays
        this.updateDisplays();
        this.updateUpgradeButtons();
    }
    
    // Load leaderboard from localStorage
    loadLeaderboard() {
        const leaderboardData = localStorage.getItem('liamClickerLeaderboard');
        let leaderboard = leaderboardData ? JSON.parse(leaderboardData) : [];
        
        // Ensure all entries have a name property (for backward compatibility)
        leaderboard = leaderboard.map(score => {
            if (!score.hasOwnProperty('name')) {
                score.name = "Anonymous";
            }
            return score;
        });
        
        return leaderboard;
    }
    
    // Save leaderboard to localStorage
    saveLeaderboard() {
        localStorage.setItem('liamClickerLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    // Add score to leaderboard
    addScoreToLeaderboard(time, playerName = "Anonymous") {
        // Create a new score entry
        const newScore = {
            name: playerName,
            time: time,
            date: new Date().toLocaleDateString()
        };
        
        // Add to leaderboard
        this.leaderboard.push(newScore);
        
        // Sort leaderboard by time (ascending)
        this.leaderboard.sort((a, b) => a.time - b.time);
        
        // Keep only top 10 scores
        if (this.leaderboard.length > 10) {
            this.leaderboard = this.leaderboard.slice(0, 10);
        }
        
        // Save leaderboard
        this.saveLeaderboard();
    }
    
    // Create leaderboard
    createLeaderboard() {
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.id = 'leaderboard-container';
        leaderboardContainer.className = 'leaderboard-container';
        
        const leaderboardTitle = document.createElement('h2');
        leaderboardTitle.textContent = 'Leaderboard';
        leaderboardContainer.appendChild(leaderboardTitle);
        
        const leaderboardList = document.createElement('div');
        leaderboardList.id = 'leaderboard-list';
        leaderboardList.className = 'leaderboard-list';
        leaderboardContainer.appendChild(leaderboardList);
        
        document.querySelector('.shop-panel').appendChild(leaderboardContainer);
        
        // Update leaderboard display
        this.updateLeaderboardDisplay();
    }
    
    // Update leaderboard display
    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'leaderboard-empty';
            emptyMessage.textContent = 'No scores yet. Be the first!';
            leaderboardList.appendChild(emptyMessage);
            return;
        }
        
        // Create header row
        const headerRow = document.createElement('div');
        headerRow.className = 'leaderboard-row header';
        headerRow.innerHTML = `
            <div class="leaderboard-rank">Rank</div>
            <div class="leaderboard-name">Name</div>
            <div class="leaderboard-time">Time</div>
            <div class="leaderboard-date">Date</div>
        `;
        leaderboardList.appendChild(headerRow);
        
        // Add scores
        this.leaderboard.forEach((score, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            
            // Highlight if it's the most recent score
            if (index === this.leaderboard.indexOf(this.leaderboard[this.leaderboard.length - 1])) {
                row.classList.add('latest-score');
            }
            
            row.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${score.name || "Anonymous"}</div>
                <div class="leaderboard-time">${this.formatTime(score.time)}</div>
                <div class="leaderboard-date">${score.date}</div>
            `;
            
            leaderboardList.appendChild(row);
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});