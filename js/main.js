import FaceExpression from "./face-expression.js";
import FaceRecognition from "./face-recognition.js"; 
class Main {
    constructor() {
        this.feBtn = document.querySelector('.feBtn')
        this.frBtn = document.querySelector('.frBtn')
        this.goBackBtns = document.querySelectorAll('.cross')
        this.startWrapper = document.querySelector('.start')
        this.faceExpression = document.querySelector('.faceExpression')
        this.video = document.querySelector('.video');
    }

    start() {
        this.feBtn.addEventListener('click', () => {
            this.startWrapper.classList.toggle('hidden')
            this.faceExpression.classList.toggle('hidden')
            new FaceExpression(this.faceExpression, this.video)
        })

        this.frBtn. addEventListener('click', () => {
            this.startWrapper.classList.toggle('hidden')
            const fr = new FaceRecognition()
            fr.startRecognition()
        })

        this.goBackBtns.forEach(goBackBtn => {
            goBackBtn.addEventListener('click', () => {
                window.location.reload()
            })
        })
    }
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models')
])
    .then(() => {
        const main = new Main()
        main.start()
    })
