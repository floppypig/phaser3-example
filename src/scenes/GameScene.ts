import Phaser from 'phaser';

type Collider = Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private stars!: Phaser.Physics.Arcade.Group;
    private bombs!: Phaser.Physics.Arcade.Group;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private scoreText!: Phaser.GameObjects.Text;
    private gameOverText!: Phaser.GameObjects.Text;

    private score: number = 0;
    private gameOver: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Background
        this.add.image(400, 300, 'sky');

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 685, 'ground').setScale(2).refreshBody(); // Ground
        this.platforms.create(600, 460, 'ground').setScale(0.5).refreshBody();
        this.platforms.create(50, 300, 'ground').setScale(0.5).refreshBody();
        this.platforms.create(750, 260, 'ground').setScale(0.5).refreshBody();

        // Player
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // Make player smaller if needed
        // this.player.setScale(0.8);


        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Stars
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11, // 11 + 1 initial = 12 stars
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate((child) => {
            const starChild = child as Phaser.Physics.Arcade.Image; // Type assertion
            starChild.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            starChild.setScale(0.2).refreshBody();
            return true; // Keep iterating
        });

        // Bombs
        this.bombs = this.physics.add.group();

        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#000'
        });

        // Game Over text (initially invisible)
        this.gameOverText = this.add.text(400, 300, 'GAME OVER\nClick to Restart', {
            fontSize: '64px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);


        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);

        // Initialize score and game over state
        this.score = 0;
        this.gameOver = false;
    }

    update() {
        if (this.gameOver) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body?.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    private collectStar(player: Collider, star: Collider) {
        const starSprite = star as Phaser.Physics.Arcade.Sprite; // Type assertion
        starSprite.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            // A new batch of stars to collect
            this.stars.children.iterate((child) => {
                const starChild = child as Phaser.Physics.Arcade.Image;
                starChild.enableBody(true, starChild.x, 0, true, true);
                starChild.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                return true;
            });

            // Spawn a bomb
            const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setScale(0.2).refreshBody();
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false; // Or set true if you want them to fall like stars
        }
    }

    private hitBomb(player: Collider, bomb: Collider) {
        this.physics.pause();
        const playerSprite = player as Phaser.Physics.Arcade.Sprite; // Type assertion
        playerSprite.setTint(0xff0000);
        playerSprite.anims.play('turn');
        this.gameOver = true;
        this.gameOverText.setVisible(true);

        // Add input to restart the game
        this.input.once('pointerdown', () => {
            this.gameOverText.setVisible(false);
            this.scene.restart();
        });
    }
}