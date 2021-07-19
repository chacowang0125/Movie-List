const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let viewStyle = 'gallery'
let nowPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const pagination = document.querySelector('#paginator')
const selectViewStyle = document.querySelector('#view-style')

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderGalleryMovieList(getMoviesByPage(nowPage))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))

//監聽表單輸入變化，即時搜尋
searchInput.addEventListener('input', onInputSearch)

//選擇資料顯示的模式（卡片/清單模式）
selectViewStyle.addEventListener('click', function (e) {
  if (e.target.matches('.list-view')) {
    renderListMovieList(getMoviesByPage(nowPage))
    viewStyle = 'list'
  } else {
    renderGalleryMovieList(getMoviesByPage(nowPage))
    viewStyle = 'gallery'
  }
})

//點擊按鈕看更多資訊
dataPanel.addEventListener('click', function onPanelClick(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

//點擊分頁顯示頁面
pagination.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  nowPage = e.target.dataset.page
  if (viewStyle === 'list') {
    renderListMovieList(getMoviesByPage(nowPage))
  } else {
    renderGalleryMovieList(getMoviesByPage(nowPage))
  }
})

//add movie to favorite list
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//render cards by list view
function renderListMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-10">
          <div class="card-content d-flex justify-content-around align-items-center border-bottom p-2 m-2">
            <div class="col-sm-8">
              <h4 class="card-title ml-3">${item.title}</h4>
            </div>
            <div class="card-btn col-sm-4 text-center">
              <button class="btn btn-primary btn-show-movie mr-3" data-toggle="modal" data-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">Favorite</button>
            </div>
          </div>
        </div>
      `
  });
  dataPanel.innerHTML = rawHTML
}

//render cards by gallery view
function renderGalleryMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}" 
              class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">Favorite</button>
              </div>
            </div>
          </div>
        </div>
      `
  });
  dataPanel.innerHTML = rawHTML
}

//oninput search 輸入同時搜尋
function onInputSearch() {
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    if (viewStyle === 'list') {
      renderListMovieList(getMoviesByPage(1))
    } else {
      renderGalleryMovieList(getMoviesByPage(1))
    }
    searchInput.value = ''
    return alert('Cannot find Movie with keyword:' + keyword) //如果沒有電影名字符合輸入的字串，跳出視窗警告並回到第一頁
  }

  if (viewStyle === 'list') {
    renderListMovieList(getMoviesByPage(1))
  } else {
    renderGalleryMovieList(getMoviesByPage(1))
  }
  renderPaginator(filteredMovies.length)
}

//show movie modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImg.innerHTML = `<img
      src="${POSTER_URL + data.image}"
      alt="movie-poster" class="img-fluid">`
  })
    .catch((err) => console.log(err))
}

//render paginator
function renderPaginator(amount) {
  const NumberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let pageHTML = ''
  for (let page = 1; page <= NumberOfPages; page++) {
    pageHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  pagination.innerHTML = pageHTML
}

//paginator
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


// 用關鍵字找尋符合的資料(用input事件)
// searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {

//   const keyword = searchInput.value.trim().toLowerCase()
//   event.preventDefault()
//   filteredMovies = movies.filter((movie) =>
//     movie.title.toLowerCase().includes(keyword)
//   )
//如果沒有電影名字符合輸入的字串跳出警告
//   if (filteredMovies.length === 0) {
//     return alert('Cannot find Movie with keyword:' + keyword)
//   }
//   searchInput.value = ''
//   renderPaginator(filteredMovies.length)
//   if (viewStyle === 'list') {
//     renderListMovieList(getMoviesByPage(1))
//   } else {
//     renderGalleryMovieList(getMoviesByPage(1))
//   }
// })