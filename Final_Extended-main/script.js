document.addEventListener("DOMContentLoaded", function () {
  // Add event listeners for search button and select element
  document.getElementById("select-el").addEventListener("change", handleSelectChange);
  let searchBtn = document.getElementById("search-button");
  searchBtn.addEventListener("click", handleSearch);
});

// Function to handle changes in the select element
function handleSelectChange(event) {
  let selectedValue = event.target.value;
  if (selectedValue === "1") {
    openCamera();
  } else if (selectedValue === "2") {
    clearImagePreview();
    createImageInput();
  } else {
    clearImagePreview();
  }
}

// Function to handle search action
async function handleSearch() {
  //const selectedVal = document.getElementById("select-el2").value;
  
  const [result1, result2] = await Promise.all([search(), search2()]);
  displayCombinedResults(result1, result2);
}

// Function to clear image preview
function clearImagePreview() {
  const capturedImgPreview = document.getElementById("capturedImg-preview");
  capturedImgPreview.innerHTML = '';
}

// Function to create image input
function createImageInput() {
  const existingDiv = document.getElementById("upload-image-div");
  if (!existingDiv) {
    const div = document.createElement("div");
    div.innerHTML = `
      <input type="file" id="file-input" accept="image/*" onchange="previewFile()" style="margin-top: 10px;">
      <label for="file-input" class="file-label">Choose File</label>`;
    div.id = "upload-image-div";
    div.classList.add("input-option");
    const capturedImgPreview = document.getElementById("capturedImg-preview");
    capturedImgPreview.appendChild(div);
  }
}

// Function to preview selected image file
function previewFile() {
  const fileInput = document.getElementById('file-input');
  const capturedImgPreview = document.getElementById("capturedImg-preview");

  if (!fileInput.files || !fileInput.files[0]) {
    return;
  }

  const imagePrev = document.getElementById("image-preview");
  if (!imagePrev) {
    const createdDiv2 = document.createElement("div");
    createdDiv2.innerHTML = '<img id="image-preview" src="#" alt="Preview">';
    createdDiv2.classList.add("preview-container");
    capturedImgPreview.appendChild(createdDiv2);
  }

  const imagePreview = document.getElementById('image-preview');
  const reader = new FileReader();

  reader.onload = function (e) {
    imagePreview.src = e.target.result;
  };

  reader.readAsDataURL(fileInput.files[0]);
}

// Function to open camera and capture image
async function openCamera() {
  const capturedImgPreview = document.getElementById("capturedImg-preview");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    const captureButton = document.createElement('button');
    const retakeButton = document.createElement('button');

    video.srcObject = stream;
    video.autoplay = true;
    capturedImgPreview.innerHTML = '';
    capturedImgPreview.appendChild(video);
    capturedImgPreview.appendChild(captureButton);

    captureButton.textContent = 'Capture Now';
    captureButton.onclick = async () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedImage = document.createElement('img');
      capturedImage.src = canvas.toDataURL('image/jpeg');
      capturedImgPreview.innerHTML = '';
      capturedImgPreview.appendChild(capturedImage);
      capturedImgPreview.appendChild(retakeButton);
      stream.getTracks().forEach(track => track.stop());
    };

    retakeButton.textContent = 'Retake';
    retakeButton.onclick = () => {
      capturedImgPreview.innerHTML = '';
      openCamera();
    };
  } catch (error) {
    console.error('Error accessing the camera:', error);
    alert('Error accessing the camera. Please make sure your camera is connected and accessible.');
  }
}

// Function to handle search action
async function search() {
  const imagePreview = document.getElementById('image-preview');

  if (!imagePreview || imagePreview.src === '#' || !imagePreview.src.startsWith('data:image')) {
    alert('Please select a valid image first.');
    return null; // Return null if no valid image
  }

  try {
    // Validate if the image contains features consistent with a leaf
    const isLeafPhoto = await validateLeafPhoto(imagePreview.src);

    if (!isLeafPhoto) {
      alert('Please upload a photo of a leaf.');
      return null; // Return null if not a leaf photo
    }

    // Proceed with searching for plant details
    const imageData = imagePreview.src.split(',')[1]; // Extract base64-encoded image data
    const requestOptions = {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: imageData }), // Send image data as JSON
      redirect: "follow"
    };

    const response = await fetch("https://api-inference.huggingface.co/models/Ayush7871/medicinal_plants_image_detection", requestOptions);
    if (response.ok) {
      const result = await response.json();
      return result; // Return the result of search
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Long Response Time. Try Again');
    return null; // Return null on error
  }
}

// Function to handle search2 action
async function search2() {
  const imagePreview = document.getElementById('image-preview');

  if (!imagePreview || imagePreview.src === '#' || !imagePreview.src.startsWith('data:image')) {
    alert('Please select a valid image first.');
    return null; // Return null if no valid image
  }

  try {
    // Validate if the image contains features consistent with a leaf
    const isLeafPhoto = await validateLeafPhoto(imagePreview.src);

    if (!isLeafPhoto) {
      alert('Please upload a photo of a leaf.');
      return null; // Return null if not a leaf photo
    }

    // Proceed with searching for plant details
    const imageData = imagePreview.src.split(',')[1]; // Extract base64-encoded image data
    const requestOptions = {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: imageData }), // Send image data as JSON
      redirect: "follow"
    };

    const response = await fetch("https://api-inference.huggingface.co/models/Harsh994/PlantDiseaseRecoginition", requestOptions);
    if (response.ok) {
      const result = await response.json();
      return result; // Return the result of search2
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Long Response Time. Try Again');
    return null; // Return null on error
  }
}

// Function to validate if the image contains features consistent with a leaf
async function validateLeafPhoto(imageSrc) {
  // Placeholder function - You can implement the logic for leaf photo validation here
  return true; // For simplicity, always return true
}

// Function to display combined search results
function displayCombinedResults(result1, result2) {
  const resultContainer = document.querySelector('.result');
  resultContainer.innerHTML = ''; // Clear previous result

  const resultTitle = document.createElement('h2');
  resultTitle.textContent = 'Plant Details';
  resultContainer.appendChild(resultTitle);
  
  // Display result1
  if (result1 && result1.length > 0) {
    const plantDetails1 = result1[0]; // Assuming the first result contains details of the plant
    if (Object.keys(plantDetails1).length > 0) {
      const detailsList1 = document.createElement('ul');
      detailsList1.classList.add('plant-details');

      for (const [key, value] of Object.entries(plantDetails1)) {
        if (key !== 'score') { // Exclude 'score' property
          const listItem = document.createElement('li');
       
        listItem.innerHTML = ` 
          <div class='result-container'>
            <p class='text-green-700 font-bold'>Name of Plant: ${value}</p>
          </div>`;
          detailsList1.appendChild(listItem);
        }
      }
      resultContainer.appendChild(detailsList1);
    }
    
  } else {
    const noResultMsg1 = document.createElement('p');
    noResultMsg1.textContent = 'No Matching Plant found';
    resultContainer.appendChild(noResultMsg1);
  }

  // Display result2
  const scientificDisease = {
    Jackfruit: {
        Rust: "Uromyces artocarpi",
        Powdery: "Oidium caricae"
    },
    Ashoka: {
        Rust: "Uromyces saracae",
        Powdery: "Erysiphe polygoni"
    },
    Guava: {
        Rust: "Puccinia psidii",
        Powdery: "Oidium psidii"
    },
    Betel_Nut: {
        Rust: "Tulsi rust specific disease",
        Powdery: "Oidium arecae"
    },
    Amruta_Balli: {
        Rust: "Cephaleuros virescens",
        Powdery: "Erysiphe cichoracearum"
    },
    Tamarind: {
        Rust: "Phakopsora tamarindi",
        Powdery: "Oidium sp."
    },
    Jasmine: {
        Rust: "Uromyces hobsoni",
        Powdery: "Oidium sp."
    },
    Lemon_grass: {
        Rust: "Puccinia nakanishikii",
        Powdery: "Erysiphe spp."
    },
    Palak_Spinach: {
        Rust: "Albugo occidentalis",
        Powdery: "Erysiphe cichoracearum"
    },
    Ashwagandha: {
        Rust: "Puccinia recondita",
        Powdery: "Erysiphe cichoracearum"
    },
    Doddpathre: {
        Rust: "Puccinia recondita",
        Powdery: "Erysiphe cichoracearum"
    },
    Tulsi: {
        Rust: "Puccinia psidii",
        Powdery: "Oidium ocimi"
    },
    Aloevera: {
        Rust: "Uromyces aloes",
        Powdery: "Erysiphe cichoracearum"
    },
    Amla: {
        Rust: "Ravenelia emblicae",
        Powdery: "Oidium erysiphoides"
    },
    Raktachandini: {
        Rust: "Puccinia psidii",
        Powdery: "Erysiphe cichoracearum"
    },
    Neem: {
        Rust: "Pseudocercospora leaf spot",
        Powdery: "Pseudoidium azadirachtae"
    },
    Brahmi: {
        Rust: "Ravenelia emblicae",
        Powdery: "Erysiphe cichoracearum"
    },
    Arali: {
        Rust: "Nyssopsora cedrelae",
        Powdery: "Podosphaera xanthii"
    },
    Seethapala: {
        Rust: "Pucciniales",
        Powdery: "Oidium spp."
    },
    Nagadali: {
        Rust: "Puccinia arachidis",
        Powdery: "Erysiphe cichoracearum"
    },
    Bhrami: {
        Rust: "Ravenelia emblicae",
        Powdery: "Erysiphe cichoracearum"
    },
    Insulin: {
        Rust: "Pucciniales",
        Powdery: "Erysiphe cichoracearum"
    },
    Castor: {
        Rust: "Melampsora ricini",
        Powdery: "Leveillula taurica"
    },
    Basale: {
        Rust: "Puccinia recondita",
        Powdery: "Erysiphe cichoracearum"
    },
    Pomegranate: {
        Rust: "Anthracnose",
        Powdery: "Erysiphe punicae"
    },
    Coriender: {
        Rust: "Phakopsora pachyrhizi",
        Powdery: "Erysiphe polygoni"
    },
    Nithyapushpa: {
        Rust: "Pucciniales",
        Powdery: "Erysiphe cichoracearum"
    },
    Tulasi: {
        Rust: "Puccinia psidii",
        Powdery: "Oidium ocimi"
    },
    Catharanthus: {
        Rust: "Puccinia vincae",
        Powdery: "Erysiphe aquilegiae var. ranunculi"
    },
    Wood_sorel: {
        Rust: "Puccinia graminis",
        Powdery: "Erysiphe cichoracearum"
    },
    Hibiscus: {
        Rust: "Cerotelium malvicola",
        Powdery: "Podosphaera xanthii"
    },
    Sapota: {
        Rust: "Phaeoleospora indica",
        Powdery: "Oidium spp."
    },
    Curry: {
        Rust: "Puccinia psidii",
        Powdery: "Erysiphe diffusa"
    },
    Mango: {
        Rust: "Cephaleuros virescens",
        Powdery: "Oidium mangiferae"
    },
    Curry_Leaf: {
        Rust: "Anthracnose",
        Powdery: "Erysiphe diffusa"
    },
    Honge: {
        Rust: "Fusicladium pongamiae",
        Powdery: "Podosphaera aphanis"
    },
    Mint: {
        Rust: "Puccinia menthae",
        Powdery: "Erysiphe cichoracearum"
    },
    Bamboo: {
        Rust: "Dasturella divina",
        Powdery: "Erysiphe berberidicola"
    },
    Rose: {
        Rust: "Phragmidium tuberculatum",
        Powdery: "Podosphaera pannosa"
    },
    Pepper: {
        Rust: "Puccinia psidii",
        Powdery: "Leveillula taurica"
    },
    Papaya: {
        Rust: "Cercospora papayae",
        Powdery: "Oidium caricae"
    },
    Gauva: {
        Rust: "Puccinia psidii",
        Powdery: "Oidium psidii"
    },
    Lemon: {
        Rust: "Puccinia psidii",
        Powdery: "Oidium tingitaninum"
    },
    Nooni: {
        Rust: "Colletotrichum gloeosporioides",
        Powdery: "Erysiphe spp."
    },
    Betel: {
        Rust: "Pucciniales",
        Powdery: "Oidium piperis"
    },
    Ekka: {
        Rust: "Phakopsora calotropidis",
        Powdery: "Erysiphe cruciferarum"
    },
    Avacado: {
        Rust: "Colletotrichum gloeosporioides",
        Powdery: "Oidium perseae-americanae"
    },
    Ganike: {
        Rust: "Tulsi rust specific disease",
        Powdery: "Erysiphe polygoni"
    },
    Henna: {
        Rust: "Puccinia graminis",
        Powdery: "Meliola sp."
    },
    Pappaya: {
        Rust: "Fusarium oxysporum",
        Powdery: "Oidium caricae"
    },
    Geranium: {
        Rust: "Puccinia pelargonii-zonalis",
        Powdery: "Erysiphe communis"
    }
   };



  // Existing code
  if (result2 && result2.length > 0) {
    const plantDetails2 = result2[0]; // Get the top result
    const plantName1 = result1[0];

    

    if (plantDetails2.label === "Healthy") {
        // If the plant is healthy
        resultContainer.innerHTML += `
        <div class='result-container'>
          <p class='text-green-700 font-bold'>Disease Result: Plant is Healthy</p>
        </div>`;
    } 
    
    else if (plantDetails2.label === "Rust" || plantDetails2.label === "Powdery") {

        // Get the stored corresponding rust disease name
        const specificDisease = scientificDisease[plantName1.label][plantDetails2.label];
      
        // Display Rust disease details
        resultContainer.innerHTML += `
            <div class='result-container'>
              <p class='text-red-700 font-bold'>Disease Result: Plant is Unhealthy</p>
              <p class='text-red-700 font-bold'>Type of Disease: ${plantDetails2.label}</p>
              <p class='text-red-700 font-bold'>Specific Disease: <i>${specificDisease}</i></p>
            </div>`;
    }
    
  } else {
    // No matching plant found
    const noResultMsg2 = document.createElement('p');
    noResultMsg2.textContent = 'No Matching Disease found';
    resultContainer.appendChild(noResultMsg2);
  }


}

// Function to create details list for plant details
function createDetailsList(plantDetails) {
  const detailsList = document.createElement('ul');

  for (const key in plantDetails) {
    const listItem = document.createElement('li');
    listItem.textContent = `${key}: ${plantDetails[key]}`;
    detailsList.appendChild(listItem);
  }

  return detailsList;
}

async function predictImage(imageFile) {
  // Create FormData object to send the file
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
      const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error:', error);
      return { error: 'Long Response Time. Try Again' };
  }
}

const inputFile = document.getElementById('fileInput').files[0]; // Assuming file input element has id="fileInput"
if (inputFile) {
  predictImage(inputFile)
      .then(data => {
          console.log('Prediction result:', data);
          // Handle the prediction result here
      })
      .catch(error => {
          console.error('Error:', error);
          // Handle the error here
      });
} else {
  console.error('No file selected');
  // Handle case where no file is selected
}
