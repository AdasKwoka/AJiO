class FaceExpression {
    constructor(wrapper, video) {
        this.wrapper = wrapper
        this.video = video
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.video.srcObject = stream;
            })
            .catch(err => console.error(err))

        this.video.addEventListener('playing', () => {
            const canvas = faceapi.createCanvasFromMedia(this.video)
            this.wrapper.append(canvas)
            const displaySize = { width: this.video.width, height: this.video.height }
            faceapi.matchDimensions(canvas, displaySize)
            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(
                    this.video, new faceapi.TinyFaceDetectorOptions()
                )
                    .withFaceLandmarks()
                    .withFaceExpressions()
                const resizedDetections = faceapi.resizeResults(detections, displaySize)
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                faceapi.draw.drawDetections(canvas, resizedDetections)
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            }, 1000)
        })
    }
}

export default FaceExpression;