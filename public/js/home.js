let schoolSelect = document.getElementById("school");
let yearSelect = document.getElementById("year");
let departmentSelect = document.getElementById("department");
let unitSelect = document.getElementById("unit");
let warnBtn = document.getElementById("warn");
let searchBtn = document.getElementById("searchBtn");
let searchBtnTxt = document.querySelector("#searchBtn h6");
let loadDiv = document.querySelector(".loadDivHome");
let univLoad = document.getElementById("hide");

searchBtn.addEventListener("click", () => {
  searchBtnTxt.style.display = "none";
  loadDiv.style.display = "block";
});

window.onload = () => {
  console.log("All elements loaded");
  univLoad.style.display = "none";
};

let schools = [
  {
    name: "SCI",
    value: "School of Computing and Informatics",
    departments: ["Computer Science", "IT"],
  },
  {
    name: "SEBE",
    value: "School of Engineering and Built Environment",
    departments: ["Electrical and Communications Engineering"],
  },
];

let schoolDepUnits = [
  {
    school: "SCI",
    department: "Computer_Science",
    units: [
      {
        year: "Year_1.1",
        unitNames: [
          "Communication Skills",
          "Differential Calculus",
          "Discrete Structures",
          "Electrical Principles",
          "Fundamentals Of Computing",
          "Introduction To Programming",
          "Quantitative Skills 1",
        ],
      },
      {
        year: "Year_1.2",
        unitNames: [
          "Discrete Structures II",
          "Electronics",
          "HIV and AIDS Prevention and Management",
          "Integral Calculus",
          "Introduction to Internet Technologies",
          "Object Oriented Programming I",
          "Procedural Programming",
          "Quantitative Skills II",
        ],
      },
      {
        year: "Year_2.1",
        unitNames: [
          "Computer Organization and Architecture",
          "Data Communication Systems",
          "Introduction to Artificial Intelligence",
          "Object Oriented Programming",
          "Probability and Statistics",
          "System Anaysis and design",
        ],
      },
      {
        year: "Year_2.2",
        unitNames: [
          "Data structures and algorithms",
          "Research methods",
          "Client server computing",
          "Database systems",
          "Logic programming",
          "Principles of OS",
          "Web programming",
        ],
      },
      {
        year: "Year_2.3",
        unitNames: ["Database"],
      },
      {
        year: "Year_3.1",
        unitNames: [
          "Advanced Java",
          "Automata Theory",
          "Computer Networks",
          "Database II",
          "Design and Analysis Algorithms",
          "Network Programming",
          "Software Engineering",
        ],
      },
      {
        year: "Year_3.2",
        unitNames: [
          "Computer Graphics",
          "Human Computer Interface",
          "Generic Programming",
          "Applied Cryptography",
          "Computer Systems Security",
          "Compiler Design",
        ],
      },
      {
        year: "Year_4.1",
        unitNames: [
          "Computer Forensics",
          "Database Management",
          "Distributed Systems",
          "Machine Learning",
          "Management of Information Systems",
          "Project",
          "Software Project Management",
        ],
      },
    ],
  },
  {
    school: "SEBE",
    department: "Electrical_and_Communications_Engineering",
    units: [
      {
        year: "Year_2.2",
        unitNames: [
          "Basic Electronics",
          "Circuit Theory",
          "Computer Programming",
          "Electrical Machines 1",
          "Material Science",
          "Engineering Mathematics 2",
          "Electrical Measurements 1",
          "Thermodynamics",
        ],
      },
      {
        year: "Year_2.3",
        unitNames: ["Workshop Practise"],
      },
    ],
  },
];

schools.forEach((school) => {
  schoolSelect.innerHTML += `
        <option value="${school.name}">${school.value}</option>
    `;
  getDepartments(schoolSelect.value);
  getUnits(year.value, schoolSelect.value, departmentSelect.value);
});

function getDepartments(schoolValue) {
  let school = schools.find((school) => school.name === schoolValue);
  departmentSelect.innerHTML = "";
  school.departments.forEach((dep) => {
    departmentSelect.innerHTML += `
            <option value="${dep.replaceAll(" ", "_")}">${dep}</option>
        `;
  });
}

function getUnits(yearValue, schoolValue, departmentValue) {
  unitSelect.innerHTML = "";

  let schoolDepUnit = schoolDepUnits.find(
    (sdu) => sdu.school === schoolValue && sdu.department === departmentValue
  );

  let unit = schoolDepUnit.units.find((unit) => unit.year === yearValue);

  unit.unitNames.forEach((unit) => {
    unitSelect.innerHTML += `
            <option value="${unit.replaceAll(" ", "_")}">${unit}</option>
        `;
  });
}

schoolSelect.addEventListener("change", () => {
  getDepartments(schoolSelect.value);
  getUnits(yearSelect.value, schoolSelect.value, departmentSelect.value);
});

departmentSelect.addEventListener("change", () => {
  if (
    yearSelect.value != "" &&
    schoolSelect.value != "" &&
    departmentSelect.value != ""
  ) {
    console.log(yearSelect.value, schoolSelect.value, departmentSelect.value);
    getUnits(yearSelect.value, schoolSelect.value, departmentSelect.value);
  }
});

yearSelect.addEventListener("change", (e) => {
  if (
    yearSelect.value != "" &&
    schoolSelect.value != "" &&
    departmentSelect.value != ""
  ) {
    console.log(yearSelect.value, schoolSelect.value, departmentSelect.value);
    getUnits(yearSelect.value, schoolSelect.value, departmentSelect.value);
  }
});
