document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Zenith Bookstore JavaScript loaded!");

  const API_URL = "https://bookstore-api-six.vercel.app/api/books";

  const featuredBooksContainer = document.getElementById("featured-books");
  const apiBooksContainer = document.getElementById("api-books");

  const modal = document.getElementById("add-book-modal");
  const openModalBtn = document.getElementById("open-add-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const addBookForm = document.getElementById("add-book-form");

  // Track user-added books separately
  let userAddedBooks = [];

  if (openModalBtn && modal) {
    openModalBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.classList.add("hidden");
    });
  }

  function capitalizeWords(text) {
    if (!text) return "";
    return text
      .toString()
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");
  }

  function getGenreImage(genre) {
    const genreImages = {
      fantasy: "images/fantasy.png",
      romance: "images/romance.png",
      horror: "images/horror.png",
      adventure: "images/adventure.png",
      mystery: "images/mystery.png",
      "sci-fi": "images/scifi.png",
      scifi: "images/scifi.png",
      factual: "images/adventure.png",
    };
    const key = (genre || "").toLowerCase();
    return genreImages[key] || genreImages.fantasy;
  }

  function createFeaturedCard(book) {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${getGenreImage(book.genre)}" alt="${capitalizeWords(book.genre)} book cover" class="book-cover-img">
      <div class="book-info">
        <h3 class="book-title">${book.title || "Untitled"}</h3>
        <p class="book-author">by ${book.author || "Unknown Author"}</p>
      </div>
    `;
    return card;
  }

  function createRecentCard(book) {
    const card = document.createElement("div");
    card.className = "book-card";
    const id = book._id || book.id;
    card.innerHTML = `
      <div class="p-4 border rounded-xl shadow-sm bg-white">
        <h3 class="text-lg font-semibold">${book.title || "Untitled"}</h3>
        <p class="text-sm text-gray-500">by ${book.author || "Unknown Author"}</p>
        <p class="text-sm mt-2">${capitalizeWords(book.genre) || "Genre: Unknown"}</p>
        <button class="delete-book-btn mt-3" data-id="${id}">
          Delete Book
        </button>
      </div>
    `;
    return card;
  }

  function fetchFeaturedBooks() {
    console.log("📚 Loading featured books...");
    const sampleBooks = [
      { id: 1, title: "Conquest of Flames", author: "Shawn García", genre: "fantasy" },
      { id: 2, title: "Hidden Love", author: "Ndemi Otieno", genre: "romance" },
      { id: 3, title: "The Haunting of Abandoned Manor", author: "Lars Peeters", genre: "horror" },
      { id: 4, title: "The Last Day", author: "Jane Smith", genre: "sci-fi" },
    ];
    featuredBooksContainer.innerHTML = "";
    sampleBooks.forEach((book) => featuredBooksContainer.appendChild(createFeaturedCard(book)));
    console.log("✅ Featured books loaded!");
  }

  function displayRecentBooks() {
    apiBooksContainer.innerHTML = "";

    // Default books (no delete button - they aren't in the API)
    const defaultBooks = [
      { id: "r1", title: "The Midnight Library", author: "Matt Haig", genre: "Horror" },
      { id: "r2", title: "Journey to Nowhere", author: "James Clear", genre: "Adventure" },
      { id: "r3", title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery" },
      { id: "r4", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" },
    ];

    // Show default books first (no delete button)
    defaultBooks.forEach((book) => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <div class="p-4 border rounded-xl shadow-sm bg-white">
          <h3 class="text-lg font-semibold">${book.title}</h3>
          <p class="text-sm text-gray-500">by ${book.author}</p>
          <p class="text-sm mt-2">${book.genre}</p>
        </div>
      `;
      apiBooksContainer.appendChild(card);
    });

    // Show user-added books with delete button
    userAddedBooks.forEach((book) => {
      apiBooksContainer.appendChild(createRecentCard(book));
    });
  }

  // Delete button click handler
  apiBooksContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-book-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    const ok = confirm("Delete this book?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      // Remove from userAddedBooks array
      userAddedBooks = userAddedBooks.filter((b) => String(b._id || b.id) !== String(id));

      // Refresh display
      displayRecentBooks();
      console.log("✅ Book deleted!");
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("Error deleting book. Check console.");
    }
  });

  // Add book form handler
  addBookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const genre = document.getElementById("book-genre").value;
    const description = document.getElementById("book-description").value.trim();

    if (!title || !author || !genre || !description) {
      alert("Please fill out all fields.");
      return;
    }

    const newBook = {
      title,
      author,
      genre,
      description,
      isbn: `ISBN-${Date.now()}`,
      publishedDate: new Date().toISOString().split("T")[0],
      publisher: "Zenith Bookstore",
      pageCount: 300,
      language: "English",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Get the book back from API with its real ID
      const savedBook = await response.json();
      console.log("✅ Book added to API:", savedBook);

      // Add to our userAddedBooks list
      userAddedBooks.push(savedBook);

      // Refresh display to show new book
      displayRecentBooks();

      addBookForm.reset();
      modal.classList.add("hidden");

      alert(`✅ "${title}" has been added!`);
    } catch (error) {
      console.error("❌ Error adding book:", error);
      alert("Error adding book. Check console.");
    }
  });

  fetchFeaturedBooks();
  displayRecentBooks();
});