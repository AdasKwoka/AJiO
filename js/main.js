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

const loadLabeledImages = () => {
    const labels = ['Chris Evans', 'Margot Robbie', 'Scarlett Johansson', 'Tom Holland'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 3; i++) {
                const image = await faceapi.fetchImage(`http://127.0.0.1:3001/images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

const startRecognition = async () => {
    const container = document.createElement('div')
    container.style.position = 'relative'
    imageWrapper.append(container)
    const labeledDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, .6)
    let image, canvas
    imageUpload.addEventListener('change', async () => {
        image && image.remove()
        canvas && canvas.remove()
        image = await faceapi.bufferToImage(imageUpload.files[0])
        imageWrapper.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        canvas.style.top = 0
        canvas.style.left = 0
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })
    })
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models')
])
    .then(startVideo)
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