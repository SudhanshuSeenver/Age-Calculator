const maxLengthinput = {
  day: 2,
  month: 2,
  year: 4,
};

function easeOutQuad(t) {
  return t * (2 - t);
}

function easeOutCurve(t, p) {
  return 1 - Math.pow(1 - t, p);
}

function animateNumber(element, endValue, duration = 800) {
  const startTime = performance.now();

  function update(now) {
    const rawProgress = Math.min((now - startTime) / duration, 1);
    const progress = easeOutCurve(rawProgress, 3);

    const value = Math.floor(progress * endValue);
    element.textContent = value;

    if (rawProgress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const updateErrorMsg = (field) => {
  const parent = parentInput[field];
  const label = labelInput[field];
  const errorNode = errorFields[field];

  const hasError = errMsgDisplayed[field]?.length > 0;
  errorNode.textContent = errMsgDisplayed[field];

  parent.classList.toggle("border-color-red-400", hasError);
  label.classList.toggle("color-red-400", hasError);
  errorNode.classList.toggle("error-msg", hasError);
};

const dobContainer = document.querySelector(".dob-inputs");

const type = ["day", "month", "year"];

const calAgeText = type.reduce((obj, tp) => {
  obj[tp] = document.querySelector(`#calculated-${tp}s span`);
  return obj;
}, {});

const { parentInput, labelInput } = type.reduce(
  (acc, tp) => {
    const prt = dobContainer.querySelector(`[data-input-box="${tp}"]`);
    const lbl = prt.closest(".dob-input-holder").querySelector("label");
    acc.parentInput[tp] = prt;
    acc.labelInput[tp] = lbl;

    return acc;
  },
  { parentInput: {}, labelInput: {} }
);

const leapYear = (year) => {
  if (!year) return false;
  if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) return true;
  return false;
};

const validators = {
  day: (value, month, year) => {
    // console.log(month);
    switch (month) {
      case 2:
        // console.log(value <= (leapYear(year) ? 29 : 28));
        return value <= (leapYear(year) ? 29 : 28);
      case 4:
      case 5:
      case 9:
      case 11:
        return value <= 30;
      default:
        return value <= 31;
    }
  },

  month: (month) => month >= 0 && month <= 12,

  year: (day, month, year) => {
    const date = new Date();
    const currDay = date.getDate();
    const currMonth = date.getMonth() + 1;
    const currYear = date.getFullYear();
    if (year === currYear) {
      return day <= currDay && month <= currMonth;
    }
    return year <= currYear;
  },
};

const errorMessages = {
  day: "Must be a valid day",
  month: "Must be a valid month",
  year: "Must be in the past",
  empty: "This field is required",
};

const errMsgDisplayed = {
  day: "",
  month: "",
  year: "",
};

const validateFields = (field, dob) => {
  // console.log("!dob[field]", !dob[field], dob, field);
  if (!dob[field]) {
    errMsgDisplayed[field] = errorMessages["empty"];
    return;
  }
  // console.log("errMsgDisplayed[field]", errMsgDisplayed[field]);

  const validateArgs =
    field !== "month" ? type.map((tp) => dob[tp]) : [dob[field]];

  errMsgDisplayed[field] = validators[field](...validateArgs)
    ? ""
    : errorMessages[field];
};

const getDobObject = (values) => {
  return Object.fromEntries(
    type.map((key) => [key, Number(values[key].value)])
  );
};

const validateDOB = (typeId, values) => {
  const dob = getDobObject(values);

  switch (typeId) {
    case "day":
    case "month":
    case "year":
      validateFields(typeId, dob);
      break;
    default:
      type.forEach((typ) => validateFields(typ, dob));
  }
};

const typesRef = type.reduce((obj, key) => {
  obj[key] = document.getElementById(key);

  return obj;
}, {});

const errorFields = type.reduce((obj, key) => {
  obj[key] = document.querySelector(`[data-error="${key}"]`);
  return obj;
}, {});

dobContainer.addEventListener("input", (e) => {
  if (!e.target.matches(".dob-input")) return;

  const id = e.target.id;
  e.target.value = e.target.value.slice(0, maxLengthinput[id]);
});

const calculateAge = (dob) => {
  const { day, month, year } = dob;
  const date = new Date();

  const getDays = (m, y) => {
    return m == 2
      ? leapYear(y)
        ? 29
        : 28
      : [4, 6, 9, 11].includes(m)
      ? 30
      : 31;
  };

  const cal = { day: 0, month: 0, year: 0 };
  let currDay = date.getDate();
  let currMonth = date.getMonth() + 1;
  let currYear = date.getFullYear();

  if (day > currDay) {
    currMonth--;
    cal.day = getDays(currMonth, currYear) - day + currDay;
  } else {
    cal.day = currDay - day;
  }
  if (month > currMonth) {
    currYear--;
    cal.month = currMonth + 12 - month;
  } else {
    cal.month = currMonth - month;
  }

  cal.year = currYear - year;

  // console.log(cal)
  return cal;
};

const dobSubmit = (e) => {
  e.stopPropagation(); // fix typo

  validateDOB("all", typesRef);

  const hasErrors = Object.values(errMsgDisplayed).some(
    (msg) => msg.length > 0
  );
  // console.log(errMsgDisplayed);
  if (hasErrors) {
    type.forEach((tp) => {
      calAgeText[tp].classList.toggle("letter-spacing-8", true);
      calAgeText[tp].classList.toggle("pd-r-8", false);
      calAgeText[tp].textContent = "--";
      // console.log(tp, parentInput[tp]);

      updateErrorMsg(tp);
    });

    return;
  }

  const dob = getDobObject(typesRef);

  const age = calculateAge(dob);

  console.log(age);

  type.forEach((tp) => {
    calAgeText[tp].classList.toggle("letter-spacing-8", false);
    calAgeText[tp].classList.toggle("pd-r-8", true);
    animateNumber(calAgeText[tp], age[tp]);
    // calAgeText[tp].textContent = age[tp];
  });
};

const submitBtnEle = document.querySelector(".submit-btn");
submitBtnEle.addEventListener("click", dobSubmit);
// console.log(parentInput);
dobContainer.addEventListener("focusin", (e) => {
  if (!e.target.matches(".dob-input")) return;
  // console.log(e.target.id);
  const field = e.target.id;
  const parent = parentInput[field];
  const label = labelInput[field];
  label.classList.remove("color-red-400");
  parent.classList.remove("border-color-red-400");
  errorFields[field].classList.add("display-none");
  submitBtnEle.classList.remove("background-purple");
  submitBtnEle.classList.add("background-black");
});

dobContainer.addEventListener("focusout", (e) => {
  if (!e.target.matches(".dob-input")) return;

  const field = e.target.id;

  errorFields[field].classList.remove("display-none");

  validateDOB(field, typesRef);

  updateErrorMsg(field);

  errorFields[field].textContent = errMsgDisplayed[field];
  submitBtnEle.classList.add("background-purple");
  submitBtnEle.classList.remove("background-black");
});

dobContainer.addEventListener("click", (e) => {
  const box = e.target.closest("[data-input-box]");
  if (!box) return;

  box.querySelector("input")?.focus();
});
