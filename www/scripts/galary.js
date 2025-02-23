let IP = "192.168.1.100"

function downloadFile(url, fileName) {
    // console.log("--- 9");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.follow_redirects = false;
    xhr.responseType = "blob";
    xhr.onload = function(){
        var blob = this.response;
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        console.log(link);
        document.body.removeChild(link);
    }
    xhr.send();
}

function deleteFile(fileName, container) {
    fetch(`http://` + IP + `:8080/delete/${fileName}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log('File deleted successfully');
            container.remove();
        } else {
            console.error('Error deleting file:', response.statusText);
        }
    })
    .catch(error => console.error('Error deleting file:', error));
}



let currentImageIndex = 0;
let modalImages = [];

function openModal(index) {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modal-image').src = modalImages[index];
    currentImageIndex = index;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showPrev() {
    currentImageIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
    document.getElementById('modal-image').src = modalImages[currentImageIndex];
}

function showNext() {
    currentImageIndex = (currentImageIndex + 1) % modalImages.length;
    document.getElementById('modal-image').src = modalImages[currentImageIndex];
}

function load_p() {
    fetch('http://' + IP + ':8080/files')
    .then(response => response.text())
    .then(text => {
        const files = text.split('\n').filter(file => file.trim() !== '');
        const photosDiv = document.getElementById('photos');
        photosDiv.innerHTML = '';
        modalImages = [];

        files.forEach(file => {
            if (file.toLowerCase().endsWith('.jpg')) {
                const img = document.createElement('img');
                img.src = 'http://' + IP + ':8080/' + file;
                img.classList.add('image-preview');

                img.addEventListener('click', function(event) {
                    openModal(modalImages.indexOf(img.src));
                });

                const link = document.createElement('a');
                link.href = 'http://' + IP + ':8080/' + file;
                link.textContent = 'Download';
                link.classList.add('download-button');
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    downloadFile(this.href, file);
                });

                const dell = document.createElement('button');
                dell.textContent = 'Delete';
                dell.classList.add('delete-button');
                dell.addEventListener('click', function(event) {
                    event.preventDefault();
                    const container = this.parentNode.parentNode;
                    const imgElement = container.querySelector('img');
                    const fileName = imgElement ? imgElement.src.split('/').pop() : '';
                    if (fileName) {
                        deleteFile(fileName, container);
                    }
                });

                const caption = document.createElement('div');
                caption.textContent = file;
                caption.classList.add('image-name');
                
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
                buttonContainer.appendChild(link);
                buttonContainer.appendChild(dell);

                const container = document.createElement('div');
                container.classList.add('photo-container');
                container.appendChild(img);
                container.appendChild(caption);
                container.appendChild(buttonContainer);

                photosDiv.appendChild(container);
                modalImages.push(img.src);
            }
        });
    })
    .catch(error => console.error('Error fetching files:', error));
}

// document.querySelector('.close').addEventListener('click', closeModal);
// document.querySelector('.prev').addEventListener('click', showPrev);
// document.querySelector('.next').addEventListener('click', showNext);