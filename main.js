/*
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
*/

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_SHELF';

function generateId() {
  return +new Date();
}

function generatebookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

 function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const bookshelf of data) {
      books.push(bookshelf);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookList(bookObject) {

  const {id, title, author, year, isCompleted} = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = author;

  const textYear = document.createElement('p');
  textYear.innerText = year;

  const book_shelf = document.createElement('div');
  book_shelf.classList.add('action')
  book_shelf.setAttribute('id', `book-${id}`);

  const articleBook= document.createElement('article');
  articleBook.classList.add('book_item');
  articleBook.append(textTitle, textAuthor, textYear, book_shelf);

  const hapusBuku = document.createElement('button');
  hapusBuku.innerText = 'Hapus buku';
  hapusBuku.classList.add('red');
  hapusBuku.addEventListener('click', function () {
    let confirmHapus = confirm('Hapus buku?');
    if (confirmHapus == true) {
      removeBookFromCompleted(id);
    }
  });

  if (isCompleted) {
    
    const belumSelesai = document.createElement('button');
    belumSelesai.innerText = 'Belum selesai dibaca';
    belumSelesai.classList.add('green');
    belumSelesai.addEventListener('click', function() {
      let confirmBelum = confirm('Pindahkan ke rak "Belum selesai dibaca"?');
      if (confirmBelum == true) {
        undoBookFromCompleted(id);
      }
    });
    
    book_shelf.append(belumSelesai, hapusBuku);
  } else {
    const selesaiDibaca = document.createElement('button');
    selesaiDibaca.innerText = 'Selesai dibaca';
    selesaiDibaca.classList.add('green');
    selesaiDibaca.addEventListener('click', function() {
      let confirmSudah = confirm('Pindahkan ke rak "Selesai dibaca"?')
      if (confirmSudah == true) {
        addBookToCompleted(id);
      }
    });

    book_shelf.append(selesaiDibaca, hapusBuku);
  }

  return articleBook;
}

function check() {
  if (document.getElementById("inputBookIsComplete").checked == true) {
    return true;
  } else {
    return false;
  }
}

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const bookComplete = check();

  const generatedID = generateId();
  const bookObject = generatebookObject(generatedID, bookTitle, bookAuthor, bookYear, bookComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {

  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function search() {
  const searchBook = document.getElementById("searchBookTitle");
  const filter = searchBook.value.toUpperCase();
  const bookItem = document.querySelectorAll("section.book_shelf > .book_list > .book_item");
  for (let i = 0; i < bookItem.length; i++) {
      txtValue = bookItem[i].textContent || bookItem[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
          bookItem[i].style.display = "";
      } else {
          bookItem[i].style.display = "none";
      }
  }
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm = document.getElementById('inputBook');
  const inputSearchBook = document.getElementById("searchBook");

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  inputSearchBook.addEventListener("keyup", function (event) {
    event.preventDefault();
    search();
  });

  inputSearchBook.addEventListener("submit", function (event) {
    event.preventDefault();
    search();
  })

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBook = document.getElementById('incompleteBookshelfList');
  const listCompleted = document.getElementById('completeBookshelfList');

  incompleteBook.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBookList(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      incompleteBook.append(bookElement);
    }
  }
});
