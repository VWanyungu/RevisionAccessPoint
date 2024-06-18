let schoolSelect = document.getElementById('school')
let yearSelect = document.getElementById('year')
let departmentSelect = document.getElementById('department')
let unitSelect = document.getElementById('unit')
let warnBtn = document.getElementById('warn')

let schools = [
    {
        name: 'SCI',
        value: 'School of Computing and Informatics',
        departments: ["Computer Science","IT"]
    },
    {
        name: 'SEBE',
        value: 'School of Engineering and Built Environment',
        departments: ["Electrical and Communications Engineering"]
    },
]

let schoolDepUnits = [
    {
        school: 'SCI', //foreign key
        department: 'Computer_Science',
        units: [
            {
                year: 'Year_2.2',
                unitNames: [
                    'Data_structures_and_algorithms',
                    'Research_methods',
                    'Client_server_computing',
                    'Database_systems',
                    'Logic_programming',
                    'Principles_of_OS',
                    'Web_programming'
                ]
            }
        ]
    },
    {
        school: 'SEBE', //foreign key
        department: 'Electrical_and_Communications_Engineering',
        units: [
            {
                year: 'Year_2.2',
                unitNames: [
                    'Basic Electronics',
                    'Circuit Theory',
                    'Computer Programming',
                    'Electrical Machines',
                    'Material Science' ,
                    'Engineering Mathematics',
                    'Electrical Measurements',
                    'Thermodynamics',
                ]
            }
        ]
    }
]

schools.forEach(school => {
    schoolSelect.innerHTML += `
        <option value="${school.name}">${school.value}</option>
    `
    getDepartments(schoolSelect.value)
    // getUnits(year.value, schoolSelect.value, departmentSelect.value)
})

function getDepartments(schoolValue) {
    let school = schools.find(school => school.name === schoolValue)
    departmentSelect.innerHTML = ''
    school.departments.forEach(dep => {
        departmentSelect.innerHTML += `
            <option value="${dep.replaceAll(" ","_")}">${dep}</option>
        `
    })
}

function getUnits(yearValue,schoolValue, departmentValue) {
    unitSelect.innerHTML = ''
    let schoolDepUnit = schoolDepUnits.find(sdu => sdu.school === schoolValue && sdu.department === departmentValue)
    let unit = schoolDepUnit.units.find(unit => unit.year === yearValue)
    unit.unitNames.forEach(unit => {
        unitSelect.innerHTML += `
            <option value="${unit}">${unit.replaceAll("_"," ")}</option>
        `
    })
}

schoolSelect.addEventListener('change', ()=>{
    getDepartments(schoolSelect.value)
})

yearSelect.addEventListener('change', (e) => {
    if (yearSelect.value != '' && schoolSelect.value != '' && departmentSelect.value != '') {
        console.log(yearSelect.value, schoolSelect.value, departmentSelect.value)
        getUnits(yearSelect.value, schoolSelect.value, departmentSelect.value)
    }
})


