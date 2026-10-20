
var addContactBtn = document.getElementById("addContactBtn");
var contactModal = document.getElementById("contactModal");
var modalTitle = document.getElementById("modalTitle");
var closeModalBtn = document.getElementById("closeModalBtn");
var cancelModalBtn = document.getElementById("cancelModalBtn");
var submitModalBtn = document.getElementById("submitModalBtn");

var contactForm = document.getElementById("contactForm");
var contactId = document.getElementById("contactId");

var contactName = document.getElementById("contactName");
var contactPhone = document.getElementById("contactPhone");
var contactEmail = document.getElementById("contactEmail");
var contactAddress = document.getElementById("contactAddress");
var contactGroup = document.getElementById("contactGroup");
var contactNotes = document.getElementById("contactNotes");

var contactsFound = document.querySelector(".contacts-found");
var contactFavorite = document.getElementById("contactFavorite");
var contactEmergency = document.getElementById("contactEmergency");

var avatarInput = document.getElementById("avatarInput");
var avatarPreview = document.getElementById("avatarPreview");
var avatarPath = document.getElementById("avatarPath");

var searchInput = document.getElementById("searchInput");
var contactCardContainer = document.getElementById("contactCardContainer");

var totalContacts = document.getElementById("totalContacts");
var totalFavContacts = document.getElementById("totalFavContacts");
var totalEmergencyContacts = document.getElementById("totalEmergencyContacts");
var totalContactsSpan = document.getElementById("totalContactsSpan");

var bigFavItem = document.getElementById("bigFavItem");
var emptyStateFav = document.getElementById("emptyStateFav");
var smallFavItem = document.getElementById("smallFavItem");

var bigEmergencyItem = document.getElementById("bigEmergencyItem");
var emptyStateEmergency = document.getElementById("emptyStateEmergency");
var smallEmergncyItem = document.getElementById("smallEmergncyItem");

var contactNameError = document.getElementById("contactNameError");
var contactPhoneError = document.getElementById("contactPhoneError");
var contactEmailError = document.getElementById("contactEmailError");

var nameRegex = /^[a-zA-Z\u0600-\u06FF ]{2,}$/;
var phoneRegex = /^01[0125][0-9]{8}$/;
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var contacts = [];

try {
  var savedContacts = JSON.parse(localStorage.getItem("contacts"));

  if (Array.isArray(savedContacts)) {
    contacts = savedContacts.map(function (contact) {
      return {
        ...contact,
        favorite: contact.favorite === true,
        emergency: contact.emergency === true,
        avatar: contact.avatar || ""
      };
    });
  }
} catch (error) {
  contacts = [];
}

function openModal() {
  clearInput();

  contactId.value = "";
  modalTitle.textContent = "Add New Contact";
  submitModalBtn.textContent = "Save Contact";

  contactModal.classList.remove("d-none");
  contactModal.classList.add("d-flex");
}

function closeModal() {
  contactModal.classList.remove("d-flex");
  contactModal.classList.add("d-none");
}

if (addContactBtn) {
  addContactBtn.addEventListener("click", openModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener("click", closeModal);
}

if (submitModalBtn) {
  submitModalBtn.addEventListener("click", function (event) {
    event.preventDefault();
    getContactData();
  });
}

function getContactData() {
  var newName = contactName.value.trim();
  var newPhone = contactPhone.value.trim();
  var newEmail = contactEmail.value.trim();
  var oldPhone = contactId.value;

  if (newName === "") {
    Swal.fire({
      icon: "error",
      title: "Missing Name",
      text: "Please enter a name for the contact!"
    });
    return;
  }

  if (!nameRegex.test(newName)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Name",
      text: "Name should contain only letters and spaces (at least 2 characters)."
    });
    return;
  }

  if (newPhone === "") {
    Swal.fire({
      icon: "error",
      title: "Missing Phone",
      text: "Please enter a phone number!"
    });
    return;
  }

  if (!phoneRegex.test(newPhone)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Phone",
      text: "Please enter a valid Egyptian mobile number."
    });
    return;
  }

  if (newEmail !== "" && !emailRegex.test(newEmail)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address."
    });
    return;
  }

  var duplicateNameContact = contacts.find(function (item) {
    return (
      item.name.trim().toLowerCase() === newName.toLowerCase() &&
      item.phone !== oldPhone
    );
  });

  var duplicatePhoneContact = contacts.find(function (item) {
    return item.phone === newPhone && item.phone !== oldPhone;
  });

  var duplicateEmailContact = contacts.find(function (item) {
    return (
      newEmail !== "" &&
      (item.email || "").trim().toLowerCase() === newEmail.toLowerCase() &&
      item.phone !== oldPhone
    );
  });

  if (duplicatePhoneContact) {
    Swal.fire({
      icon: "error",
      title: "Duplicate Phone",
      text: "A contact with this phone number already exists: " +
        duplicatePhoneContact.name
    });
    return;
  }

  if (duplicateEmailContact) {
    Swal.fire({
      icon: "error",
      title: "Duplicate Email",
      text: "A contact with this email already exists: " +
        duplicateEmailContact.name
    });
    return;
  }

  if (duplicateNameContact) {
    Swal.fire({
      icon: "error",
      title: "Duplicate Name",
      text: "A contact with this name already exists: " +
        duplicateNameContact.name
    });
    return;
  }

  var oldContact = contacts.find(function (item) {
    return item.phone === oldPhone;
  });

  var contact = {
    name: newName,
    phone: newPhone,
    email: newEmail,
    address: contactAddress.value.trim(),
    group: contactGroup.value,
    notes: contactNotes.value.trim(),
    favorite: contactFavorite.checked,
    emergency: contactEmergency.checked,
    avatar: oldContact ? oldContact.avatar || "" : ""
  };

  var avatarFile = avatarInput.files[0];

  if (avatarFile) {
    var reader = new FileReader();

    reader.onload = function () {
      contact.avatar = reader.result;
      saveContact(contact, oldPhone);
    };

    reader.onerror = function () {
      Swal.fire({
        icon: "error",
        title: "Image Error",
        text: "Could not read the selected image."
      });
    };

    reader.readAsDataURL(avatarFile);
  } else {
    saveContact(contact, oldPhone);
  }
}

function saveContact(contact, oldPhone) {
  var oldIndex = -1;

  if (oldPhone) {
    oldIndex = contacts.findIndex(function (item) {
      return item.phone === oldPhone;
    });
  }

  var previousContacts = contacts.slice();

  if (oldIndex !== -1) {
    contacts[oldIndex] = contact;
  } else {
    contacts.push(contact);
  }

  if (!saveToLocalStorage(previousContacts)) {
    return;
  }

  renderAllContacts();
  clearInput();
  closeModal();

  Swal.fire({
    icon: "success",
    title: oldIndex !== -1 ? "Contact Updated!" : "Contact Added!",
    text: oldIndex !== -1
      ? "Contact updated successfully."
      : "Contact added successfully.",
    timer: 1500,
    showConfirmButton: false
  });
}

function saveToLocalStorage(previousContacts) {
  try {
    localStorage.setItem("contacts", JSON.stringify(contacts));
    return true;
  } catch (error) {
    contacts = previousContacts;

    Swal.fire({
      icon: "error",
      title: "Storage Error",
      text: "Could not save the contact. Try choosing a smaller image."
    });

    renderAllContacts();
    return false;
  }
}

function displayContacts(contact) {
  var cardColumn = document.createElement("div");

  cardColumn.className = "col-md-6 col-lg-12 col-xl-6 mb-4";

  cardColumn.innerHTML = `
    <div class="contact-card">
      <div class="contact-card-header">
        <div class="d-flex align-items-start justify-content-start gap-3">
          <div class="position-relative flex-shrink-0">
            <img
              src="${escapeHTML(contact.avatar || "")}"
              alt="${escapeHTML(contact.name)}"
              class="contact-card-avatar object-fit-cover"
            />

            <div class="badge-icon badge-heart d-flex justify-content-center align-items-center rounded-circle ${contact.emergency ? "" : "d-none"}">
              <i class="fas fa-heart-pulse"></i>
            </div>

            <div class="badge-icon badge-star d-flex justify-content-center align-items-center rounded-circle ${contact.favorite ? "" : "d-none"}">
              <i class="fas fa-star"></i>
            </div>
          </div>

          <div class="flex-1 min-w-0 pt-1">
            <h3 class="contact-card-name truncate m-0">
              ${escapeHTML(contact.name)}
            </h3>

            <div class="d-flex align-items-center gap-2 mt-1">
              <div class="contact-card-phone-container flex-shrink-0">
                <i class="contact-card-phone-icon fas fa-phone"></i>
              </div>

              <span class="contact-card-phone truncate">
                ${escapeHTML(contact.phone)}
              </span>
            </div>
          </div>
        </div>

        <div class="contact-details">
          <div class="contact-detail-item">
            <div class="contact-detail-icon-container d-flex align-items-center justify-content-center violet">
              <i class="contact-detail-icon violet fas fa-envelope"></i>
            </div>

            <span class="contact-detail-text truncate">
              ${escapeHTML(contact.email || "")}
            </span>
          </div>

          <div class="contact-detail-item">
            <div class="contact-detail-icon-container d-flex align-items-center justify-content-center emerald">
              <i class="contact-detail-icon emerald fas fa-location-dot"></i>
            </div>

            <span class="contact-detail-text truncate">
              ${escapeHTML(contact.address || "")}
            </span>
          </div>
        </div>

        <div class="contact-tags">
          <span class="contact-tag d-inline-flex align-items-center">
            ${escapeHTML(contact.group || "")}
          </span>
        </div>
      </div>

      <div class="contact-card-actions">
        <div class="action-buttons-left">
          <a
            href="tel:${escapeHTML(contact.phone)}"
            class="action-button call"
            title="Call"
          >
            <i class="fas fa-phone"></i>
          </a>

          <a
            href="mailto:${escapeHTML(contact.email || "")}"
            class="action-button email"
            title="Email"
          >
            <i class="fas fa-envelope"></i>
          </a>
        </div>

        <div class="action-buttons-right">
          <button type="button" class="action-button favorite" title="Favorite">
            <i class="${contact.favorite ? "fas" : "far"} fa-star"></i>
          </button>

          <button type="button" class="action-button emergency" title="Emergency">
            <i class="${contact.emergency ? "fas" : "far"} fa-heart"></i>
          </button>

          <button type="button" class="action-button edit" title="Edit">
            <i class="fas fa-pen"></i>
          </button>

          <button type="button" class="action-button delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  contactCardContainer.appendChild(cardColumn);
}

function renderAllContacts() {
  if (!contactCardContainer) return;

  contactCardContainer.innerHTML = "";

  var searchValue = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  var filteredContacts = contacts.filter(function (contact) {
    var name = (contact.name || "").toLowerCase();
    var phone = (contact.phone || "").toLowerCase();
    var email = (contact.email || "").toLowerCase();

    return (
      name.includes(searchValue) ||
      phone.includes(searchValue) ||
      email.includes(searchValue)
    );
  });

  filteredContacts.forEach(function (contact) {
    displayContacts(contact);
  });

  updateContactStats(filteredContacts.length, searchValue);
  renderFavoriteAndEmergencyLists();
}

function updateContactStats(filteredCount, searchValue) {
  var favorites = contacts.filter(function (contact) {
    return contact.favorite === true;
  });

  var emergencies = contacts.filter(function (contact) {
    return contact.emergency === true;
  });

  if (totalContacts) {
    totalContacts.textContent = contacts.length;
  }

  if (totalFavContacts) {
    totalFavContacts.textContent = favorites.length;
  }

  if (totalEmergencyContacts) {
    totalEmergencyContacts.textContent = emergencies.length;
  }

  if (totalContactsSpan) {
    totalContactsSpan.textContent = contacts.length;
  }

  if (contactsFound) {
    var showMessage = contacts.length === 0 ||
      (searchValue !== "" && filteredCount === 0);

    contactsFound.classList.toggle("d-block", showMessage);
    contactsFound.classList.toggle("d-none", !showMessage);

    contactsFound.textContent =
      searchValue !== "" && filteredCount === 0
        ? "No contacts found. Try another name, phone, or email."
        : "No contacts yet. Add your first contact!";
  }

  if (emptyStateFav) {
    emptyStateFav.classList.toggle("d-block", favorites.length === 0);
    emptyStateFav.classList.toggle("d-none", favorites.length !== 0);
  }

  if (emptyStateEmergency) {
    emptyStateEmergency.classList.toggle("d-block", emergencies.length === 0);
    emptyStateEmergency.classList.toggle("d-none", emergencies.length !== 0);
  }
}

function renderFavoriteAndEmergencyLists() {
  var favorites = contacts.filter(function (contact) {
    return contact.favorite === true;
  });

  var emergencies = contacts.filter(function (contact) {
    return contact.emergency === true;
  });

  if (bigFavItem) {
    bigFavItem.innerHTML = "";
    favorites.forEach(function (contact) {
      bigFavItem.appendChild(createMiniContact(contact));
    });
  }

  if (smallFavItem) {
    smallFavItem.innerHTML = "";
    favorites.forEach(function (contact) {
      smallFavItem.appendChild(createMiniContact(contact));
    });
  }

  if (bigEmergencyItem) {
    bigEmergencyItem.innerHTML = "";
    emergencies.forEach(function (contact) {
      bigEmergencyItem.appendChild(createMiniContact(contact));
    });
  }

  if (smallEmergncyItem) {
    smallEmergncyItem.innerHTML = "";
    emergencies.forEach(function (contact) {
      smallEmergncyItem.appendChild(createMiniContact(contact));
    });
  }
}

function createMiniContact(contact) {
  var item = document.createElement("div");

  item.className = "mini-contact d-flex align-items-center gap-2";

  item.innerHTML = `
    <img
      src="${escapeHTML(contact.avatar || "")}"
      alt="${escapeHTML(contact.name)}"
      class="rounded-circle object-fit-cover"
      width="42"
      height="42"
    />

    <div class="min-w-0 flex-grow-1">
      <div class="fw-semibold text-truncate">${escapeHTML(contact.name)}</div>
      <div class="small text-truncate">${escapeHTML(contact.phone)}</div>
    </div>
  `;

  return item;
}

if (contactCardContainer) {
  contactCardContainer.addEventListener("click", function (event) {
    var favoriteBtn = event.target.closest(".favorite");
    var emergencyBtn = event.target.closest(".emergency");

    if (!favoriteBtn && !emergencyBtn) return;

    var card = event.target.closest(".contact-card");
    if (!card) return;

    var phoneElement = card.querySelector(".contact-card-phone");
    if (!phoneElement) return;

    var phone = phoneElement.textContent.trim();

    var contact = contacts.find(function (item) {
      return item.phone === phone;
    });

    if (!contact) return;

    var previousContacts = contacts.slice();

    if (favoriteBtn) {
      contact.favorite = !contact.favorite;
    }

    if (emergencyBtn) {
      contact.emergency = !contact.emergency;
    }

    if (!saveToLocalStorage(previousContacts)) return;

    renderAllContacts();
  });

  contactCardContainer.addEventListener("click", function (event) {
    var editBtn = event.target.closest(".edit");
    if (!editBtn) return;

    var card = editBtn.closest(".contact-card");
    if (!card) return;

    var phoneElement = card.querySelector(".contact-card-phone");
    if (!phoneElement) return;

    var phone = phoneElement.textContent.trim();

    var contact = contacts.find(function (item) {
      return item.phone === phone;
    });

    if (!contact) return;

    contactId.value = contact.phone;
    contactName.value = contact.name || "";
    contactPhone.value = contact.phone || "";
    contactEmail.value = contact.email || "";
    contactAddress.value = contact.address || "";
    contactGroup.value = contact.group || "";
    contactNotes.value = contact.notes || "";

    contactFavorite.checked = contact.favorite === true;
    contactEmergency.checked = contact.emergency === true;

    if (avatarPreview) {
      avatarPreview.src = contact.avatar || "";
    }

    if (avatarPath) {
      avatarPath.value = "";
    }

    modalTitle.textContent = "Edit Contact";
    submitModalBtn.textContent = "Save Changes";

    contactModal.classList.remove("d-none");
    contactModal.classList.add("d-flex");
  });

  contactCardContainer.addEventListener("click", function (event) {
    var deleteBtn = event.target.closest(".delete");
    if (!deleteBtn) return;

    var card = deleteBtn.closest(".contact-card");
    if (!card) return;

    var phoneElement = card.querySelector(".contact-card-phone");
    if (!phoneElement) return;

    var phone = phoneElement.textContent.trim();

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this contact?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then(function (result) {
      if (!result.isConfirmed) return;

      var previousContacts = contacts.slice();

      contacts = contacts.filter(function (contact) {
        return contact.phone !== phone;
      });

      if (!saveToLocalStorage(previousContacts)) return;

      renderAllContacts();

      Swal.fire({
        title: "Deleted!",
        text: "Contact deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderAllContacts);
}

function clearInput() {
  if (contactForm) {
    contactForm.reset();
  }

  contactName.value = "";
  contactPhone.value = "";
  contactEmail.value = "";
  contactAddress.value = "";
  contactGroup.value = "";
  contactNotes.value = "";

  contactFavorite.checked = false;
  contactEmergency.checked = false;

  if (contactId) {
    contactId.value = "";
  }

  if (avatarInput) {
    avatarInput.value = "";
  }

  if (avatarPath) {
    avatarPath.value = "";
  }

  if (avatarPreview) {
    avatarPreview.src = "";
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    var entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

renderAllContacts();
