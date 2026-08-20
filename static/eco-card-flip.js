// Card Flip - Tarjetas con efecto flip
class EcoCardFlip {
    constructor() {
        this.init();
    }

    init() {
        this.createCardFlip();
    }

    createCardFlip() {
        const container = document.createElement('div');
        container.className = 'card-flip-container';
        container.innerHTML = `
            <h3>🔄 Tarjetas con efecto flip</h3>
            <div class="card-flip-demo">
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="card-icon">🌱</div>
                            <h4>Botella ecológica</h4>
                            <p>$15.99</p>
                            <button class="flip-btn">Ver detalles</button>
                        </div>
                        <div class="flip-card-back">
                            <h4>Detalles</h4>
                            <p>Botella reutilizable de acero inoxidable con tapa hermética. Perfecta para llevar agua, jugos o cualquier bebida.</p>
                            <button class="add-to-cart">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="card-icon">🧴</div>
                            <h4>Jabón natural</h4>
                            <p>$8.50</p>
                            <button class="flip-btn">Ver detalles</button>
                        </div>
                        <div class="flip-card-back">
                            <h4>Detalles</h4>
                            <p>Jabón artesanal hecho con ingredientes naturales. Ideal para pieles sensibles y dermatitis.</p>
                            <button class="add-to-cart">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        this.addFlipHandlers();
    }

    addFlipHandlers() {
        const flipBtns = document.querySelectorAll('.flip-btn');
        const cards = document.querySelectorAll('.flip-card');

        flipBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.flip-card').classList.add('flipped');
            });
        });

        cards.forEach(card => {
            card.addEventListener('mouseleave', () => {
                card.classList.remove('flipped');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCardFlip();
});