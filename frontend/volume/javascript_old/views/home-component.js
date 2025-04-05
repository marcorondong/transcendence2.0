'use strict'
import { Pong } from '../pong/pong.js'

class HomeComponent extends HTMLElement {
    constructor() {
        super()
        this.canvas = document.createElement('canvas')
        this.canvas.width = '800'
        this.canvas.height = '600'
        this.pong = new Pong(this.canvas)
        document.addEventListener('keydown', this, false)
        document.addEventListener('keyup', this, false)
        document.addEventListener('click', this)
    }

    // is called when component is added to dom tree
    connectedCallback() {
		this.pong.printStart();
		this.className = 'flex-column d-flex align-items-center';
        console.log('myComponent has been connected')
        const h1 = document.createElement('h1')
        h1.textContent = 'Home'
        this.appendChild(h1)
		h1.className = "align-self-start";
        this.appendChild(this.canvas);
		const divButtons = document.createElement('div');
		divButtons.className = 'mt-4 d-flex justify-content-center gap-2';
		const startButton = document.createElement('button');
		startButton.textContent = 'Start';
		startButton.className = 'btn btn-success'
		startButton.id = 'start';
		const pauseButton = document.createElement('button');
		pauseButton.textContent = 'Pause';
		pauseButton.className = 'btn btn-primary'
		pauseButton.id = 'pause';
        this.appendChild(divButtons)
        divButtons.appendChild(startButton)
        divButtons.appendChild(pauseButton)
    }

    handleEvent(event) {
        this[`on${event.type}`](event)
    }

    onkeydown(event) {
        this.pong.keyPress(event)
    }
    onkeyup(event) {
        this.pong.keyReleased(event)
    }
	onclick(event){
		if(event.target.id === 'start'){
			this.pong.startGame();
		}
		if(event.target.id === 'pause'){
			this.pong.pauseGame();
		}
	}

    // is called when component is removed from DOM
    disconnectedCallback() {
        console.log('home-component has been disconnected')
        this.pong.gameData.isGameOver = true
        document.removeEventListener('keydown', this, false)
        document.removeEventListener('keyup', this, false)
        this.removeEventListener('click', this)

        // setting variables to null 'frees' them meaning:
        // it makes them available to garbage collection
        this.pong = null
        this.canvas = null
    }
}

customElements.define('home-component', HomeComponent)

export function createComponent() {
    console.log('creating element')
    return document.createElement('home-component')
}
