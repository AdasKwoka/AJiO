class FaceRecognition {
    constructor() {
        this.imageUpload = document.querySelector('.faceRecognitionInput')
        this.imageWrapper = document.querySelector('.uploadedImage')
        this.loader = document.querySelector('.loader')
        this.faceRecognition = document.querySelector('.faceRecognition')
    }
    
    loadLabeledImages() {
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

    startRecognition = async () => {
        const container = document.createElement('div')
        container.style.position = 'relative'
        this.imageWrapper.append(container)
        this.loader.classList.toggle('hidden')
        this.loadLabeledImages()
            .then((data) => {
                this.loader.classList.toggle('hidden')
                return data
            })
            .then((labeledDescriptors) => {
                this.faceRecognition.classList.toggle('hidden')
                const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, .6)
                let image, canvas
                this.imageUpload.addEventListener('change', async () => {
                    image && image.remove()
                    canvas && canvas.remove()
                    image = await faceapi.bufferToImage(this.imageUpload.files[0])
                    this.imageWrapper.append(image)
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
            })
    }
}

export default FaceRecognition;