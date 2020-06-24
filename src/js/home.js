

// const getUser = new Promise(function(todoBien, todoMal) {
//   //llamar api
//   setTimeout (function() {
//     todoMal("Los datos de usuario no coinciden");
//   }, 3000);
// })

// getUser
//   .then(function(){
//     alert("todo esta amigo")
//   })
//   .catch(function(mensajenocoincide) {
//     alert(mensajenocoincide)
//   });

(async function load() {
  async function getData(url){
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.movie_count > 0) {
      return data;
    }
    throw new Error("No se encontro ningún resultado");
  }

  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  const BASE_API = "https://yts.mx/api/v2/";
  const $form = document.querySelector("#form");
  const $featuringcontainer = document.getElementById("featuring");
  
  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    $home.classList.add("search-active");
    
    const $loader = document.createElement("img");
    setAttributes($loader, {
      src: "src/images/loader.gif",
      height: 50,
      width: 50,
    })
    
    $featuringcontainer.append($loader);

    const data = new FormData($form);
    try {
      const {
        data: {
          movies:peli
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get("name")}`)
      const HTMLString = featuringTemplate(peli[0]);
      $featuringcontainer.innerHTML = HTMLString;
    } catch(error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove("search-active");
    }

  })
  
  const $home = document.querySelector("#home");
  
  const $overlay = document.querySelector("#overlay");
  const $modal = document.getElementById("modal");
  const $hideModal = document.querySelector("#hide-modal");
  
  const $modalTitle = $modal.querySelector("h1");
  const $modalImage = $modal.querySelector("img");
  const $modalDescription = $modal.querySelector("p");

  
  

  function videoTemplate(movie, category) {
    return (
    `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlaylistItem-image">
        
        <img src="${movie.medium_cover_image}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${movie.title}
      </h4>
    </div>`
    )
    
  }

  function featuringTemplate (peli) {
    return (
        `<div class="featuring">
          <div class="featuring-image">
            <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
          </div>
          <div class="featuring-content">
            <p class="featuring-title">Pelicula Encontrada</p>
            <p class="featuring-album">${peli.title}</p>
          </div>
        </div>`
    )
  }

  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function showModal($element) {
    $overlay.classList.add("active");
    $modal.style.animation = "modalIn .8s forwards";
  }

  $hideModal.addEventListener("click", ()=>{
    $overlay.classList.remove("active");
    $modal.style.animation = "modalOut .8s forwards";
  })


  function findIdMovie(list, id) {
    return list.find((movie) =>
          { 
            return movie.id === parseInt(id, 10);
          })
        }
  
  function findMovie(id, category) {
    switch (category) {
      case "action" : {
        return findIdMovie(actionList, id);
        }
      case "drama" : {
        return findIdMovie(dramaList, id);
        }
      default: {
        return findIdMovie(animationList, id);
        }   
      }
    }
  

  function addEventClick($element) {
    $element.addEventListener("click", () => {
      showModal($element);
      const id = $element.dataset.id;
      const category = $element.dataset.category;
      const data = findMovie(id, category);
      
      $modalTitle.textContent = data.title;
      $modalImage.setAttribute("src", data.medium_cover_image);
      $modalDescription.textContent = data.description_full;
    })
  }

  function renderList(list, $container, category) {
    $container.children[0].remove();
    list.forEach((movie) => {
      
      const HTMLString = videoTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector("img");
      image.addEventListener("load", (event) => {
        event.srcElement.classList.add("fadeIn");
      })
      addEventClick(movieElement);      
    })
  }

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);

    if (cacheList) {
      return JSON.parse(cacheList);
    }
      const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
      window.localStorage.setItem(listName, JSON.stringify(data));
      return data;
    
  }

  const $actioncontainer = document.querySelector("#action");
  const actionList = await cacheExist("action");
  renderList(actionList, $actioncontainer, "action"); 
  
  const $dramacontainer = document.querySelector("#drama");
  const dramaList = await cacheExist("drama");
  renderList(dramaList, $dramacontainer, "drama");
  
  const $animationcontainer = document.querySelector("#animation");
  const animationList = await cacheExist("animation");
  renderList(animationList, $animationcontainer, "animation");

  
  
  
  })()
