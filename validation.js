document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("brasa-form");
  if (!form) {
    return;
  }

  const fields = {
    nombre_completo: document.getElementById("nombre_completo"),
    email: document.getElementById("email"),
    telefono: document.getElementById("telefono"),
    pais: document.getElementById("pais"),
    ciudad: document.getElementById("ciudad"),
    ubicacion_favorita: document.getElementById("ubicacion_favorita"),
    como_nos_conociste: document.getElementById("como_nos_conociste"),
    fecha_nacimiento: document.getElementById("fecha_nacimiento"),
    acepta_terminos: document.getElementById("acepta_terminos")
  };

  const successMessage = document.getElementById("mensaje-exito");

  const ERROR_MESSAGES = {
    nombre_completo: "Ingresa tu nombre completo (nombre y apellido)",
    email: "Ingresa un email válido (ejemplo: nombre@correo.com)",
    telefono: "El teléfono debe incluir código de país (ejemplo: +57 300 123 4567 o +1 305 123 4567)",
    pais: "Selecciona tu país",
    ciudad: "Selecciona tu ciudad",
    como_nos_conociste: "Cuéntanos cómo conociste Brasaland",
    fecha_nacimiento: "Debes ser mayor de 18 años para registrarte en Brasa Points",
    acepta_terminos: "Debes aceptar los términos del programa Brasa Points para continuar"
  };

  const locationData = {
    Colombia: {
      Medellín: [
        "Brasaland El Poblado",
        "Brasaland Laureles",
        "Brasaland Envigado",
        "Brasaland Sabaneta"
      ],
      Bogotá: ["Brasaland Usaquén", "Brasaland Chapinero", "Brasaland Zona Rosa"],
      Cali: ["Brasaland Granada", "Brasaland Ciudad Jardín", "Brasaland Unicentro"]
    },
    "Estados Unidos": {
      Miami: ["Brasaland Brickell", "Brasaland Coral Gables"],
      Orlando: ["Brasaland Downtown", "Brasaland International Drive"]
    }
  };

  const addOption = (select, value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  };

  const isCheckbox = (field) => field && field.type === "checkbox";

  const setFieldStyles = (field, isValid) => {
    if (!field) {
      return;
    }

    if (isCheckbox(field)) {
      field.classList.remove("ring-2", "ring-red-500", "ring-green-500");
      if (isValid) {
        field.classList.add("ring-2", "ring-green-500");
      } else {
        field.classList.add("ring-2", "ring-red-500");
      }
      return;
    }

    field.classList.remove("border-stone-600", "border-red-500", "bg-red-50", "border-green-500", "bg-green-50", "text-stone-100", "text-stone-900");

    if (isValid) {
      field.classList.add("border-green-500", "bg-green-50", "text-stone-900");
      return;
    }

    field.classList.add("border-red-500", "bg-red-50", "text-stone-900");
  };

  const resetFieldStyles = (field) => {
    if (!field) {
      return;
    }

    if (isCheckbox(field)) {
      field.classList.remove("ring-2", "ring-red-500", "ring-green-500");
      return;
    }

    field.classList.remove("border-red-500", "bg-red-50", "border-green-500", "bg-green-50", "text-stone-900");
    field.classList.add("border-stone-600", "text-stone-100");
  };

  const showError = (fieldName, message) => {
    const field = fields[fieldName];
    const errorNode = document.getElementById(`error-${fieldName}`);

    if (!field || !errorNode) {
      return;
    }

    setFieldStyles(field, false);
    field.setAttribute("aria-invalid", "true");
    errorNode.textContent = message;
    errorNode.classList.remove("hidden");
  };

  const clearError = (fieldName) => {
    const field = fields[fieldName];
    const errorNode = document.getElementById(`error-${fieldName}`);

    if (!field || !errorNode) {
      return;
    }

    field.removeAttribute("aria-invalid");
    errorNode.textContent = "";
    errorNode.classList.add("hidden");
  };

  const validateFullName = (value) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return false;
    }
    return words.every((word) => word.length >= 2);
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const validatePhone = (value) => {
    const phone = value.trim();
    const startsWithCO = phone.startsWith("+57");
    const startsWithUS = phone.startsWith("+1");

    if (!startsWithCO && !startsWithUS) {
      return false;
    }

    const structureIsValid = /^\+(57|1)\s?[\d\s-]+$/.test(phone);
    if (!structureIsValid) {
      return false;
    }

    const allDigits = phone.replace(/\D/g, "");
    const codeLength = startsWithCO ? 2 : 1;
    const digitsAfterCode = allDigits.slice(codeLength);

    return digitsAfterCode.length >= 10;
  };

  const validateCountry = (value) => value === "Colombia" || value === "Estados Unidos";

  const validateCity = (country, city) => {
    if (!validateCountry(country) || !city) {
      return false;
    }

    const validCities = Object.keys(locationData[country] || {});
    return validCities.includes(city);
  };

  const validateFavoriteLocation = (country, city, favoriteLocation) => {
    if (!favoriteLocation) {
      return true;
    }

    if (!validateCity(country, city)) {
      return false;
    }

    const validLocations = locationData[country][city] || [];
    return validLocations.includes(favoriteLocation);
  };

  const validateBirthDate = (value) => {
    if (!value) {
      return false;
    }

    const birthDate = new Date(value);
    if (Number.isNaN(birthDate.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      return false;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age >= 18;
  };

  const populateCities = (country) => {
    if (!fields.ciudad || !fields.ubicacion_favorita) {
      return;
    }

    fields.ciudad.innerHTML = "";
    fields.ubicacion_favorita.innerHTML = "";

    if (!validateCountry(country)) {
      addOption(fields.ciudad, "", "Selecciona primero un país");
      fields.ciudad.disabled = true;

      addOption(fields.ubicacion_favorita, "", "Selecciona país y ciudad primero");
      fields.ubicacion_favorita.disabled = true;
      return;
    }

    addOption(fields.ciudad, "", "Selecciona una ciudad");
    Object.keys(locationData[country]).forEach((city) => addOption(fields.ciudad, city, city));
    fields.ciudad.disabled = false;

    addOption(fields.ubicacion_favorita, "", "Selecciona una ubicación (opcional)");
    fields.ubicacion_favorita.disabled = true;
  };

  const populateLocations = (country, city) => {
    if (!fields.ubicacion_favorita) {
      return;
    }

    fields.ubicacion_favorita.innerHTML = "";

    if (!validateCity(country, city)) {
      addOption(fields.ubicacion_favorita, "", "Selecciona país y ciudad primero");
      fields.ubicacion_favorita.disabled = true;
      return;
    }

    addOption(fields.ubicacion_favorita, "", "Selecciona una ubicación (opcional)");
    locationData[country][city].forEach((location) => addOption(fields.ubicacion_favorita, location, location));
    fields.ubicacion_favorita.disabled = false;
  };

  const validateField = (fieldName) => {
    const field = fields[fieldName];
    if (!field) {
      return true;
    }

    const countryValue = fields.pais ? fields.pais.value : "";
    const cityValue = fields.ciudad ? fields.ciudad.value : "";

    let isValid = true;

    if (fieldName === "nombre_completo") {
      isValid = validateFullName(field.value);
    }

    if (fieldName === "email") {
      isValid = validateEmail(field.value);
    }

    if (fieldName === "telefono") {
      isValid = validatePhone(field.value);
    }

    if (fieldName === "pais") {
      isValid = validateCountry(field.value);
    }

    if (fieldName === "ciudad") {
      isValid = validateCity(countryValue, field.value);
    }

    if (fieldName === "como_nos_conociste") {
      isValid = field.value.trim().length > 0;
    }

    if (fieldName === "fecha_nacimiento") {
      isValid = validateBirthDate(field.value);
    }

    if (fieldName === "acepta_terminos") {
      isValid = field.checked;
    }

    if (fieldName === "ubicacion_favorita") {
      isValid = validateFavoriteLocation(countryValue, cityValue, field.value);
      if (!isValid) {
        showError(fieldName, "La ubicación favorita seleccionada no coincide con tu país y ciudad");
        return false;
      }
      clearError(fieldName);
      if (field.value) {
        setFieldStyles(field, true);
      } else {
        resetFieldStyles(field);
      }
      return true;
    }

    if (!isValid) {
      showError(fieldName, ERROR_MESSAGES[fieldName]);
      return false;
    }

    clearError(fieldName);
    setFieldStyles(field, true);
    return true;
  };

  const clearSuccessMessage = () => {
    if (!successMessage) {
      return;
    }

    successMessage.textContent = "";
    successMessage.classList.add("hidden");
  };

  const showSuccessMessage = () => {
    if (!successMessage) {
      return;
    }

    successMessage.textContent = "¡Bienvenido a Brasa Points!\n\nTu registro ha sido exitoso. Recibirás un email de confirmación en los próximos minutos con los detalles de tu cuenta y cómo empezar a acumular puntos.\n\n¡Ya puedes disfrutar de tus beneficios en cualquiera de nuestras 14 ubicaciones!";
    successMessage.classList.remove("hidden");
    successMessage.classList.add("whitespace-pre-line");
    successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const attachLiveValidation = (fieldName, events) => {
    const field = fields[fieldName];
    if (!field) {
      return;
    }

    events.forEach((eventName) => {
      field.addEventListener(eventName, () => {
        validateField(fieldName);
      });
    });
  };

  populateCities(fields.pais ? fields.pais.value : "");

  if (fields.fecha_nacimiento) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    fields.fecha_nacimiento.max = maxDate.toISOString().split("T")[0];
  }

  if (fields.pais) {
    fields.pais.addEventListener("change", () => {
      populateCities(fields.pais.value);
      clearError("ciudad");
      clearError("ubicacion_favorita");
      if (fields.ciudad) {
        resetFieldStyles(fields.ciudad);
      }
      if (fields.ubicacion_favorita) {
        resetFieldStyles(fields.ubicacion_favorita);
      }
      validateField("pais");
    });
  }

  if (fields.ciudad) {
    fields.ciudad.addEventListener("change", () => {
      populateLocations(fields.pais ? fields.pais.value : "", fields.ciudad.value);
      clearError("ubicacion_favorita");
      if (fields.ubicacion_favorita) {
        resetFieldStyles(fields.ubicacion_favorita);
      }
      validateField("ciudad");
    });
  }

  if (fields.ubicacion_favorita) {
    fields.ubicacion_favorita.addEventListener("change", () => {
      validateField("ubicacion_favorita");
    });
  }

  attachLiveValidation("nombre_completo", ["input", "blur"]);
  attachLiveValidation("email", ["input", "blur"]);
  attachLiveValidation("telefono", ["input", "blur"]);
  attachLiveValidation("pais", ["blur"]);
  attachLiveValidation("ciudad", ["blur"]);
  attachLiveValidation("como_nos_conociste", ["change", "blur"]);
  attachLiveValidation("fecha_nacimiento", ["input", "blur", "change"]);
  attachLiveValidation("acepta_terminos", ["change", "blur"]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearSuccessMessage();

    const fieldsToValidate = [
      "nombre_completo",
      "email",
      "telefono",
      "pais",
      "ciudad",
      "ubicacion_favorita",
      "como_nos_conociste",
      "fecha_nacimiento",
      "acepta_terminos"
    ];

    let firstInvalidField = null;
    let formIsValid = true;

    fieldsToValidate.forEach((fieldName) => {
      const isFieldValid = validateField(fieldName);
      if (!isFieldValid) {
        formIsValid = false;
        if (!firstInvalidField) {
          firstInvalidField = fields[fieldName] || null;
        }
      }
    });

    if (!formIsValid) {
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    showSuccessMessage();
  });

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      Object.keys(fields).forEach((fieldName) => {
        clearError(fieldName);
        resetFieldStyles(fields[fieldName]);
      });

      populateCities("");
      clearSuccessMessage();
    });
  });
});
