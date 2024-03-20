let schoolSelect = document.getElementById('school')
let yearSelect = document.getElementById('year')
let departmentSelect = document.getElementById('department')
let unitSelect = document.getElementById('unit')
let warnBtn = document.getElementById('warn')

if (schoolSelect.value == 'SCI') {
    departmentSelect.innerHTML = `
        <option value="Computer_Science" default>Computer Science</option>
        <option value="Information Technology">Information Technology</option>
    ` 
}

schoolSelect.addEventListener('change', (e) => {
    if (schoolSelect.value == 'SCI') {
        departmentSelect.innerHTML = `
            <option value="Computer_Science" default>Computer Science</option>
        ` 
    } else if(schoolSelect.value == 'SOBE') {
        departmentSelect.innerHTML = `
            
        ` 
    }
})

yearSelect.addEventListener('change', (e) => {
    if (yearSelect.value == 'Year_2.2' && schoolSelect.value == 'SCI' && departmentSelect.value == 'Computer_Science') {
        unitSelect.innerHTML = `
            <option value="Data_structures_and_algorithms" default>Data strcutures and algorithms</option>
            <option value="Research_methods">Research methods</option>
            <option value="Client_server_computing">Client server computing</option>
            <option value="Database_systems">Database systems</option>
            <option value="Logic_programming">Logic programming</option>
            <option value="Principles_of_OS">Principles of Operating Systems</option>
            <option value="Web_programming">Web programming</option>
        ` 
    } 
})


