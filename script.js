const STORAGE_KEYS = {
  theme: "pulsecare-theme",
  users: "pulsecare-users",
  currentUser: "pulsecare-current-user",
  appointments: "pulsecare-appointments",
  records: "pulsecare-records",
  chats: "pulsecare-chats",
  notifications: "pulsecare-notifications",
  doctors: "pulsecare-doctors"
};

const GOOGLE_CLIENT_ID = "367793017395-a1uc6kgbuh6us5e4kp3nuut5pthtkkuq.apps.googleusercontent.com";

const defaultDoctors = [
  {
  id: "doc-abel",
  name: "Dr. Abel Tesfaye",
  specialty: "General Medicine",
  image: "doctor-photo.jpg",
  bio: "General physician providing diagnosis, treatment, and preventive care for a wide range of health conditions.",
  rating: 4.8
},

  {
  id: "doc-mekdes",
  name: "Dr. Mekdes Tadese",
  specialty: "Psychology",
  image: "mekdi-photo.jpg",
  bio: "Licensed psychologist helping patients with stress, anxiety, depression, and emotional well-being through counseling and therapy.",
  rating: 4.9
}
   ];

const defaultDoctorImageMap = Object.fromEntries(
  defaultDoctors.map((doctor) => [doctor.id, doctor.image])
);

const defaultChat = [
  {
    id: crypto.randomUUID(),
    sender: "doctor",
    text: "Welcome to PulseCare. Share your symptoms or questions and your care team will respond.",
    timestamp: new Date().toISOString()
  }
];

const state = {
  authMode: "login",
  currentUser: null,
  doctors: [],
  users: [],
  appointments: [],
  records: [],
  notifications: [],
  chats: [],
  activeView: "home",
  profileImage: "",
  googleInitialized: false
};

const elements = {
  loadingScreen: document.getElementById("loading-screen"),
  navLinks: document.querySelectorAll(".nav-link"),
  navTargets: document.querySelectorAll("[data-nav-target]"),
  viewSections: document.querySelectorAll(".view-section"),
  heroBookBtn: document.getElementById("hero-book-btn"),
  liveChatSection: document.getElementById("live-chat-section"),
  moreMenuBtn: document.getElementById("more-menu-btn"),
  moreMenu: document.getElementById("more-menu"),
  menuItems: document.querySelectorAll(".menu-item"),
  openAuthBtn: document.getElementById("open-auth-btn"),
  bookingModal: document.getElementById("booking-modal"),
  bookingBackdrop: document.getElementById("booking-backdrop"),
  closeBookingBtn: document.getElementById("close-booking-btn"),
  authModal: document.getElementById("auth-modal"),
  authBackdrop: document.getElementById("auth-backdrop"),
  closeAuthBtn: document.getElementById("close-auth-btn"),
  authTabs: document.querySelectorAll(".auth-tab"),
  authForm: document.getElementById("auth-form"),
  authSubmitBtn: document.getElementById("auth-submit-btn"),
  authFeedback: document.getElementById("auth-feedback"),
  googleAuthLabel: document.getElementById("google-auth-label"),
  googleSigninContainer: document.getElementById("google-signin-container"),
  authName: document.getElementById("auth-name"),
  authRole: document.getElementById("auth-role"),
  authSpecialty: document.getElementById("auth-specialty"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  signupOnlyFields: document.querySelectorAll("[data-signup-only]"),
  doctorGrid: document.getElementById("doctor-grid"),
  specialtyFilter: document.getElementById("specialty-filter"),
  appointmentDoctor: document.getElementById("appointment-doctor"),
  appointmentDate: document.getElementById("appointment-date"),
  appointmentTime: document.getElementById("appointment-time"),
  appointmentSymptoms: document.getElementById("appointment-symptoms"),
  appointmentForm: document.getElementById("appointment-form"),
  appointmentFeedback: document.getElementById("appointment-feedback"),
  dashboardSection: document.getElementById("dashboard-section"),
  dashboardTitle: document.getElementById("dashboard-title"),
  dashboardProfile: document.getElementById("dashboard-profile"),
  profileCard: document.getElementById("profile-card"),
  profileDetails: document.getElementById("profile-details"),
  workspaceItems: document.querySelectorAll(".workspace-item"),
  upcomingAppointments: document.getElementById("upcoming-appointments"),
  pastAppointments: document.getElementById("past-appointments"),
  recordForm: document.getElementById("record-form"),
  recordTitle: document.getElementById("record-title"),
  recordNotes: document.getElementById("record-notes"),
  recordsList: document.getElementById("records-list"),
  notificationsList: document.getElementById("notifications-list"),
  chatWindow: document.getElementById("chat-window"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  profileUpload: document.getElementById("profile-upload"),
  darkModeToggle: document.getElementById("dark-mode-toggle"),
  toastStack: document.getElementById("toast-stack")
};

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedStorage() {
  const storedDoctors = readStorage(STORAGE_KEYS.doctors, null);
  if (!storedDoctors || !storedDoctors.length) {
    writeStorage(STORAGE_KEYS.doctors, defaultDoctors);
  }

  const storedUsers = readStorage(STORAGE_KEYS.users, null);
  if (!storedUsers || !storedUsers.length) {
    writeStorage(STORAGE_KEYS.users, [
      {
        id: crypto.randomUUID(),
        name: "Sara Mamo",
        email: "patient@pulsecare.com",
        password: "patient123",
        role: "Patient",
        specialty: "",
        profileImage: ""
      },
      {
        id: crypto.randomUUID(),
        name: "Dr. Abel Tesfaye",
        email: "doctor@pulsecare.com",
        password: "doctor123",
        role: "Doctor",
        specialty: "Primary Care",
        profileImage: "doctor-photo.jpg"
      }
    ]);
  }

  if (!localStorage.getItem(STORAGE_KEYS.chats)) {
    writeStorage(STORAGE_KEYS.chats, defaultChat);
  }
  if (!localStorage.getItem(STORAGE_KEYS.appointments)) writeStorage(STORAGE_KEYS.appointments, []);
  if (!localStorage.getItem(STORAGE_KEYS.records)) writeStorage(STORAGE_KEYS.records, []);
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) writeStorage(STORAGE_KEYS.notifications, []);
}

function loadState() {
  state.users = readStorage(STORAGE_KEYS.users, []);
  state.doctors = readStorage(STORAGE_KEYS.doctors, defaultDoctors);
  state.appointments = readStorage(STORAGE_KEYS.appointments, []);
  state.records = readStorage(STORAGE_KEYS.records, []);
  state.notifications = readStorage(STORAGE_KEYS.notifications, []);
  state.chats = readStorage(STORAGE_KEYS.chats, defaultChat);
  state.currentUser = readStorage(STORAGE_KEYS.currentUser, null);
}

function normalizeStoredDoctors() {
  state.doctors = state.doctors.map((doctor) => {
    const fallbackImage = defaultDoctorImageMap[doctor.id];
    if (!fallbackImage) return doctor;
    return {
      ...doctor,
      image: doctor.image || fallbackImage
    };
  });
  writeStorage(STORAGE_KEYS.doctors, state.doctors);
}

function persistCoreState() {
  writeStorage(STORAGE_KEYS.users, state.users);
  writeStorage(STORAGE_KEYS.doctors, state.doctors);
  writeStorage(STORAGE_KEYS.appointments, state.appointments);
  writeStorage(STORAGE_KEYS.records, state.records);
  writeStorage(STORAGE_KEYS.notifications, state.notifications);
  writeStorage(STORAGE_KEYS.chats, state.chats);
  writeStorage(STORAGE_KEYS.currentUser, state.currentUser);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  elements.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function emptyState(text) {
  return `<div class="empty-state">${text}</div>`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function initialsFor(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function appointmentDateTime(appointment) {
  return new Date(`${appointment.date}T${convertTimeTo24(appointment.time)}`);
}

function convertTimeTo24(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(Number(hours) + 12);
  return `${hours.padStart(2, "0")}:${minutes}:00`;
}

function ensureDoctorUsersInDirectory() {
  const doctorUsers = state.users
    .filter((user) => user.role === "Doctor")
    .map((user) => ({
      id: user.id,
      name: user.name,
      specialty: user.specialty || "General Practice",
      rating: 4.8,
      image: user.profileImage || "",
      bio: "Registered doctor account on PulseCare."
    }));

  const combined = [...defaultDoctors];
  doctorUsers.forEach((doctor) => {
    if (!combined.some((item) => item.name.toLowerCase() === doctor.name.toLowerCase())) {
      combined.push(doctor);
    }
  });
  state.doctors = combined;
  writeStorage(STORAGE_KEYS.doctors, combined);
}

function renderDoctorOptions() {
  const options = state.doctors
    .map((doctor) => `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`)
    .join("");
  if (elements.appointmentDoctor) {
    elements.appointmentDoctor.innerHTML = options;
  }
  return options;
}

function renderSpecialties() {
  const specialties = [...new Set(state.doctors.map((doctor) => doctor.specialty))].sort();
  elements.specialtyFilter.innerHTML = ["<option value=\"\">Choose a service</option>", ...specialties.map((specialty) => `<option value="${specialty}">${specialty}</option>`)].join("");
}

function renderDoctors() {
  const specialty = elements.specialtyFilter.value;

  if (!specialty) {
    elements.doctorGrid.innerHTML = emptyState("Choose a service to see available doctors.");
    return;
  }

  const filteredDoctors = state.doctors.filter((doctor) => doctor.specialty === specialty);

  if (!filteredDoctors.length) {
    elements.doctorGrid.innerHTML = emptyState("No doctors are available for this service yet.");
    return;
  }

  elements.doctorGrid.innerHTML = filteredDoctors
    .map((doctor) => {
      const avatar = doctor.image
        ? `<img class="doctor-avatar" src="${doctor.image}" alt="${doctor.name}">`
        : `<div class="doctor-initials">${initialsFor(doctor.name)}</div>`;
      return `
        <article class="doctor-card">
          <div class="doctor-card-top">
            ${avatar}
            <span class="rating">? ${doctor.rating.toFixed(1)}</span>
          </div>
          <div>
            <h3>${doctor.name}</h3>
            <p class="section-kicker">${doctor.specialty}</p>
          </div>
          <div class="doctor-meta">
            <span>${doctor.bio}</span>
          </div>
          <button class="btn btn-secondary" data-book-doctor="${doctor.id}">Book doctor</button>
        </article>
      `;
    })
    .join("");
}

function selectedDoctor() {
  return state.doctors.find((doctor) => doctor.id === elements.appointmentDoctor?.value) || state.doctors[0];
}

function updateBookingSummary() {
  return;
}

function hideWorkspacePanels() {
  elements.dashboardSection?.classList.remove("visible-panel");
  elements.liveChatSection?.classList.remove("visible-panel");
  elements.workspaceItems.forEach((item) => item.classList.add("workspace-hidden"));
}

function toggleMoreMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : elements.moreMenu.classList.contains("hidden");
  elements.moreMenu.classList.toggle("hidden", !shouldOpen);
}

function openWorkspacePanel(targetId) {
  hideWorkspacePanels();
  if (targetId === "live-chat-section") {
    elements.liveChatSection?.classList.add("visible-panel");
  } else {
    elements.dashboardSection?.classList.add("visible-panel");
    const workspaceTarget = document.getElementById(targetId);
    workspaceTarget?.classList.remove("workspace-hidden");
  }

  const target = document.getElementById(targetId) || (targetId === "dashboard-section" ? elements.dashboardSection : null);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  toggleMoreMenu(false);
}

function showView(viewName) {
  state.activeView = viewName;
  elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.navTarget === viewName));
  if (viewName === "home" || viewName === "doctors" || viewName === "contact") {
    hideWorkspacePanels();
  } else if (viewName === "dashboard") {
    elements.dashboardSection?.classList.add("visible-panel");
  } else if (viewName === "live-chat") {
    elements.liveChatSection?.classList.add("visible-panel");
  }
  const target = [...elements.viewSections].find((section) => section.dataset.view === viewName);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function syncAuthButton() {
  if (state.currentUser) {
    elements.openAuthBtn.textContent = `Sign out ${state.currentUser.role}`;
  } else {
    elements.openAuthBtn.textContent = "Login / Signup";
  }
}

function applyAuthMode() {
  const signup = state.authMode === "signup";
  elements.authTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === state.authMode));
  elements.signupOnlyFields.forEach((field) => field.classList.toggle("hidden", !signup));
  elements.authSubmitBtn.textContent = signup ? "Create Account" : "Login";
  elements.googleAuthLabel.textContent = signup ? "Sign up with Google" : "Continue with Google";
  elements.authFeedback.textContent = signup
    ? "Create a patient or doctor account. Doctor accounts appear in the directory automatically."
    : "Demo accounts: patient@pulsecare.com / patient123 and doctor@pulsecare.com / doctor123";
  renderGoogleSignIn();
}

function openAuthModal(mode = "login") {
  state.authMode = mode;
  applyAuthMode();
  elements.authModal.classList.remove("hidden");
}

function closeAuthModal() {
  elements.authModal.classList.add("hidden");
  elements.authForm.reset();
  elements.authFeedback.textContent = state.authMode === "signup"
    ? "Create a patient or doctor account. Doctor accounts appear in the directory automatically."
    : "Demo accounts: patient@pulsecare.com / patient123 and doctor@pulsecare.com / doctor123";
}

function validateAuthForm() {
  const email = elements.authEmail.value.trim().toLowerCase();
  const password = elements.authPassword.value.trim();
  if (!email || !password) {
    return "Email and password are required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (state.authMode === "signup") {
    if (!elements.authName.value.trim()) return "Full name is required for signup.";
    if (state.users.some((user) => user.email.toLowerCase() === email)) return "An account with this email already exists.";
  }
  return "";
}

function isGoogleConfigured() {
  return GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID");
}

function formatNameFromEmail(email) {
  const handle = email.split("@")[0] || "google user";
  return handle
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("Missing JWT payload.");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  return JSON.parse(atob(padded));
}

function completeAuth(user, toastMessage) {
  state.currentUser = user;
  persistCoreState();
  populateCurrentUserIntoForm();
  renderEverything();
  closeAuthModal();
  showToast(toastMessage);
  showView("home");
}

function renderGoogleSignIn() {
  if (!elements.googleSigninContainer) return;

  if (window.location.protocol === "file:") {
    elements.googleSigninContainer.innerHTML = "<p class=\"form-hint\">Run this app on <code>http://localhost</code> or HTTPS. Google Sign-In does not work from a <code>file://</code> page.</p>";
    return;
  }

  if (!isGoogleConfigured()) {
    elements.googleSigninContainer.innerHTML = "<p class=\"form-hint\">Add your Google client ID in <code>script.js</code> to enable real Google sign-in.</p>";
    return;
  }

  if (!window.google?.accounts?.id) {
    elements.googleSigninContainer.innerHTML = "<p class=\"form-hint\">Loading Google Sign-In...</p>";
    return;
  }

  if (!state.googleInitialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    state.googleInitialized = true;
  }

  elements.googleSigninContainer.innerHTML = "";
  window.google.accounts.id.renderButton(elements.googleSigninContainer, {
    theme: "outline",
    size: "large",
    shape: "pill",
    text: state.authMode === "signup" ? "signup_with" : "signin_with",
    width: Math.min(elements.googleSigninContainer.offsetWidth || 360, 360)
  });
}

function scheduleGoogleSignInRender() {
  renderGoogleSignIn();
  const retry = setInterval(() => {
    if (!window.google?.accounts?.id) return;
    renderGoogleSignIn();
    clearInterval(retry);
  }, 400);
  setTimeout(() => clearInterval(retry), 4000);
}

function handleSignup() {
  const user = {
    id: crypto.randomUUID(),
    name: elements.authName.value.trim(),
    email: elements.authEmail.value.trim().toLowerCase(),
    password: elements.authPassword.value.trim(),
    role: elements.authRole.value,
    specialty: elements.authSpecialty.value.trim(),
    profileImage: ""
  };
  state.users.push(user);
  state.notifications.unshift({ id: crypto.randomUUID(), text: `Welcome to PulseCare, ${user.name}. Your ${user.role.toLowerCase()} workspace is ready.`, time: new Date().toISOString() });
  ensureDoctorUsersInDirectory();
  completeAuth(user, "Account created successfully.");
}

function handleLogin() {
  const email = elements.authEmail.value.trim().toLowerCase();
  const password = elements.authPassword.value.trim();
  const match = state.users.find((user) => user.email.toLowerCase() === email && user.password === password);
  if (!match) {
    elements.authFeedback.textContent = "Incorrect email or password.";
    return;
  }
  state.notifications.unshift({ id: crypto.randomUUID(), text: `Welcome back, ${match.name}.`, time: new Date().toISOString() });
  completeAuth(match, `Logged in as ${match.role}.`);
}

function handleGoogleCredential(response) {
  try {
    const profile = decodeJwtPayload(response.credential);
    const email = (profile.email || "").trim().toLowerCase();
    if (!email) {
      elements.authFeedback.textContent = "Google sign-in did not return an email address.";
      return;
    }

    const existingUser = state.users.find((user) => user.googleSub === profile.sub || user.email.toLowerCase() === email);

    if (existingUser) {
      existingUser.authProvider = "google";
      existingUser.googleSub = profile.sub;
      existingUser.email = email;
      existingUser.name = existingUser.name || profile.name || formatNameFromEmail(email) || "Google User";
      if (profile.picture && !existingUser.profileImage) existingUser.profileImage = profile.picture;
      state.notifications.unshift({ id: crypto.randomUUID(), text: `Welcome back, ${existingUser.name}.`, time: new Date().toISOString() });
      ensureDoctorUsersInDirectory();
      completeAuth(existingUser, `Google sign-in complete for ${existingUser.role}.`);
      return;
    }

    const role = state.authMode === "signup" ? elements.authRole.value : "Patient";
    const user = {
      id: crypto.randomUUID(),
      name: elements.authName.value.trim() || profile.name || formatNameFromEmail(email) || "Google User",
      email,
      password: "google-oauth",
      role,
      specialty: role === "Doctor" ? elements.authSpecialty.value.trim() : "",
      profileImage: profile.picture || "",
      authProvider: "google",
      googleSub: profile.sub
    };

    state.users.push(user);
    state.notifications.unshift({
      id: crypto.randomUUID(),
      text: `Welcome to PulseCare, ${user.name}. Your ${user.role.toLowerCase()} workspace is ready through Google sign-in.`,
      time: new Date().toISOString()
    });
    ensureDoctorUsersInDirectory();
    completeAuth(user, "Google account connected.");
  } catch (error) {
    elements.authFeedback.textContent = "Google sign-in could not be completed. Check your client ID and authorized origins.";
  }
}

function populateCurrentUserIntoForm() {
  return;
}

function openBookingModal(doctorId) {
  renderDoctorOptions();
  if (doctorId && elements.appointmentDoctor) {
    elements.appointmentDoctor.value = doctorId;
  }
  populateCurrentUserIntoForm();
  if (elements.appointmentFeedback) {
    elements.appointmentFeedback.textContent = "This information will be sent to the doctor dashboard.";
  }
  elements.bookingModal.classList.remove("hidden");
  elements.appointmentSymptoms?.focus();
}

function closeBookingModal() {
  elements.bookingModal.classList.add("hidden");
  elements.appointmentForm.reset();
  populateCurrentUserIntoForm();
}

function relevantAppointments() {
  if (!state.currentUser) return [];
  if (state.currentUser.role === "Doctor") {
    return state.appointments.filter((appointment) => appointment.doctorId === state.currentUser.id || appointment.doctorName === state.currentUser.name);
  }
  return state.appointments.filter((appointment) => appointment.patientEmail === state.currentUser.email);
}

function splitAppointments() {
  const now = new Date();
  const appointments = relevantAppointments();
  const upcoming = [];
  const past = [];
  appointments.forEach((appointment) => {
    if (appointmentDateTime(appointment) >= now) upcoming.push(appointment);
    else past.push(appointment);
  });
  upcoming.sort((a, b) => appointmentDateTime(a) - appointmentDateTime(b));
  past.sort((a, b) => appointmentDateTime(b) - appointmentDateTime(a));
  return { upcoming, past };
}

function renderAppointments() {
  const { upcoming, past } = splitAppointments();
  const appointmentMarkup = (appointment, mode) => `
    <div class="list-item">
      <div class="appointment-title">${mode === "doctor" ? appointment.patientName : appointment.doctorName}</div>
      <div class="appointment-meta">${appointment.specialty} · ${formatDate(appointment.date)} · ${appointment.time}</div>
      <div class="appointment-meta">${appointment.mode} · ${appointment.symptoms}</div>
    </div>
  `;

  const mode = state.currentUser?.role === "Doctor" ? "doctor" : "patient";
  elements.upcomingAppointments.innerHTML = upcoming.length ? upcoming.map((appointment) => appointmentMarkup(appointment, mode)).join("") : emptyState("No upcoming appointments yet.");
  elements.pastAppointments.innerHTML = past.length ? past.map((appointment) => appointmentMarkup(appointment, mode)).join("") : emptyState("No past appointments yet.");
}

function relevantRecords() {
  if (!state.currentUser) return [];
  return state.records.filter((record) => record.ownerEmail === state.currentUser.email || (state.currentUser.role === "Doctor" && record.doctorName === state.currentUser.name));
}

function renderRecords() {
  const records = relevantRecords();
  elements.recordsList.innerHTML = records.length
    ? records
        .slice()
        .reverse()
        .map((record) => `
          <div class="record-item">
            <div class="record-title">${record.title}</div>
            <div class="record-meta">${record.notes}</div>
            <div class="record-meta">${formatDate(record.createdAt)} · ${record.doctorName || "Patient note"}</div>
          </div>
        `)
        .join("")
    : emptyState("No medical records saved yet.");
}

function renderNotifications() {
  const relevant = state.currentUser
    ? state.notifications.filter((note) => !note.email || note.email === state.currentUser.email)
    : [];
  elements.notificationsList.innerHTML = relevant.length
    ? relevant.slice(0, 8).map((note) => `<div class="notification-item">${note.text}<div class="record-meta">${formatDate(note.time)}</div></div>`).join("")
    : emptyState("Notifications will appear here after login and booking.");
}

function renderDashboardProfile() {
  if (!state.currentUser) {
    elements.dashboardProfile.innerHTML = `<strong>Guest mode</strong><span class="record-meta">Login to unlock role-based dashboards.</span>`;
    if (elements.profileDetails) {
      elements.profileDetails.innerHTML = `<div class="list-item"><div class="appointment-title">Guest profile</div><div class="appointment-meta">Login to see your photo and email details.</div></div>`;
    }
    elements.dashboardTitle.textContent = "Your telemedicine workspace.";
    return;
  }

  const avatar = state.currentUser.profileImage
    ? `<img class="doctor-avatar" src="${state.currentUser.profileImage}" alt="${state.currentUser.name}">`
    : `<div class="doctor-initials">${initialsFor(state.currentUser.name)}</div>`;
  elements.dashboardTitle.textContent = state.currentUser.role === "Doctor" ? "Doctor dashboard: manage booked patients and consultation notes." : "Patient dashboard: track consultations, messages, and follow-ups.";
  elements.dashboardProfile.innerHTML = `${avatar}<div><strong>${state.currentUser.name}</strong><div class="record-meta">${state.currentUser.role}${state.currentUser.specialty ? ` · ${state.currentUser.specialty}` : ""}</div></div>`;
  if (elements.profileDetails) {
    elements.profileDetails.innerHTML = `
      <div class="list-item">
        <div class="appointment-title">${state.currentUser.name}</div>
        <div class="appointment-meta">${state.currentUser.email || "No email available"}</div>
      </div>
      <div class="list-item">
        <div class="appointment-title">Role</div>
        <div class="appointment-meta">${state.currentUser.role}${state.currentUser.specialty ? ` · ${state.currentUser.specialty}` : ""}</div>
      </div>
    `;
  }
}

function renderChat() {
  elements.chatWindow.innerHTML = state.chats
    .map((message) => `
      <div class="chat-bubble ${message.sender === "self" ? "self" : "other"}">
        ${message.text}
        <div class="record-meta">${new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    `)
    .join("");
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function renderEverything() {
  syncAuthButton();
  ensureDoctorUsersInDirectory();
  renderDoctorOptions();
  renderSpecialties();
  renderDoctors();
  updateBookingSummary();
  renderDashboardProfile();
  renderAppointments();
  renderRecords();
  renderNotifications();
  renderChat();
}

function handleDoctorBookingClick(event) {
  const button = event.target.closest("[data-book-doctor]");
  if (!button) return;
  openBookingModal(button.dataset.bookDoctor);
  showToast("Doctor selected for booking.");
}

function validateAppointmentForm() {
  const checks = [
    {
      element: elements.appointmentDoctor,
      valid: !!elements.appointmentDoctor.value,
      message: "Please select a doctor."
    },
    {
      element: elements.appointmentDate,
      valid: !!elements.appointmentDate.value,
      message: "Please choose an appointment date."
    },
    {
      element: elements.appointmentTime,
      valid: !!elements.appointmentTime.value,
      message: "Please choose an appointment time."
    },
    {
      element: elements.appointmentSymptoms,
      valid: !!elements.appointmentSymptoms.value.trim(),
      message: "Please describe the symptoms or concern before submitting."
    }
  ];

  const failed = checks.find((check) => !check.valid);
  if (!failed) return "";
  failed.element?.focus();
  return failed.message;
}

function handleAppointmentSubmit(event) {
  event.preventDefault();
  const doctor = selectedDoctor();
  if (!doctor) {
    elements.appointmentFeedback.textContent = "Select a doctor first.";
    return;
  }

  const validationError = validateAppointmentForm();
  if (validationError) {
    elements.appointmentFeedback.textContent = validationError;
    return;
  }

  const appointment = {
    id: crypto.randomUUID(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date: elements.appointmentDate.value,
    time: elements.appointmentTime.value,
    patientName: state.currentUser?.name || "Guest Patient",
    patientEmail: state.currentUser?.email || "guest@pulsecare.local",
    mode: "Live Chat",
    symptoms: elements.appointmentSymptoms.value.trim(),
    createdAt: new Date().toISOString()
  };

  state.appointments.push(appointment);
  state.notifications.unshift({
    id: crypto.randomUUID(),
    email: appointment.patientEmail,
    text: `Appointment booked with ${appointment.doctorName} on ${formatDate(appointment.date)} at ${appointment.time}.`,
    time: new Date().toISOString()
  });
  persistCoreState();
  renderEverything();
  closeBookingModal();
  showToast("Appointment booked.");
  showView("home");
}

function handleRecordSubmit(event) {
  event.preventDefault();
  if (!state.currentUser) {
    showToast("Login to save medical records.");
    openAuthModal("login");
    return;
  }

  const record = {
    id: crypto.randomUUID(),
    ownerEmail: state.currentUser.email,
    doctorName: state.currentUser.role === "Doctor" ? state.currentUser.name : "Self-recorded note",
    title: elements.recordTitle.value.trim(),
    notes: elements.recordNotes.value.trim(),
    createdAt: new Date().toISOString()
  };

  if (!record.title || !record.notes) return;
  state.records.push(record);
  state.notifications.unshift({ id: crypto.randomUUID(), email: state.currentUser.email, text: `Medical record \"${record.title}\" was added.`, time: new Date().toISOString() });
  persistCoreState();
  renderRecords();
  renderNotifications();
  elements.recordForm.reset();
  showToast("Medical record saved.");
}

function sendChatMessage(text, sender = "self") {
  state.chats.push({
    id: crypto.randomUUID(),
    sender,
    text,
    timestamp: new Date().toISOString()
  });
  writeStorage(STORAGE_KEYS.chats, state.chats);
  renderChat();
}

function randomReply(options, fallback) {
  if (!options.length) return fallback;
  const recentDoctorMessages = state.chats
    .filter((message) => message.sender === "doctor")
    .slice(-3)
    .map((message) => message.text);
  const available = options.filter((option) => !recentDoctorMessages.includes(option));
  const pool = available.length ? available : options;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateLiveChatReply(text) {
  const message = text.toLowerCase();

  if (/(hello|hi|selam|hey)/.test(message)) {
    return randomReply([
      "Hello. I am here with you live in chat. Tell me what symptoms you are having.",
      "Hi there. I am online now and ready to help. What would you like to discuss today?",
      "Welcome to live chat. Please share how you are feeling and when the problem started."
    ], "Hello. Please tell me more about your symptoms.");
  }

  if (/(fever|temperature|hot|chills)/.test(message)) {
    return randomReply([
      "I’m sorry you’re dealing with that. Rest, drink plenty of water, and monitor your temperature. Please tell me when the fever started and if you also have chills or body pain.",
      "For fever, try fluids, light clothing, and rest. Let me know how high the temperature is and whether you also have cough, headache, or weakness.",
      "Please monitor your temperature, stay hydrated, and avoid overexertion. If the fever continues or gets worse, please book doctor for more service."
    ], "Please tell me more about the fever, including when it started and how strong it feels.");
  }

  if (/(cough|cold|flu|throat|sore throat|runny nose)/.test(message)) {
    return randomReply([
      "Try warm fluids, rest, and avoid cold air if it makes symptoms worse. Please tell me if the cough is dry or productive and whether you have fever or shortness of breath.",
      "I understand. For cough or cold symptoms, rest and hydration can help. Let me know how long this has been happening and if it is improving or worsening.",
      "Thanks for the update. If symptoms are strong or not improving, please book doctor for more service."
    ], "Please describe your cough or cold symptoms in a little more detail.");
  }

  if (/(pain|headache|stomach|chest|back|hurt|ache)/.test(message)) {
    return randomReply([
      "Please rest the area if possible, drink water, and avoid anything that makes the pain worse. Tell me where the pain is located, how strong it is, and when it started.",
      "I’m here with you. Let me know whether the pain is constant or comes and goes, and what makes it better or worse. If it is strong, please book doctor for more service.",
      "Thanks for explaining. Please share the pain level from 1 to 10 and whether you have any other symptoms with it."
    ], "Please tell me where the pain is and how severe it feels.");
  }

  if (/(medicine|medication|tablet|drug|prescription)/.test(message)) {
    return randomReply([
      "Please tell me the name of the medicine and what you are taking it for. Also avoid changing your dose on your own without advice.",
      "I can help with that. Let me know the medication name, dose, and if you noticed any side effects.",
      "Thanks. Please share whether this is a new medicine or one you have used before. If the reaction is strong, please book doctor for more service."
    ], "Please share the medication name and your question about it.");
  }

  if (/(appointment|book|schedule|time|date|doctor)/.test(message)) {
    return randomReply([
      "Please choose a doctor service from the Doctors section, then use the book doctor option for more service.",
      "You can find a doctor by service first. If you need more help after chat, please book doctor for more service.",
      "Tell me which service you need, and if the case is harder, please book doctor for more service."
    ], "Please choose a doctor service and book doctor for more service if needed.");
  }

  if (/(emergency|urgent|serious|can.t breathe|cannot breathe|breathing|severe)/.test(message)) {
    return randomReply([
      "If this feels severe or you are having trouble breathing, seek urgent in-person care immediately. Please do not wait only in chat.",
      "That may need urgent attention. Please go to the nearest emergency service right away, and after that please book doctor for more service.",
      "For serious symptoms, do not wait in chat alone. Please seek immediate medical help and tell someone near you."
    ], "If this is severe or urgent, please seek immediate in-person medical care.");
  }

  return randomReply([
    "Thanks for the message. Please tell me more about your symptoms, how long they have been happening, and any recent changes. If it feels harder than simple home care, please book doctor for more service.",
    "I’m here live with you. Share a few more details so I can better understand your condition. Rest and hydration are a good start for many mild symptoms.",
    "Please continue. Tell me when this started, what you are feeling now, and whether anything makes it better or worse.",
    "I’m following along. Let me know your main concern and any other symptoms you have noticed. If needed, please book doctor for more service."
  ], "Please tell me more about what you are experiencing.");
}

function handleChatSubmit(event) {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  sendChatMessage(text, "self");
  elements.chatInput.value = "";
  if (state.currentUser) {
    state.notifications.unshift({ id: crypto.randomUUID(), email: state.currentUser.email, text: "Message sent to your care team.", time: new Date().toISOString() });
    persistCoreState();
    renderNotifications();
  }
  window.setTimeout(() => {
    const reply = generateLiveChatReply(text);
    sendChatMessage(reply, "doctor");
    if (state.currentUser) {
      state.notifications.unshift({ id: crypto.randomUUID(), email: state.currentUser.email, text: "New live chat reply from your care team.", time: new Date().toISOString() });
      persistCoreState();
      renderNotifications();
    }
  }, 900);
}

function handleProfileUpload(event) {
  const file = event.target.files[0];
  if (!file || !state.currentUser) {
    if (!state.currentUser) showToast("Login first to upload a profile picture.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.currentUser.profileImage = reader.result;
    const userIndex = state.users.findIndex((user) => user.id === state.currentUser.id);
    if (userIndex >= 0) state.users[userIndex].profileImage = reader.result;
    persistCoreState();
    renderEverything();
    showToast("Profile picture updated.");
  };
  reader.readAsDataURL(file);
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(STORAGE_KEYS.theme, document.body.classList.contains("dark-mode") ? "dark" : "light");
}

function applyStoredTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  document.body.classList.toggle("dark-mode", theme === "dark");
}

function bindEvents() {
  elements.navTargets.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = trigger.dataset.navTarget;
      if (target) showView(target);
    });
  });

  elements.moreMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMoreMenu();
  });

  elements.menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.menuAction === "home") {
        toggleMoreMenu(false);
        showView("home");
        return;
      }
      openWorkspacePanel(item.dataset.panelTarget);
    });
  });

  document.addEventListener("click", (event) => {
    if (elements.moreMenu.classList.contains("hidden")) return;
    if (event.target.closest(".menu-shell")) return;
    toggleMoreMenu(false);
  });

  elements.heroBookBtn.addEventListener("click", () => {
    toggleMoreMenu(true);
  });
  elements.doctorGrid.addEventListener("click", handleDoctorBookingClick);
  elements.specialtyFilter.addEventListener("change", renderDoctors);
  elements.appointmentForm.addEventListener("submit", handleAppointmentSubmit);
  elements.recordForm.addEventListener("submit", handleRecordSubmit);
  elements.chatForm.addEventListener("submit", handleChatSubmit);
  elements.profileUpload.addEventListener("change", handleProfileUpload);
  elements.darkModeToggle.addEventListener("click", toggleTheme);

  elements.openAuthBtn.addEventListener("click", () => {
    if (state.currentUser) {
      if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
      state.currentUser = null;
      writeStorage(STORAGE_KEYS.currentUser, null);
      renderEverything();
      showToast("Signed out.");
      showView("home");
      return;
    }
    openAuthModal("login");
  });

  elements.closeAuthBtn.addEventListener("click", closeAuthModal);
  elements.authBackdrop.addEventListener("click", closeAuthModal);
  elements.closeBookingBtn.addEventListener("click", closeBookingModal);
  elements.bookingBackdrop.addEventListener("click", closeBookingModal);
  elements.authTabs.forEach((tab) => tab.addEventListener("click", () => {
    state.authMode = tab.dataset.authMode;
    applyAuthMode();
  }));

  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = validateAuthForm();
    if (error) {
      elements.authFeedback.textContent = error;
      return;
    }
    if (state.authMode === "signup") handleSignup();
    else handleLogin();
  });
}

function init() {
  seedStorage();
  applyStoredTheme();
  loadState();
  normalizeStoredDoctors();
  ensureDoctorUsersInDirectory();
  bindEvents();
  applyAuthMode();
  scheduleGoogleSignInRender();
  renderEverything();
  populateCurrentUserIntoForm();
  if (state.currentUser) showView("home");
  setTimeout(() => elements.loadingScreen.classList.add("hidden"), 850);
}

init();


