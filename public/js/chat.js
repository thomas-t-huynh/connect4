const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// templates

const messageTemplate = document.querySelector("#message-template").innerHTML
const urlTemplate = document.querySelector("#url-template").innerHTML
socket.on('locationMessage', (url) => {
    const html = Mustache.render(urlTemplate, {
        url
    })
    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // disable

    $messageFormButton.setAttribute("disabled", "disabled")

    const message = e.target.elements['message-input'].value
    socket.emit('sendMessage', message, (status) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        // enable

        console.log(status)
    })
})

$sendLocationButton.addEventListener("click", () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocationButton.removeAttribute('disabled')
        const { latitude, longitude } = position.coords
        // can also send objects through emit
        socket.emit('sendLocation', { latitude, longitude }, (status) => {
            console.log(status)
        })
    })
})