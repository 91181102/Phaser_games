import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,

    width: 800,
    height: 600,

    backgroundColor: '#202040',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 700
            },
            debug: false
        }
    },

    scene: {
        create,
        update
    }
};

let jogador;
let plataformas;
let plataformaMovel;
let plataformaMovelVertical;
let teclas;

let objetosColetaveis;
let pontuacao = 0;
let quantidadeDeObjetos = 5;
let textoPontuacao;

let bonus;
let bonusAtivo = false;
let tempoDoBonus = 30000;
let duracaoDoBonus = 10000;

let granizos;
let quantidadeDeGranizos = 1;
let velocidadeDosGranizos = 120;
let jogoEncerrado = false;
let textoGameOver;

let direcaoPlataformaHorizontal = 1;
let direcaoPlataformaVertical = 1;

const velocidade = 240;
const forcaDoPulo = 450;
const velocidadeDaPlataforma = 100;
const pontosDoBonus = 100;
const quantidadeMaximaDeGranizos = 20;
const velocidadeMaximaDosGranizos = 320;

/*Cria os elementos do jogo */
function create() {
    criarPlataformas(this);
    criarPlataformaMovelHorizontal(this);
    criarPlataformaMovelVertical(this);
    criarJogador(this);
    aplicarFisica(this);
    definirTeclas(this);
    criarObjetosColetaveis(this);
    criarBonus(this);
    criarGranizos(this);

    // Texto
    this.add.text(
        20,
        20,
        'Setas: movimentar   Espaço: pular',
        {
            fontSize: '20px',
            color: '#ffffff'
        }
    );

     // Texto da pontuação
    textoPontuacao = this.add.text(
        20,
        50,
        'Pontos: 0',
        {
            fontSize: '24px',
            color: '#ffff00'
        }
    );
}

/*Cria as plataformas fixas do cenário */
function criarPlataformas(scene) {
    const largura = 800;
    const altura = 600;

    // Fundo
    scene.add.rectangle(
        largura / 2,
        altura / 2,
        largura,
        altura,
        0x303050
    );

    // Grupo de plataformas físicas estáticas
    plataformas = scene.physics.add.staticGroup();

    // Chão
    criarPlataforma(scene, 400, 570, 800, 60);

    // Plataformas superiores
    criarPlataforma(scene, 180, 450, 220, 25);
    criarPlataforma(scene, 600, 350, 220, 25);
    criarPlataforma(scene, 300, 250, 180, 25);
    criarPlataforma(scene, 650, 170, 180, 25);
}

/*Cria as plataformas móveis na horizontal do cenário */
function criarPlataformaMovelHorizontal(scene) {    
     plataformaMovel = scene.add.rectangle(
        400,
        480,
        180,
        25,
        0xffaa00
    );

    scene.physics.add.existing(plataformaMovel);
    plataformaMovel.body.setAllowGravity(false);
    plataformaMovel.body.setImmovable(true);   
}

/*Cria as plataformas móveis na vertical do cenário */
function criarPlataformaMovelVertical(scene) {
    plataformaMovelVertical = scene.add.rectangle(
        100,
        400,
        180,
        25,
        0xffaa00
    );

    scene.physics.add.existing(plataformaMovelVertical);
    plataformaMovelVertical.body.setAllowGravity(false);
    plataformaMovelVertical.body.setImmovable(true);
}

/*Cria o jogador do jogo */
function criarJogador(scene) {
// Jogador
    jogador = scene.add.rectangle(
        100,
        500,
        30,
        30,
        0x00aaff
    );

    // Adiciona física ao jogador
    scene.physics.add.existing(jogador);
}

/*Aplica a física do jogo */
function aplicarFisica(scene){
    // Colisão com as plataformas
    scene.physics.add.collider(jogador, plataformas);

    scene.physics.add.collider(
        jogador,
        plataformaMovelVertical
    );

    // Colisão com o jogador
    scene.physics.add.collider(jogador, plataformaMovel);
}

/*Define as teclas de controle do jogo */
function definirTeclas(scene) {
 // Teclas
    teclas = scene.input.keyboard.addKeys({
        esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
        direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        pulo: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
}

/*Cria uma plataforma do cenário */
function criarPlataforma(scene, x, y, largura, altura) {
    const plataforma = scene.add.rectangle(
        x,
        y,
        largura,
        altura,
        0x8844aa
    );

    plataforma.setStrokeStyle(3, 0xffffff);

    // Corpo físico estático
    scene.physics.add.existing(plataforma, true);

    // Adiciona ao grupo
    plataformas.add(plataforma);
}

/*Cria eventos para o bônus do jogo */
function criarBonus(scene) {
    scene.time.addEvent({
        delay: tempoDoBonus,
        callback: () => {
            aparecerBonus(scene);
        },
        loop: true
    });
}

function criarGranizos(scene) {
    granizos = scene.physics.add.group();

    for (let i = 0; i < quantidadeDeGranizos; i++) {
        criarGranizo(scene);
    }

    scene.physics.add.overlap(
        jogador,
        granizos,
        jogadorAtingido,
        null,
        scene
    );
}

function criarGranizo(scene) {
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(-300, -30);

    const granizo = scene.add.circle(
        x,
        y,
        7,
        0xffffff
    );

    granizo.setStrokeStyle(2, 0x99ccff);

    scene.physics.add.existing(granizo);

    granizo.body.setAllowGravity(false);
    granizo.body.setVelocityY(velocidadeDosGranizos);

    granizos.add(granizo);
}


/*Atualiza o estado do jogo a cada frame */
function update() {
    if (jogoEncerrado) {
        return;
    }
    updateJogador();
    updatePlataformaMovel();
    updatePlataformaMovelVertical();
    updateGranizos();
}

/*Atualiza o movimento do jogador */
function updateJogador() {
// Movimento horizontal do jogador
    jogador.body.setVelocityX(0);

    if (teclas.esquerda.isDown) {
        jogador.body.setVelocityX(-velocidade);
    }

    if (teclas.direita.isDown) {
        jogador.body.setVelocityX(velocidade);
    }

    // Verifica se o jogador está apoiado
    const estaNoChao =
        jogador.body.blocked.down ||
        jogador.body.touching.down;

    // Pulo
    if (
        Phaser.Input.Keyboard.JustDown(teclas.pulo) &&
        estaNoChao
    ) {
        jogador.body.setVelocityY(-forcaDoPulo);
    }

    // Teletransporte horizontal do jogador
    if (jogador.x > 815) {
        jogador.x = -15;
    }

    if (jogador.x < -15) {
        jogador.x = 815;
    }

    // Reinicia se cair pela parte inferior
    if (jogador.y > 630) {
        jogador.x = 100;
        jogador.y = 100;
        jogador.body.setVelocity(0);
    }
}

/*Atualiza o movimento da plataforma móvel horizontal */
function updatePlataformaMovel() {
    // Movimento da plataforma horizontal
    plataformaMovel.body.setVelocityX(
        velocidadeDaPlataforma * direcaoPlataformaHorizontal
    );

    // Limite direito
    if (plataformaMovel.x >= 700) {
        plataformaMovel.x = 700;
        direcaoPlataformaHorizontal = -1;
    }

    // Limite esquerdo
    if (plataformaMovel.x <= 100) {
        plataformaMovel.x = 100;
        direcaoPlataformaHorizontal = 1;
    }
}

/*Atualiza o movimento da plataforma móvel vertical */
function updatePlataformaMovelVertical() {
    // Movimento vertical da plataforma
    plataformaMovelVertical.body.setVelocityY(
        velocidadeDaPlataforma * direcaoPlataformaVertical
    );

    // Limite inferior
    if (plataformaMovelVertical.y >= 520) {
        plataformaMovelVertical.y = 520;
        direcaoPlataformaVertical = -1;
    }

    // Limite superior
    if (plataformaMovelVertical.y <= 180) {
        plataformaMovelVertical.y = 180;
        direcaoPlataformaVertical = 1;
    }
}

function updateGranizos() {
    if (jogoEncerrado) {
        return;
    }

    granizos.getChildren().forEach((granizo) => {
        if (!granizo || !granizo.active) {
            return;
        }

        if (granizo.y > 620) {
            granizo.x = Phaser.Math.Between(20, 780);
            granizo.y = Phaser.Math.Between(-100, -20);

            granizo.body.setVelocityY(
                velocidadeDosGranizos
            );
        }
    });
}

/*Cria os objetos coletáveis do jogo */
function criarObjetosColetaveis(scene) {
    objetosColetaveis = scene.physics.add.staticGroup();

    for (let i = 0; i < quantidadeDeObjetos; i++) {
        criarObjetoColetavel(scene);
    }

    scene.physics.add.overlap(
        jogador,
        objetosColetaveis,
        coletarObjeto,
        null,
        scene
    );
}

/*Cria um objeto coletável do jogo */
function criarObjetoColetavel(scene) {
    const x = Phaser.Math.Between(30, 770);
    const y = Phaser.Math.Between(80, 520);

    const objeto = scene.add.circle(
        x,
        y,
        12,
        0xffff00
    );

    objeto.setStrokeStyle(2, 0xffffff);
    scene.physics.add.existing(objeto, true);
    objetosColetaveis.add(objeto);
}

/*Coleta um objeto do jogo */
function coletarObjeto(jogador, objeto) {
    objeto.destroy();
    pontuacao += 10;
    textoPontuacao.setText(
        'Pontos: ' + pontuacao
    );
    if (objetosColetaveis.countActive(true) === 0) {
        criarNovaRodada(this);
    }
}

/*Cria uma nova rodada do jogo */
function criarNovaRodada(scene) {
    for (let i = 0; i < quantidadeDeObjetos; i++) {
        criarObjetoColetavel(scene);
    }

    if (quantidadeDeObjetos < 10) {
        quantidadeDeObjetos++;
    }
    aumentarDificuldadeDosGranizos(scene);
}

/*Cria o bônus do jogo */
function aparecerBonus(scene) {
    if (bonusAtivo) {
        return;
    }

    bonus = scene.add.triangle(
        400,
        110,
        0,
        30,
        30,
        30,
        15,
        0,
        0xff0000
    );

    bonus.setStrokeStyle(3, 0xffffff);
    scene.physics.add.existing(bonus, true);
    bonusAtivo = true;

    scene.physics.add.overlap(
        jogador,
        bonus,
        coletarBonus,
        null,
        scene
    );

    scene.time.delayedCall(
        duracaoDoBonus,
        () => {
            removerBonus();
        }
    );

    scene.tweens.add({
        targets: bonus,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: -1
    });
}

/*Coleta o bônus do jogo */
function coletarBonus(jogador, bonusColetado) {
    pontuacao += pontosDoBonus;

    textoPontuacao.setText(
        'Pontos: ' + pontuacao
    );

    removerBonus();
}

/*Remove o bônus do jogo */
function removerBonus() {
    if (bonus && bonus.active) {
        bonus.destroy();
    }

    bonus = null;
    bonusAtivo = false;
}

function jogadorAtingido() {
    if (jogoEncerrado) {
        return;
    }

    jogoEncerrado = true;

    this.physics.pause();

    this.tweens.pauseAll();

    textoGameOver = this.add.text(
        400,
        300,
        'Você foi atingido!',
        {
            fontSize: '42px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 5
        }
    );

    textoGameOver.setOrigin(0.5);

    this.time.delayedCall(
        2500,
        () => {
            reiniciarJogo(this);
        }
    );
}

function reiniciarJogo(scene) {
    pontuacao = 0;
    quantidadeDeObjetos = 5;

    quantidadeDeGranizos = 1;
    velocidadeDosGranizos = 120;

    jogoEncerrado = false;

    scene.scene.restart();
}

function aumentarDificuldadeDosGranizos(scene) {
    if (quantidadeDeGranizos < quantidadeMaximaDeGranizos) {
        quantidadeDeGranizos++;
    }

    if (velocidadeDosGranizos < velocidadeMaximaDosGranizos) {
        velocidadeDosGranizos += 15;

        if (velocidadeDosGranizos > velocidadeMaximaDosGranizos) {
            velocidadeDosGranizos = velocidadeMaximaDosGranizos;
        }
    }

    const quantidadeAtual =
        granizos.countActive(true);

    for (
        let i = quantidadeAtual;
        i < quantidadeDeGranizos;
        i++
    ) {
        criarGranizo(scene);
    }

    granizos.getChildren().forEach((granizo) => {
        if (granizo && granizo.body) {
            granizo.body.setVelocityY(
                velocidadeDosGranizos
            );
        }
    });
}

new Phaser.Game(config);