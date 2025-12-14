// Function to open instructions
function openInstructions() {
        // Gets the modal element and removes hidden from the list
        document.getElementById("modal").classList.remove("hidden");
        // adds the class to start entry animation
        document.querySelector('#modal > div').classList.add('animate__zoomIn');
        // adds the class to start remove animation
        document.querySelector('#modal > div').classList.remove('animate__zoomOut');
    }

// Closes the instructions
function closeInstructions() {
    // gets the model content
    const modalContent = document.querySelector('#modal > div');
    // adds the class to start entry animation
    modalContent.classList.remove('animate__zoomIn');
    // adds the class to start remove animation
    modalContent.classList.add('animate__zoomOut');

    // Hide modal after animation completes
    setTimeout(() => {
        // Gets the modal id and hides it
        document.getElementById("modal").classList.add("hidden");
        // adds the class to start remove animation
        modalContent.classList.remove('animate__zoomOut');
    }, 500); // 500ms matches Animate.css duration
}