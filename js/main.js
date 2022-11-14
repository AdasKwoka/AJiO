const video = document.querySelector('.video');
const faceExpression = document.querySelector('.faceExpression')
const faceRecognition = document.querySelector('.faceRecognition')
const imageUpload = document.querySelector('.faceRecognitionInput')
const imageWrapper = document.querySelector('.uploadedImage')

const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error(err))
}

const startRecognition = () => {
    const container = document.createElement('div')
    container.style.position = 'relative'
    imageWrapper.append(container)
    imageUpload.addEventListener('change', async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0])
        imageWrapper.append(image)
        const canvas = faceapi.createCanvasFromMedia(image)
        canvas.style.top = 0
        canvas.style.left = 0
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' })
            drawBox.draw(canvas)
        })
    })
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models')
])
    .then(startVideo)

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models')
])
    .then(startRecognition)



video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    faceExpression.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            video, new faceapi.TinyFaceDetectorOptions()
        )
            .withFaceLandmarks()
            .withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 1000)
})