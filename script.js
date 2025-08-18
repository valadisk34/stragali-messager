const serverURL = "https://script.google.com/macros/s/AKfycbyhJXHqrV6ohJ5u273r9T6ykz4ug3lxAIJ-A8IF1VNpwIUye69Funb6qT4j7jK6r7EbCA/exec";
let currentUser = null;

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(serverURL, {
    method: "POST",
    body: JSON.stringify({action:"login", username, password})
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      currentUser = {username, password};
      document.getElementById("login").style.display = "none";
      document.getElementById("chat").style.display = "flex";
      loadMessages();
    } else {
      showNotification("Λάθος στοιχεία!");
    }
  });
}

function register() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(serverURL, {
    method: "POST",
    body: JSON.stringify({action:"register", username, password})
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      showNotification("Εγγραφήκατε επιτυχώς, κάντε login!");
    } else {
      showNotification(data.message || "Σφάλμα στην εγγραφή.");
    }
  });
}

function loadMessages() {
  if (!currentUser) return;
  fetch(`${serverURL}?username=${currentUser.username}&password=${currentUser.password}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("messages");
      container.innerHTML = "";
      if (!Array.isArray(data)) {
        container.innerHTML = `<p style="text-align:center; color:gray;">Please login to send and view messages.</p>`;
        return;
      }
      data.forEach(row => {
        let time = new Date(row[0]).toLocaleString(); // ημερομηνία + ώρα
        container.innerHTML += `<div class="message"><b>${row[1]}</b>: ${row[2]} <small>${time}</small> <span class="delete-circle" onclick="deleteMessage('${row[3]}')">🔴</span></div>`;
      });
      container.scrollTop = container.scrollHeight;
    });
}

function sendMessage() {
  if (!currentUser) return;
  const message = document.getElementById("message").value;
  if (!message) {
    showNotification("Παρακαλώ εισάγετε μήνυμα");
    return;
  }

  fetch(serverURL, {
    method: "POST",
    body: JSON.stringify({
      username: currentUser.username,
      password: currentUser.password,
      message
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      document.getElementById("message").value = "";
      loadMessages();
    } else {
      showNotification("Λάθος στοιχεία!");
    }
  });
}

function deleteMessage(id) {
  if (!currentUser) return;
  fetch(serverURL, {
    method: "POST",
    body: JSON.stringify({
      action:"deleteMessage",
      username: currentUser.username,
      password: currentUser.password,
      id
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      showNotification("Μήνυμα διαγράφηκε");
      loadMessages();
    } else {
      showNotification("Δεν μπορεί να διαγραφεί.");
    }
  });
}

setInterval(loadMessages, 3000);

// Emergency Delete Popup
document.querySelector(".delete-btn").addEventListener("click", () => {
  document.getElementById("deletePopup").style.display = "flex";
});

function closeDeletePopup() {
  document.getElementById("deletePopup").style.display = "none";
}

function confirmDelete() {
  const pass = document.getElementById("deletePassword").value;
  fetch(serverURL, {
    method: "POST",
    body: JSON.stringify({action: "emergencyDelete", password: pass})
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("Η συνομιλία διαγράφηκε, ο κωδικός άλλαξε και η συνομιλία κλειδώθηκε.");
      location.reload();
    } else {
      showNotification("Λάθος κωδικός!");
    }
    closeDeletePopup();
  });
}


